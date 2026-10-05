import { test } from "node:test";
import assert from "node:assert/strict";

import { legendChips } from "../../scripts/components/legend-chips.js";

const items = [
  { key: "alkali-metals", label: "Alkali metal", count: 6 },
  { key: "halogens", label: "Halogen", count: 5, pressed: true },
  { key: "noble-gases", label: "Noble gas", count: 7, href: "/element-groups/noble-gases/" },
];

test("a chip is a button that reports whether it is pressed", () => {
  const markup = legendChips({ items });

  assert.match(markup, /<ul class="legend" data-pt-legend aria-label="Colour key">/);
  assert.match(
    markup,
    /<button class="chip" type="button" data-key="alkali-metals" data-pt-highlight="alkali-metals" aria-pressed="false">/,
  );
  assert.match(markup, /<span class="chip__label">Alkali metal<\/span><span class="chip__n">6<\/span>/);
});

test("a pressed chip is active and says so", () => {
  const markup = legendChips({ items });

  assert.match(markup, /class="chip is-active"/);
  assert.match(markup, /aria-pressed="true"/);
});

test("a chip with a destination is a link, and has nothing to press", () => {
  const markup = legendChips({ items });

  assert.match(
    markup,
    /<a class="chip" href="\/element-groups\/noble-gases\/" data-key="noble-gases" data-pt-highlight="noble-gases">/,
  );
  assert.equal((markup.match(/aria-pressed/g) ?? []).length, 2, "only the buttons can be pressed");
});

test("the legend's own name says what it is a key to", () => {
  const markup = legendChips({ items, label: "Element group colour key" });

  assert.match(markup, /aria-label="Element group colour key"/);
});

test("a chip carries no colour of its own, only its key", () => {
  assert.doesNotMatch(legendChips({ items }), /#[0-9a-f]{3,6}/i);
});

test("an empty legend is nothing at all rather than an empty list", () => {
  assert.equal(legendChips({ items: [] }), "");
});
