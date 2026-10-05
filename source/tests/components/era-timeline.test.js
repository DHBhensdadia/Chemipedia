import { test } from "node:test";
import assert from "node:assert/strict";

import { ERAS, UNDATED, eraGroups } from "../../scripts/lib/discovery.js";
import { buildContext } from "../../tools/build-context.js";
import {
  UNRECORDED,
  eraCard,
  eraElementChip,
  eraRangeLine,
  eraTimeline,
} from "../../scripts/components/era-timeline.js";

const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);
const groups = eraGroups(elements);
const group = (key) => groups.find((candidate) => candidate.key === key);

/** The blurbs the evolution page passes in, so a card can be rendered without the page module. */
const BLURBS = Object.fromEntries(ERAS.map((era) => [era.key, `The ${era.label} in one sentence.`]));

test("a range line reads as the members' own years and their count", () => {
  assert.equal(eraRangeLine({ elements: group("18th-century").elements }), "1735\u20131798 · 20 elements");
  assert.equal(eraRangeLine({ elements: group("21st-century").elements }), "2000\u20132010 · 5 elements");
  assert.equal(eraRangeLine({ elements: group(UNDATED).elements }), "no recorded year · 13 elements");
  assert.equal(eraRangeLine({ elements: [bySymbol("P")] }), "1669 · 1 element");
  assert.equal(eraRangeLine({ elements: [] }), "no recorded year · 0 elements");
});

test("a chip carries the symbol, the year and both facts in its name", () => {
  const chip = eraElementChip(bySymbol("V"), "19th-century");

  assert.match(chip, /href="\/elements\/vanadium\/"/);
  assert.match(chip, /data-key="19th-century"/);
  assert.match(chip, /aria-label="Vanadium, discovered in 1801"/);
  assert.match(chip, /<span class="era__sym" aria-hidden="true">V<\/span>/);
  assert.match(chip, /<span class="era__year">1801<\/span>/);
});

test("a chip with no year says so rather than printing nothing to look at", () => {
  const chip = eraElementChip(bySymbol("Fe"), UNDATED);

  assert.match(chip, /aria-label="Iron, no recorded year"/);
  assert.doesNotMatch(chip, /era__year/, "a chip with no year has no year span");
  assert.match(chip, /<span class="era__sym" aria-hidden="true">Fe<\/span>/);
  assert.equal(UNRECORDED, "no recorded year");
});

test("a card is a heading, a range, a sentence and its members", () => {
  const card = eraCard({
    era: group("19th-century"),
    elements: group("19th-century").elements,
    blurb: "Electrolysis opened the floodgates.",
  });

  assert.match(card, /<li class="era">/);
  assert.match(card, /<h3 class="era__title">19th century<\/h3>/);
  assert.match(card, /<p class="era__range">1801\u20131899 · 47 elements<\/p>/);
  assert.match(card, /<p class="era__note">Electrolysis opened the floodgates\.<\/p>/);
  assert.equal((card.match(/class="era__element"/g) ?? []).length, 47);
});

test("the timeline is an ordered list in the discovery colour mode", () => {
  const markup = eraTimeline({ groups, blurbs: BLURBS });

  assert.match(markup, /^<ol class="eras" data-mode="discovery">/);
  assert.match(markup, /<\/ol>$/);
  assert.match(markup, /<h3 class="era__title">Before 1700<\/h3>/);
  assert.match(markup, /<h3 class="era__title">Undated<\/h3>/);
  assert.equal((markup.match(/class="era"/g) ?? []).length, 6);
});

test("every element is in exactly one card, and the undated card is last", () => {
  const markup = eraTimeline({ groups, blurbs: BLURBS });
  const slugs = [...markup.matchAll(/href="\/elements\/([a-z-]+)\/"/g)].map(([, slug]) => slug);

  assert.equal(slugs.length, elements.length, "a card holds an element twice or misses one");
  assert.deepEqual([...new Set(slugs)].sort(), elements.map((element) => element.slug).sort());

  const order = [...markup.matchAll(/<h3 class="era__title">([^<]+)<\/h3>/g)].map(([, title]) => title);

  assert.deepEqual(order, [
    "Before 1700",
    "18th century",
    "19th century",
    "20th century",
    "21st century",
    "Undated",
  ]);
});

test("an era with nothing in it gets no card, and one with members must have a sentence", () => {
  const empty = eraGroups([bySymbol("H")]);
  const markup = eraTimeline({ groups: empty, blurbs: BLURBS });

  assert.equal(
    (markup.match(/class="era"/g) ?? []).length,
    1,
    "only the eighteenth century has members",
  );
  assert.match(markup, /<h3 class="era__title">18th century<\/h3>/);
  assert.equal(eraTimeline({ groups: eraGroups([]), blurbs: BLURBS }), "", "an empty table draws nothing");

  assert.throws(
    () => eraTimeline({ groups, blurbs: {} }),
    /before-1700 era has members but no sentence/,
  );
  assert.throws(
    () => eraTimeline({ groups, blurbs: { ...BLURBS, [UNDATED]: "" } }),
    /undated era has members but no sentence/,
  );
});

test("the timeline writes no colour of its own", () => {
  assert.doesNotMatch(eraTimeline({ groups, blurbs: BLURBS }), /#[0-9a-f]{6}/i);
});
