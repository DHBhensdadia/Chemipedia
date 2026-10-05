import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext } from "../../tools/build-context.js";
import { rankingPageValues, rankedElements } from "../../scripts/pages/ranking.js";
import { routes } from "../../scripts/router/routes.js";

const context = await buildContext();
const elements = context.elements;
const ranked = (field) => rankedElements(elements, { field });
const routeFor = (path) => routes.find((route) => route.path === path);

test("both rankings are declared with the field they rank and the sheets they use", () => {
  const melting = routeFor("/properties/melting-point/");
  const boiling = routeFor("/properties/boiling-point/");

  assert.deepEqual(melting.ranking, { field: "meltingPoint", direction: "ascending" });
  assert.deepEqual(boiling.ranking, { field: "boilingPoint", direction: "ascending" });

  for (const route of [melting, boiling]) {
    assert.deepEqual(route.styles, [
      "styles/components/periodic-table.css",
      "styles/components/bar-ranking.css",
      "styles/pages/ranking.css",
    ]);
    assert.equal(route.section, "elements");
  }
});

test("a ranking ascends, with no step backwards anywhere in the order", () => {
  for (const field of ["meltingPoint", "boilingPoint"]) {
    const values = ranked(field)
      .map((element) => element[field])
      .filter((value) => value !== null);

    let previous = -Infinity;

    for (const value of values) {
      assert.ok(value >= previous, `${field} steps backwards: ${previous} then ${value}`);
      previous = value;
    }

    assert.equal(values.length, ranked(field).length - ranked(field).filter((e) => e[field] === null).length);
  }
});

test("the elements the source has not measured come last, never first", () => {
  for (const field of ["meltingPoint", "boilingPoint"]) {
    const order = ranked(field);
    const firstUnknown = order.findIndex((element) => element[field] === null);

    assert.ok(firstUnknown > 0, `${field} ranks an unmeasured element somewhere it can be compared`);
    assert.ok(
      order.slice(firstUnknown).every((element) => element[field] === null),
      `${field} interleaves the unmeasured elements with the measured ones`,
    );
    assert.ok(
      order.slice(0, firstUnknown).every((element) => element[field] !== null),
      `${field} puts an unmeasured element before a measured one`,
    );
  }
});

test("the ends of each ranking are the elements the reference agrees are the ends", () => {
  const melting = ranked("meltingPoint").filter((element) => element.meltingPoint !== null);
  const boiling = ranked("boilingPoint").filter((element) => element.boilingPoint !== null);

  assert.equal(melting[0].symbol, "He", "helium melts below everything else");
  assert.equal(melting.at(-1).symbol, "C", "carbon has the highest melting point in the table");
  assert.equal(boiling[0].symbol, "He", "helium boils below everything else");
  assert.equal(boiling.at(-1).symbol, "Re", "rhenium has the highest boiling point");
});

test("descending is the same order reversed, with the unknowns still at the end", () => {
  const descending = rankedElements(elements, { field: "meltingPoint", direction: "descending" });

  assert.equal(descending[0].symbol, "C");
  assert.ok(descending.slice(-15).every((element) => element.meltingPoint === null));
});

test("the page's blocks count what is measured and what is not", () => {
  const melting = rankingPageValues({
    route: routeFor("/properties/melting-point/"),
    elements,
    units: context.units,
  });
  const boiling = rankingPageValues({
    route: routeFor("/properties/boiling-point/"),
    elements,
    units: context.units,
  });

  assert.deepEqual(Object.keys(melting).sort(), ["measured", "missing", "rows", "total"]);
  assert.equal(melting.total, "118");
  assert.equal(melting.measured, "103");
  assert.equal(melting.missing, "15");
  assert.equal(boiling.measured, "93");
  assert.equal(boiling.missing, "25");

  for (const values of [melting, boiling]) {
    assert.equal((values.rows.match(/<li class="rank/g) ?? []).length, 118);
  }
});

test("every measured row prints its value with the unit the units data gives the field", () => {
  const values = rankingPageValues({
    route: routeFor("/properties/melting-point/"),
    elements,
    units: context.units,
  });
  const printed = [...values.rows.matchAll(/class="rank__value">([^<]*)<\/span>/g)].map(
    ([, value]) => value,
  );

  assert.equal(printed.length, 118);
  assert.equal(printed.filter((value) => value.endsWith("\u00a0°C")).length, 103);
  assert.equal(printed.filter((value) => value === "Unknown").length, 15);
});

test("a ranking route that names no field is refused rather than rendered as a page of Unknowns", () => {
  assert.throws(
    () => rankingPageValues({ route: { path: "/properties/example/" }, elements, units: context.units }),
    /names no field to rank by/,
  );
  assert.throws(
    () => rankingPageValues({ route: { ranking: { field: "boilingTemperature" } }, elements }),
    /carries a boilingTemperature/,
  );
});
