import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ascendingByValue,
  electronegativitySummary,
  fallingGroups,
  isMeasured,
  missingTrail,
  missingValues,
  periodSequence,
  risingPeriods,
} from "../../scripts/lib/electronegativity.js";
import { buildContext } from "../../tools/build-context.js";

const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);

test("a value is a number, and nothing else is a measurement", () => {
  assert.equal(isMeasured(bySymbol("F")), true);
  assert.equal(isMeasured(bySymbol("He")), false, "helium has no Pauling value");
  assert.equal(isMeasured({ electronegativity: "3.98" }), false, "a string is not a measurement");
  assert.equal(isMeasured({ electronegativity: Number.NaN }), false);
  assert.equal(isMeasured({}), false);
});

test("the measured elements are 95 of the 118, in ascending order", () => {
  const ascending = ascendingByValue(elements);
  const values = ascending.map((element) => element.electronegativity);

  assert.equal(ascending.length, 95);
  assert.deepEqual(values, [...values].sort((one, other) => one - other));
  assert.equal(ascending[0].symbol, "Fr", "the weakest pull is francium's");
  assert.equal(ascending.at(-1).symbol, "F", "the strongest is fluorine's");
  assert.equal(values[0], 0.7);
  assert.equal(values.at(-1), 3.98);
});

test("a period's sequence is the order the table draws it in", () => {
  const second = periodSequence(elements, 2).map((element) => element.symbol);
  const third = periodSequence(elements, 3).map((element) => element.symbol);

  assert.deepEqual(second, ["Li", "Be", "B", "C", "N", "O", "F"]);
  assert.deepEqual(third, ["Na", "Mg", "Al", "Si", "P", "S", "Cl"]);

  // The detached f rows belong to no column, so lanthanum is drawn nowhere a reader reads across.
  const sixth = periodSequence(elements, 6).map((element) => element.symbol);

  assert.equal(sixth.includes("La"), false, "a detached row was read as part of the period");
  assert.equal(sixth[0], "Cs");
});

test("two periods rise at every step, and the endpoints are the period's own", () => {
  const rising = risingPeriods(elements);

  assert.deepEqual(
    rising.map(({ period }) => period),
    [2, 3],
  );
  assert.equal(rising[0].row[0].symbol, "Li");
  assert.equal(rising[0].row.at(-1).symbol, "F");
  assert.equal(rising[1].row[0].symbol, "Na");
  assert.equal(rising[1].row.at(-1).symbol, "Cl");
});

test("six of the sixteen checkable groups never rise going down", () => {
  assert.deepEqual(fallingGroups(elements), { checked: 16, falling: 6 });
});

test("the reckoning that gives the sentence its numbers holds together", () => {
  const { measured, missing, before, trail } = electronegativitySummary(elements);

  assert.equal(measured, 95);
  assert.equal(missing, 23);
  assert.equal(measured + missing, elements.length);
  assert.equal(trail.length, 15, "the unbroken run of unmeasured elements at the end of the table");
  assert.equal(trail[0].symbol, "Rf");
  assert.equal(trail.at(-1).symbol, "Og");
  assert.equal(before.length, 8, "the unmeasured elements above the tail");
  assert.deepEqual(
    before.map((element) => element.symbol),
    ["He", "Ne", "Ar", "Pm", "Eu", "Tb", "Yb", "Rn"],
  );
  assert.equal(missingTrail(elements).length, trail.length);
});

test("an element with a value above the tail ends the tail", () => {
  const fixture = [
    { symbol: "A", electronegativity: 1 },
    { symbol: "B", electronegativity: null },
    { symbol: "C", electronegativity: 2 },
    { symbol: "D", electronegativity: null },
  ];
  const { missing, before, trail } = missingValues(fixture);

  assert.deepEqual(missing.map((element) => element.symbol), ["B", "D"]);
  assert.deepEqual(trail.map((element) => element.symbol), ["D"]);
  assert.deepEqual(before.map((element) => element.symbol), ["B"]);
  assert.deepEqual(missingTrail(fixture).map((element) => element.symbol), ["D"]);
});

test("nothing measured is a shape the summary can hold", () => {
  const summary = electronegativitySummary([bySymbol("He"), bySymbol("Ne")]);

  assert.equal(summary.measured, 0);
  assert.equal(summary.missing, 2);
  assert.equal(summary.low, null);
  assert.equal(summary.high, null);
  assert.deepEqual(summary.risingPeriods, []);
  assert.deepEqual(summary.groups, { checked: 0, falling: 0 });
  assert.equal(summary.trail.length, 2, "with nothing measured the tail is the whole table");
});
