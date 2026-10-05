import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext } from "../../tools/build-context.js";
import { cardMeta, elementCard, elementCards } from "../../scripts/components/element-card.js";
import { UNKNOWN } from "../../scripts/lib/format.js";

const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);
const categoryOf = (element) =>
  context.categories.find((category) => category.slug === element.category) ?? null;
const options = (element) => ({ element, category: categoryOf(element), units: context.units });

test("a card is a link to the element, named by the same three facts a tile is", () => {
  const card = elementCard(options(bySymbol("H")));

  assert.match(card, /<li class="card"[^>]*data-element-card/);
  assert.match(card, /href="\/elements\/hydrogen\/"/);
  assert.match(card, /aria-label="Hydrogen, symbol H, atomic number 1"/);
  assert.match(card, /<span class="card__z">1<\/span>/);
  assert.match(card, /<span class="card__sym">H<\/span>/);
});

test("a card says the group's name, not its slug, and carries the key it is painted by", () => {
  const card = elementCard(options(bySymbol("Fe")));

  assert.match(card, /data-key="transition-metals"/);
  assert.match(card, /<span class="card__group">Transition metal<\/span>/);
  assert.equal(card.includes("transition-metals</span>"), false, "the slug reached the page");
});

test("the weight is the record's own, with the unit the units data gives it, and the state is capitalised", () => {
  const card = elementCard(options(bySymbol("H")));

  assert.ok(
    card.includes('<span class="card__facts">1.008\u00a0u · Gas</span>'),
    "the weight keeps the unit the units data gives it, joined by the formatter's own space",
  );
  assert.match(card, /data-name="hydrogen"/);
  assert.match(card, /data-symbol="h"/);
  assert.match(card, /data-atomic-number="1"/);
});

test("a missing weight keeps its place and says so, rather than printing a bare number", () => {
  const iron = { ...bySymbol("Fe"), atomicWeight: null };
  const meta = cardMeta({ element: iron, category: categoryOf(iron), units: context.units });

  assert.match(meta, new RegExp(`${UNKNOWN} · Solid`));
});

test("every element becomes one card, in the order it arrives in", () => {
  const cards = elementCards({ elements, categories: context.categories, units: context.units });

  assert.equal((cards.match(/data-element-card/g) ?? []).length, 118);
  assert.ok(
    cards.startsWith('<li class="card" data-element-card data-name="hydrogen"'),
    "the first card is hydrogen",
  );

  const order = [...cards.matchAll(/data-atomic-number="(\d+)"/g)].map(([, number]) => Number(number));
  assert.deepEqual(order, elements.map((element) => element.atomicNumber));
});

test("an element with no category record still gets a card, saying it is unknown", () => {
  const card = elementCard({ element: bySymbol("H"), category: null, units: context.units });

  assert.ok(card.includes(`<span class="card__group">${UNKNOWN}</span>`));
});
