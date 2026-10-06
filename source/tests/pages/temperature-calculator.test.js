import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  CALCULATOR_LEDE,
  REFERENCE_POINTS,
  calculatorPageValues,
  referencePoints,
  scaleField,
  startTemperatureCalculator,
} from "../../scripts/pages/temperature-calculator.js";
import { SCALES, convert, formatTemperature, roundTemperature } from "../../scripts/lib/temperature.js";
import { buildContext } from "../../tools/build-context.js";
import { routes } from "../../scripts/router/routes.js";

const context = await buildContext();
const elements = context.elements;
const values = calculatorPageValues({ elements });
const route = routes.find((candidate) => candidate.template === "temperature-calculator");
const template = await readFile(new URL("../../pages/temperature-calculator.html", import.meta.url), "utf8");

/** Every field's input tag in the order the page writes them. */
const inputsIn = (markup) => [...markup.matchAll(/<input[^>]*data-calc-field="([a-z]+)"[^>]*>/g)];

/** One tag's attributes, as they were written. */
const attributesIn = (tag) =>
  new Map([...tag.matchAll(/([a-z-]+[a-z])="([^"]*)"/g)].map(([, name, value]) => [name, value]));

/** The table's rows: the name, then the three scales in the order the header names them. */
const rowsIn = (markup) =>
  [...markup.matchAll(/<th class="calc-row__name" scope="row">([^<]*)<\/th>\s*<td class="calc-row__value">([^<]*)<\/td>\s*<td class="calc-row__value">([^<]*)<\/td>\s*<td class="calc-row__value">([^<]*)<\/td>/g)].map(
    ([, name, celsius, fahrenheit, kelvin]) => ({ name, celsius, fahrenheit, kelvin }),
  );

/**
 * A stand-in for the three fields and the line they share.
 *
 * The wiring touches four things on a field and one on the warning, so a fake that answers the same
 * selectors is enough to hold its rule. Layout is deliberately not faked: whether a marked field
 * looks different is the browser's business, and the browser pass is where that is answered.
 */
function fakePage({ fields = SCALES.map((scale) => scale.key), values = {} } = {}) {
  const listeners = new Map();

  const inputs = fields.map((key) => {
    const input = {
      dataset: { calcField: key },
      value: values[key] ?? "",
      invalid: null,
      addEventListener: (type, handler) => listeners.set(`${key}:${type}`, handler),
      removeEventListener: (type) => listeners.delete(`${key}:${type}`),
      setAttribute: (name, value) => {
        if (name === "aria-invalid") {
          input.invalid = value;
        }
      },
      removeAttribute: (name) => {
        if (name === "aria-invalid") {
          input.invalid = null;
        }
      },
      fire: () => listeners.get(`${key}:input`)?.({ currentTarget: input }),
    };

    return input;
  });

  const warning = { textContent: "" };
  const fieldFor = (key) => inputs.find((input) => input.dataset.calcField === key);

  return {
    inputs,
    warning,
    listening: (key) => listeners.has(`${key}:input`),
    document: {
      querySelectorAll: (selector) => (selector === "[data-calc-field]" ? inputs : []),
      querySelector: (selector) => (selector === "[data-calc-warn]" ? warning : null),
    },
    valueOf: (key) => fieldFor(key).value,
    invalidIn: () => inputs.filter((input) => input.invalid === "true").map((input) => input.dataset.calcField),
    type: (key, text) => {
      const input = fieldFor(key);
      input.value = text;
      input.fire();
    },
  };
}

test("the route is declared, and it is the one the build renders this module for", () => {
  assert.ok(route, "the calculator's route is missing from the manifest");
  assert.equal(route.section, "tools");
  assert.equal(route.nav.label, "Calculators");
});

test("the page carries one field per scale, opening on zero in that scale", () => {
  const inputs = inputsIn(values.fields);

  assert.equal(inputs.length, SCALES.length, "a scale has no field, or has two");
  assert.deepEqual(
    inputs.map(([, key]) => key),
    SCALES.map((scale) => scale.key),
    "the fields are not in the order the scales are declared in",
  );

  for (const [tag, key] of inputs.map((match) => [match[0], match[1]])) {
    const attributes = attributesIn(tag);
    const scale = SCALES.find((candidate) => candidate.key === key);

    assert.equal(attributes.get("type"), "number", "a field that accepts letters is not a number field");
    assert.equal(attributes.get("step"), "any", `${key} steps by a unit a temperature does not have`);
    assert.equal(attributes.get("inputmode"), "decimal");
    assert.equal(attributes.get("id"), `calc-${key}`, "the label's `for` would point at nothing");
    assert.equal(
      attributes.get("value"),
      String(roundTemperature(convert(0, "celsius", key))),
      `${key} does not open on the temperature zero converts to`,
    );
    assert.match(
      values.fields,
      new RegExp(`for="calc-${key}">${scale.name} `),
      "the field's label does not name its scale",
    );
    assert.match(values.fields, new RegExp(`>${scale.unit}</span>`), "the unit is not written beside the field");
  }
});

test("the page opens with the three fields in agreement", () => {
  const read = (key) => Number(attributesIn(inputsIn(values.fields).find(([, k]) => k === key)[0]).get("value"));

  assert.equal(read("celsius"), 0);
  assert.equal(read("fahrenheit"), 32);
  assert.equal(read("kelvin"), 273.15);
});

test("the notable temperatures are converted from the Celsius column the fields use", () => {
  const points = referencePoints(elements);
  const rows = rowsIn(values.points);

  assert.equal(rows.length, points.length, "the table and its data disagree about how many rows it has");
  assert.ok(points.length > 5, "the table has lost its reference points");

  for (const [index, row] of rows.entries()) {
    const point = points[index];

    assert.equal(row.name, point.name);
    assert.equal(row.celsius, formatTemperature(point.celsius, "celsius"), `${row.name} is not in Celsius`);
    assert.equal(
      row.fahrenheit,
      formatTemperature(convert(point.celsius, "celsius", "fahrenheit"), "fahrenheit"),
      `${row.name}'s Fahrenheit value is not the conversion the fields make`,
    );
    assert.equal(
      row.kelvin,
      formatTemperature(convert(point.celsius, "celsius", "kelvin"), "kelvin"),
      `${row.name}'s Kelvin value is not the conversion the fields make`,
    );
  }
});

test("the two melting points are the records' own, not numbers written down twice", () => {
  const tagged = REFERENCE_POINTS.filter((point) => point.symbol);
  const points = referencePoints(elements);

  for (const { symbol, name } of tagged) {
    const element = elements.find((candidate) => candidate.symbol === symbol);
    const point = points.find((candidate) => candidate.name === name);

    assert.ok(element && typeof element.meltingPoint === "number", `${symbol} has no melting point to state`);
    assert.equal(
      point.celsius,
      element.meltingPoint,
      `${name} disagrees with the element's own page`,
    );
    assert.match(
      values.points,
      new RegExp(`${name}</th>\\s*<td class="calc-row__value">${formatTemperature(element.meltingPoint, "celsius")}`),
      `${name} did not reach the table`,
    );
  }

  // And the rule that keeps them honest: an element the data does not hold takes its row with it.
  assert.equal(
    referencePoints([]).length,
    REFERENCE_POINTS.length - tagged.length,
    "a point whose element is missing is still printed",
  );
});

test("the fields sit under a heading, a table and a polite live region", () => {
  assert.equal(placeholderFree(values.fields), true);
  assert.match(template, /<h1 class="calc-hero__name">Temperature calculator<\/h1>/);
  assert.match(template, new RegExp(`<p class="calc-hero__lede">\\{\\{lede\\}\\}</p>`));
  assert.match(template, /class="calc-warn" role="status" aria-live="polite" data-calc-warn/);
  assert.match(template, /<caption class="visually-hidden">Notable temperatures in Celsius, Fahrenheit and Kelvin<\/caption>/);
  assert.equal(CALCULATOR_LEDE.includes("two decimal places"), true, "the page does not say what it rounds to");
});

test("typing in any field writes the other two", () => {
  const page = fakePage();
  const release = startTemperatureCalculator(page.document);

  page.type("celsius", "100");
  assert.equal(page.valueOf("fahrenheit"), "212");
  assert.equal(page.valueOf("kelvin"), "373.15");
  assert.equal(page.warning.textContent, "");
  assert.deepEqual(page.invalidIn(), []);

  page.type("kelvin", "0");
  assert.equal(page.valueOf("celsius"), "-273.15", "the Kelvin field does not convert back");
  assert.equal(page.valueOf("fahrenheit"), "-459.67");

  page.type("fahrenheit", "-40");
  assert.equal(page.valueOf("celsius"), "-40", "the point where the two scales meet came out wrong");
  assert.equal(page.valueOf("kelvin"), "233.15");

  page.type("celsius", "37");
  assert.equal(page.valueOf("fahrenheit"), "98.6");

  release();
});

test("an empty field clears the other two and says nothing", () => {
  const page = fakePage({ values: { celsius: "100", fahrenheit: "212", kelvin: "373.15" } });
  const release = startTemperatureCalculator(page.document);

  page.type("celsius", "");

  assert.equal(page.valueOf("fahrenheit"), "");
  assert.equal(page.valueOf("kelvin"), "");
  assert.equal(page.warning.textContent, "", "clearing a field is not a mistake to report");
  assert.deepEqual(page.invalidIn(), []);

  release();
});

test("a temperature below absolute zero still converts, and is marked while it is said", () => {
  const page = fakePage();
  const release = startTemperatureCalculator(page.document);

  page.type("celsius", "-500");

  assert.equal(page.valueOf("kelvin"), "-226.85", "the arithmetic stopped at the limit");
  assert.equal(
    page.warning.textContent,
    "Below absolute zero (-273.15\u00a0°C), so this temperature cannot exist.",
  );
  assert.deepEqual(page.invalidIn(), ["celsius"], "the field the reader typed in is not the one marked");

  // Exactly absolute zero is reachable in principle, and is not reported.
  page.type("celsius", "-273.15");
  assert.equal(page.warning.textContent, "");
  assert.deepEqual(page.invalidIn(), []);

  page.type("kelvin", "-1");
  assert.equal(page.warning.textContent.includes("0\u00a0K"), true, "the warning does not say where the floor is");
  assert.deepEqual(page.invalidIn(), ["kelvin"]);

  release();
});

test("the wiring comes off again, and a page without all three fields refuses to start", () => {
  const page = fakePage();
  const release = startTemperatureCalculator(page.document);

  assert.deepEqual(
    SCALES.map((scale) => page.listening(scale.key)),
    [true, true, true],
  );

  release();
  assert.deepEqual(
    SCALES.map((scale) => page.listening(scale.key)),
    [false, false, false],
    "the listeners outlived the page they belong to",
  );

  const partial = fakePage({ fields: ["celsius", "fahrenheit"] });

  startTemperatureCalculator(partial.document);
  assert.deepEqual(
    partial.inputs.map((input) => partial.listening(input.dataset.calcField)),
    [false, false],
    "a page missing a scale was wired up anyway",
  );
});

/** Whether a filled block kept a placeholder the template would ask for. */
function placeholderFree(markup) {
  return !/\{\{[a-z]+\}\}/.test(markup);
}

test("the scale fields are built by the same function for every scale", () => {
  const field = scaleField(SCALES[2], 273.15);

  assert.equal(inputsIn(field).length, 1);
  assert.equal(attributesIn(inputsIn(field)[0][0]).get("value"), "273.15");
  assert.match(field, /Kelvin /, "the label loses the scale's name");
  assert.match(field, />K<\/span>/, "Kelvin is written with a unit it does not have");
});
