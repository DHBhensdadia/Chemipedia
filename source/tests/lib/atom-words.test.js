import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { atomSentence, chargeSentence, countsFor, countsSentence, plural } from "../../scripts/lib/atom-words.js";
import { neutronsFor } from "../../scripts/lib/atom-model.js";

/** The records the site publishes, because a sentence about an element should name the real one. */
const records = JSON.parse(await readFile(new URL("../../data/elements.json", import.meta.url), "utf8"));
const record = (atomicNumber) => records.find((entry) => entry.atomicNumber === atomicNumber);

test("a count is written in the singular only when there is one of it", () => {
  assert.equal(plural(0, "proton"), "0 protons");
  assert.equal(plural(1, "neutron"), "1 neutron");
  assert.equal(plural(2, "electron"), "2 electrons");
});

test("the counts an element opens on are its protons, its weight's neutrons and its electrons", () => {
  assert.deepEqual(countsFor(record(6)), { protons: 6, neutrons: 6, electrons: 6 });
  assert.deepEqual(countsFor(record(92)), { protons: 92, neutrons: 146, electrons: 92 });

  for (const entry of records) {
    const counts = countsFor(entry);

    assert.equal(counts.protons, entry.atomicNumber);
    assert.equal(counts.electrons, entry.atomicNumber, "an element opens neutral");
    assert.ok(counts.neutrons >= 0, `${entry.symbol} opens with a negative neutron count`);
  }
});

test("copper is the element the rule gets wrong, and the words say so honestly", () => {
  // The rounded weight is not an isotope for every element: copper's rounds to 64, which is neither
  // Cu-63's 34 neutrons nor Cu-65's 36. The page and the guide open on it all the same, and the count
  // they open on is the weight's, not a claim about which isotope the element is.
  assert.equal(neutronsFor(record(29)), 35);
  assert.deepEqual(countsFor(record(29)), { protons: 29, neutrons: 35, electrons: 29 });
  assert.equal(atomSentence(record(29), countsFor(record(29))), "Copper-64: 29 protons, 35 neutrons and 29 electrons, with no charge.");
});

test("the three counts are a sentence, and the charge is a sentence of its own", () => {
  assert.equal(countsSentence({ protons: 6, neutrons: 6, electrons: 6 }), "6 protons, 6 neutrons and 6 electrons");
  assert.equal(chargeSentence({ protons: 6, neutrons: 6, electrons: 6 }), "no charge");
  assert.equal(chargeSentence({ protons: 7, neutrons: 6, electrons: 0 }), "a charge of +7");
  assert.equal(chargeSentence({ protons: 3, neutrons: 4, electrons: 6 }), "a charge of \u22123");
});

test("an atom whose counts name an element is named, and one that names nothing says so", () => {
  assert.equal(
    atomSentence(record(6), { protons: 6, neutrons: 6, electrons: 6 }),
    "Carbon-12: 6 protons, 6 neutrons and 6 electrons, with no charge.",
  );

  const nameless = atomSentence(null, { protons: 119, neutrons: 176, electrons: 119 });

  assert.match(nameless, /^Not an element/);
  assert.match(nameless, /no element has 119 protons/);
  assert.match(nameless, /with no charge\.$/);

  // And a count no element has is never given an element's name: the sentence names no symbol.
  for (const protons of [0, 119, 200]) {
    assert.doesNotMatch(atomSentence(null, { protons, neutrons: 0, electrons: 0 }), /Carbon|Uranium/);
  }
});
