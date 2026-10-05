import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext } from "../../tools/build-context.js";
import { FAQ_FIELDS, faqBlock, faqEntries } from "../../scripts/components/faq-block.js";
import { propertyValues } from "../../scripts/components/property-list.js";
import { UNKNOWN } from "../../scripts/lib/format.js";

const context = await buildContext();
const byNumber = (atomicNumber) =>
  context.elements.find((element) => element.atomicNumber === atomicNumber);
const options = { units: context.units, categories: context.categories };

/** The label the property panel gives each field the FAQ can ask about. */
const PANEL_LABELS = {
  meltingPoint: "Melting point",
  boilingPoint: "Boiling point",
  electronegativity: "Electronegativity",
  heatOfVaporization: "Heat of vaporization",
  heatOfFusion: "Heat of fusion",
};

test("the questions are asked in the declared order, for the element they are about", () => {
  const entries = faqEntries(byNumber(1), options);

  assert.deepEqual(
    entries.map((entry) => entry.question),
    [
      "What is the melting point of Hydrogen?",
      "What is the boiling point of Hydrogen?",
      "What is the electronegativity of Hydrogen?",
      "What is the heat of vaporization of Hydrogen?",
    ],
    "hydrogen's heat of fusion is unrecorded, so that question is left out rather than answered Unknown",
  );
});

test("every answer is the property panel's own value, not a second copy of it", () => {
  for (const atomicNumber of [1, 26, 92, 118]) {
    const element = byNumber(atomicNumber);
    const values = propertyValues(element, options);

    for (const entry of faqEntries(element, options)) {
      const field = FAQ_FIELDS.find((candidate) => candidate.ask(element.name) === entry.question);
      const label = PANEL_LABELS[field.field];

      assert.equal(
        entry.answer,
        values.get(label),
        `${element.symbol}'s ${label} disagrees between the FAQ and the panel`,
      );
    }
  }
});

test("an unknown value is left out, not answered with the word for not knowing", () => {
  const element = {
    name: "Bromine",
    meltingPoint: -7.2,
    boilingPoint: null,
    electronegativity: null,
    heatOfVaporization: null,
    heatOfFusion: null,
  };

  const entries = faqEntries(element, options);

  assert.equal(entries.length, 1);
  assert.equal(entries[0].question, "What is the melting point of Bromine?");
  assert.equal(entries.some((entry) => entry.answer === UNKNOWN), false);
});

test("an element with nothing to answer renders no block at all", () => {
  const empty = { name: "Unobtainium" };

  assert.deepEqual(faqEntries(empty, options), []);
  assert.equal(faqBlock({ element: empty, units: context.units }), "");
});

test("the block is a titled section with one row per question", () => {
  const markup = faqBlock({ element: byNumber(26), units: context.units });

  assert.match(markup, /<section class="faq" aria-labelledby="faq-title">/);
  assert.match(markup, /<h2 class="faq__title" id="faq-title">Questions about Iron<\/h2>/);
  assert.equal([...markup.matchAll(/class="faq__row"/g)].length, faqEntries(byNumber(26), options).length);
});

test("a question and its answer are escaped before they reach the page", () => {
  const element = { name: 'X" & <b>', meltingPoint: 1 };

  const markup = faqBlock({ element, units: context.units });

  assert.ok(markup.includes("&quot; &amp; &lt;b&gt;"));
  assert.equal(markup.includes("<b>"), false);
});
