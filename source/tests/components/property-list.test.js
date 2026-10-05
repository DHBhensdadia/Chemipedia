import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext } from "../../tools/build-context.js";
import {
  countsPanel,
  discoveryList,
  discoveryRows,
  particleCounts,
  propertyList,
  propertyRows,
  propertyValues,
} from "../../scripts/components/property-list.js";
import { UNKNOWN } from "../../scripts/lib/format.js";

const context = await buildContext();
const hydrogen = context.elements.find((element) => element.atomicNumber === 1);
const iron = context.elements.find((element) => element.atomicNumber === 26);
const options = { units: context.units, categories: context.categories };

test("every declared row reaches the panel, labelled and valued", () => {
  const rows = propertyRows(hydrogen, options);

  assert.equal(rows.length, 27, "the panel declares its rows in one place; the count is the panel");
  assert.equal(rows[0].label, "Atomic number");
  assert.equal(new Set(rows.map((row) => row.label)).size, rows.length, "two rows share a label");

  for (const row of rows) {
    assert.ok(row.label.trim().length > 0, "a row has no label");
    assert.ok(row.value.trim().length > 0, "a row has no value");
  }
});

test("a value the record does not have keeps its row and says so", () => {
  const values = propertyValues(hydrogen, options);

  assert.equal(values.get("Covalent radius"), UNKNOWN);
  assert.ok(
    propertyRows(hydrogen, options).filter((row) => row.value === UNKNOWN).length > 0,
    "hydrogen has no unknown row at all, so the honest-value rule is not being exercised",
  );
});

test("a category is printed as its name, not the slug the record stores", () => {
  assert.equal(propertyValues(hydrogen, options).get("Category"), "Non-metal");
  assert.equal(propertyValues(iron, options).get("Category"), "Transition metal");
});

test("a measured row carries its unit, because half a measurement is a bug", () => {
  assert.match(propertyValues(iron, options).get("Melting point"), /°C$/);
  assert.match(propertyValues(iron, options).get("Atomic weight"), /u$/);
});

test("the panel renders its symbol head and one row per property, keyed by the category", () => {
  const markup = propertyList({ element: hydrogen, ...options });
  const rows = propertyRows(hydrogen, options);

  assert.match(markup, /<span class="properties__sym" data-key="non-metals">H<\/span>/);
  assert.equal([...markup.matchAll(/class="properties__row"/g)].length, rows.length);
  assert.equal(
    [...markup.matchAll(/data-key="non-metals"/g)].length,
    rows.length + 1,
    "every value carries the element's colour key, and the symbol carries it once",
  );
});

test("row ids are opt-in, so a page that needs an anchor asks for them", () => {
  assert.equal(propertyList({ element: hydrogen, ...options }).includes("id=\"property-"), false);
  assert.match(propertyList({ element: hydrogen, ...options, rowIds: true }), /id="property-0"/);
});

test("the particles are the two a neutral atom has, and no neutron count", () => {
  assert.deepEqual(particleCounts(iron), [
    { label: "Protons", value: 26 },
    { label: "Electrons", value: 26 },
  ]);

  const markup = countsPanel({ element: iron });

  assert.match(markup, /<span class="particles__v">26<\/span>Protons/);
  assert.match(markup, /<span class="particles__v">26<\/span>Electrons/);
  assert.equal(markup.includes("Neutron"), false, "a rounded neutron count is wrong for some elements");
  assert.match(markup, /aria-label="Particles in Iron"/);
});

test("discovery keeps its four rows and admits when nobody recorded one", () => {
  const rows = discoveryRows({});

  assert.equal(rows.length, 4);
  assert.deepEqual(
    rows.map((row) => row.label),
    ["Discovered by", "Year", "Where", "Name origin"],
  );

  for (const row of rows) {
    assert.equal(row.value, UNKNOWN);
  }

  assert.match(discoveryList({ element: {} }), /<dt class="discovery__k">Discovered by<\/dt>/);
});

test("an element whose discovery is recorded prints what was recorded", () => {
  const rows = discoveryRows(hydrogen);

  assert.equal(rows[0].value, "Henry Cavendish, Harold Urey");
  assert.match(rows[1].value, /^1766$/, "the year is a year, not a measurement");
});

test("what the data holds is escaped before it reaches the page", () => {
  const markup = propertyList({
    element: { ...hydrogen, symbol: "<H>", crystalStructure: "<script>" },
    ...options,
  });

  assert.ok(markup.includes("&lt;H&gt;"), "the symbol is not escaped");
  assert.ok(markup.includes("&lt;script&gt;"), "a value is not escaped");
  assert.equal(markup.includes("<script>"), false);
});
