import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PRECISION,
  SCALES,
  convert,
  formatTemperature,
  readValue,
  roundTemperature,
  scaleFor,
  warningFor,
} from "../../scripts/lib/temperature.js";

/** The scales as a reader meets them, so a test can point at one by name. */
const CELSIUS = "celsius";
const FAHRENHEIT = "fahrenheit";
const KELVIN = "kelvin";

test("the three scales carry their own absolute zero", () => {
  assert.deepEqual(
    SCALES.map((scale) => scale.key),
    [CELSIUS, FAHRENHEIT, KELVIN],
  );
  assert.deepEqual(
    SCALES.map((scale) => scale.zero),
    [-273.15, -459.67, 0],
  );
  assert.equal(scaleFor(KELVIN).unit, "K", "Kelvin takes no degree sign");
  assert.equal(scaleFor(CELSIUS).unit, "°C");
});

test("a scale that does not exist is refused rather than guessed at", () => {
  assert.throws(() => scaleFor("rankine"), TypeError);
  assert.throws(() => convert(0, CELSIUS, "rankine"), TypeError);
  assert.throws(() => convert(0, "rankine", CELSIUS), TypeError);
  assert.throws(() => convert("cold", CELSIUS, FAHRENHEIT), TypeError);
});

test("the reference points every school textbook agrees on", () => {
  // 0 °C = 32 °F = 273.15 K.
  assert.equal(roundTemperature(convert(0, CELSIUS, FAHRENHEIT)), 32);
  assert.equal(roundTemperature(convert(0, CELSIUS, KELVIN)), 273.15);
  assert.equal(roundTemperature(convert(32, FAHRENHEIT, CELSIUS)), 0);
  assert.equal(roundTemperature(convert(273.15, KELVIN, CELSIUS)), 0);

  // −40 is the one temperature the two everyday scales agree on.
  assert.equal(roundTemperature(convert(-40, CELSIUS, FAHRENHEIT)), -40);
  assert.equal(roundTemperature(convert(-40, FAHRENHEIT, CELSIUS)), -40);

  // Water boils, and a body runs at 37 °C.
  assert.equal(roundTemperature(convert(100, CELSIUS, FAHRENHEIT)), 212);
  assert.equal(roundTemperature(convert(100, CELSIUS, KELVIN)), 373.15);
  assert.equal(roundTemperature(convert(37, CELSIUS, FAHRENHEIT)), 98.6);

  // Absolute zero, written three ways.
  assert.equal(roundTemperature(convert(-273.15, CELSIUS, FAHRENHEIT)), -459.67);
  assert.equal(roundTemperature(convert(-459.67, FAHRENHEIT, KELVIN)), 0);
  assert.equal(roundTemperature(convert(0, KELVIN, CELSIUS)), -273.15);
});

test("a conversion is reversible, and a conversion to itself changes nothing", () => {
  const values = [-273.15, -40, -17.78, 0, 21.5, 37, 100, 3549.85];

  for (const value of values) {
    assert.equal(
      roundTemperature(convert(convert(value, CELSIUS, FAHRENHEIT), FAHRENHEIT, CELSIUS)),
      roundTemperature(value),
      `${value} °C did not survive the trip through Fahrenheit`,
    );
    assert.equal(
      roundTemperature(convert(convert(value, CELSIUS, KELVIN), KELVIN, CELSIUS)),
      roundTemperature(value),
      `${value} °C did not survive the trip through Kelvin`,
    );
    assert.equal(
      roundTemperature(convert(convert(value, FAHRENHEIT, KELVIN), KELVIN, FAHRENHEIT)),
      roundTemperature(value),
      `${value} °F did not survive the trip through Kelvin`,
    );
  }

  for (const scale of SCALES) {
    assert.equal(roundTemperature(convert(18.25, scale.key, scale.key)), 18.25);
  }
});

test("the value a page shows is the rounded one, and the unit is written our way", () => {
  assert.equal(PRECISION, 2);
  assert.equal(formatTemperature(convert(0, CELSIUS, FAHRENHEIT), FAHRENHEIT), "32\u00a0°F");
  assert.equal(formatTemperature(convert(0, CELSIUS, CELSIUS), CELSIUS), "0\u00a0°C");
  assert.equal(formatTemperature(convert(0, CELSIUS, KELVIN), KELVIN), "273.15\u00a0K");
  assert.equal(formatTemperature(convert(-500, CELSIUS, KELVIN), KELVIN), "-226.85\u00a0K");

  assert.equal(formatTemperature(0.0001, KELVIN), "0\u00a0K");
  assert.equal(formatTemperature(-0.004, CELSIUS), "0\u00a0°C", "a negative zero reached the page");
  assert.equal(formatTemperature(1 / 3, CELSIUS), "0.33\u00a0°C");
});

test("an input field reads as a number, an empty field reads as nothing", () => {
  assert.equal(readValue("0"), 0);
  assert.equal(readValue("-40"), -40);
  assert.equal(readValue(" 12.5 "), 12.5);
  assert.equal(readValue(""), null);
  assert.equal(readValue("   "), null);
  assert.equal(readValue(undefined), null);
  assert.equal(readValue("1e3"), 1000, "a number field may hand back an exponent");
  assert.equal(readValue("twelve"), null);
  assert.equal(readValue("Infinity"), null);
});

test("only one thing is wrong with a temperature, and the warning says what", () => {
  assert.equal(warningFor(0, CELSIUS), null);
  assert.equal(warningFor(-273.15, CELSIUS), null, "absolute zero is reachable in principle");
  assert.equal(warningFor(0, KELVIN), null);

  assert.equal(
    warningFor(-273.16, CELSIUS),
    "Below absolute zero (-273.15\u00a0°C), so this temperature cannot exist.",
    "the warning should say where the floor is, not repeat the value",
  );
  assert.equal(warningFor(-500, KELVIN), "Below absolute zero (0\u00a0K), so this temperature cannot exist.");
  assert.equal(warningFor(-459.68, FAHRENHEIT)?.includes("-459.67\u00a0°F"), true);

  // The same physical temperature gets the same verdict whichever field it is typed in.
  assert.equal(warningFor(-500, CELSIUS) === null, false);
  assert.equal(warningFor(convert(-500, CELSIUS, FAHRENHEIT), FAHRENHEIT) === null, false);
  assert.equal(warningFor(convert(-500, CELSIUS, KELVIN), KELVIN) === null, false);
});
