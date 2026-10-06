import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext } from "../../tools/build-context.js";
import { barRankRow, barRanking, barRatio, domainOf, hasValue } from "../../scripts/components/bar-ranking.js";
import { compareByField } from "../../scripts/data/elements-repository.js";

const context = await buildContext();
const melting = context.elements.filter((element) => element.meltingPoint !== null);
const ranked = (field) => [...context.elements].sort(compareByField(field));

test("a ratio is where a value sits between the domain's two ends", () => {
  const domain = { min: 0, max: 10 };

  assert.equal(barRatio(0, domain), 0);
  assert.equal(barRatio(5, domain), 0.5);
  assert.equal(barRatio(10, domain), 1);
});

test("a value outside the domain is clamped rather than drawn past the track", () => {
  assert.equal(barRatio(-40, { min: 0, max: 10 }), 0);
  assert.equal(barRatio(99, { min: 0, max: 10 }), 1);
});

test("a domain with no width puts everything at the top, and a missing value at nothing", () => {
  assert.equal(barRatio(7, { min: 7, max: 7 }), 1);
  assert.equal(barRatio(null, { min: 0, max: 10 }), 0);
  assert.equal(barRatio(5, null), 0);
});

test("the domain ignores what the source does not know, and keeps a zero", () => {
  const records = [
    { meltingPoint: 4 },
    { meltingPoint: null },
    { meltingPoint: 0 },
  ];

  assert.deepEqual(domainOf(records, "meltingPoint"), { min: 0, max: 4 });
  assert.equal(hasValue(records[2], "meltingPoint"), true, "zero is a measurement, not a gap");
  assert.equal(hasValue(records[1], "meltingPoint"), false);
  assert.equal(domainOf(records.map(() => ({ meltingPoint: null })), "meltingPoint"), null);
});

test("a row is the place, the element, the bar and the value, and the bar carries the ratio", () => {
  const row = barRankRow({
    element: context.elements[0],
    field: "meltingPoint",
    units: context.units,
    domain: { min: -272.2, max: 3549.85 },
    place: 1,
  });

  // Hydrogen is twelve degrees above the bottom of the scale, so it has a short bar and not none.
  assert.match(row, /<li class="rank" data-key="non-metals" data-ratio="0\.0034">/);
  assert.match(row, /class="rank__place" aria-hidden="true">1<\/span>/);
  assert.match(row, /href="\/elements\/hydrogen\/"/);
  assert.match(row, /<span class="rank__sym">H<\/span>/);
  assert.match(row, /<span class="rank__name">Hydrogen<\/span>/);
  assert.match(row, /<span class="rank__z">1<\/span>/);
  assert.doesNotMatch(row, /aria-label=/, "the element's link is named by what the row shows");
  assert.ok(row.includes('<span class="rank__value">-259.34\u00a0°C</span>'));
  assert.match(row, /style="--ratio:0\.0034"/);
});

test("an element with no measurement keeps its row, gets no place and no bar, and says so", () => {
  const ruthefordium = context.elements.find((element) => element.symbol === "Rf");
  const row = barRankRow({
    element: ruthefordium,
    field: "meltingPoint",
    units: context.units,
    domain: { min: -272.2, max: 3549.85 },
    place: null,
  });

  assert.match(row, /class="rank rank--unknown"/);
  assert.match(row, /class="rank__value">Unknown<\/span>/);
  assert.equal(row.includes("rank__fill"), false, "an unmeasured element gets no bar");
  assert.equal(row.includes("rank__place\" aria-hidden=\"true\"></span>"), true);
});

test("the rows follow the order they arrive in, numbering the measured ones as they go", () => {
  const rows = barRanking({
    elements: ranked("meltingPoint"),
    field: "meltingPoint",
    units: context.units,
  });
  const places = [...rows.matchAll(/class="rank__place" aria-hidden="true">([^<]*)<\/span>/g)].map(
    ([, place]) => place,
  );

  assert.equal(places.length, 118, "one row per element");
  assert.deepEqual(places.slice(0, 3), ["1", "2", "3"]);
  assert.equal(places[102], "103", "the last measured element is the hundred and third");
  assert.deepEqual(places.slice(103, 108), ["", "", "", "", ""], "the unmeasured ones are unplaced");
  assert.equal(rows.match(/rank--unknown/g).length, 15);
});

test("the bar of the lowest value is still drawn, and the highest runs the full track", () => {
  const rows = barRanking({
    elements: ranked("meltingPoint").filter((element) => element.meltingPoint !== null),
    field: "meltingPoint",
    units: context.units,
  });
  const ratios = [...rows.matchAll(/data-ratio="([\d.]+)"/g)].map(([, ratio]) => Number(ratio));

  assert.equal(ratios.length, melting.length);
  assert.equal(ratios[0], 0, "the lowest melting point sits at the start of the scale");
  assert.equal(ratios.at(-1), 1, "the highest runs the whole track");
});
