/**
 * The temperature calculator.
 *
 * Three fields — Celsius, Fahrenheit and Kelvin — each of which converts into the other two as it
 * is typed in. The conversion itself is not here: it is `lib/temperature.js`, which is pure and
 * tested against the values a textbook agrees on. This module owns what a page does with it, which
 * is two things: the markup the build writes, and the wiring that turns the three fields into one
 * calculator.
 *
 * The build writes a working page: all three fields carry the temperature zero converts to, and
 * the table of notable temperatures is filled with the same conversion the fields use, so a reader
 * with the script off still has a page that answers the question it was opened with.
 *
 * The notable temperatures are the one place this page touches the element records. Iron's and
 * tungsten's melting points are read from the data rather than written down here, because a page
 * that states a number the element's own page disagrees with is the exact defect Phase 6 found in
 * a page description — and the fix then was to derive the sentence from the records.
 */

import { attributes, escapeHtml } from "../lib/html.js";
import {
  SCALES,
  convert,
  formatTemperature,
  readValue,
  roundTemperature,
  warningFor,
} from "../lib/temperature.js";

/** The page's lede, in our own words. */
export const CALCULATOR_LEDE =
  "Type a temperature into any of the three fields and the other two follow it. Everything is " +
  "converted as it is typed, and shown to two decimal places.";

/**
 * The temperatures worth having to hand, and where each one comes from.
 *
 * A `celsius` is a value this page states; a `symbol` is an element whose melting point the record
 * already holds. The two-element rows exist because the highest melting points are the ones a
 * reader is least likely to have a feel for, and the data has them to a tenth of a degree.
 */
export const REFERENCE_POINTS = [
  { name: "Absolute zero", celsius: -273.15 },
  { name: "Mercury freezes", celsius: -38.83 },
  { name: "Water freezes", celsius: 0 },
  { name: "A comfortable room", celsius: 20 },
  { name: "Human body temperature", celsius: 37 },
  { name: "Water boils at sea level", celsius: 100 },
  { name: "Iron melts", symbol: "Fe" },
  { name: "Tungsten melts", symbol: "W" },
];

/**
 * The reference points, with the two that come from the records resolved.
 *
 * A point whose element is missing from the data, or whose record holds no melting point, is left
 * out rather than printed as an empty row: the table is a convenience, and a row that says nothing
 * is worse than a shorter table.
 *
 * @param {object[]} elements
 * @returns {{ name: string, celsius: number }[]}
 */
export function referencePoints(elements = []) {
  return REFERENCE_POINTS.map((point) => {
    if (typeof point.celsius === "number") {
      return { name: point.name, celsius: point.celsius };
    }

    const element = elements.find((candidate) => candidate.symbol === point.symbol);
    const celsius = element?.meltingPoint;

    return typeof celsius === "number" ? { name: point.name, celsius } : null;
  }).filter(Boolean);
}

/**
 * One field of the calculator: the label, the input, and how the field is reached from the script.
 *
 * The unit is inside the label rather than floating beside the field, so that the name a screen
 * reader reads for the input is the one a sighted reader sees — "Celsius (°C)", not "Celsius".
 *
 * @param {{ key: string, name: string, unit: string }} scale
 * @param {number} value the temperature the field opens with
 * @returns {string}
 */
export function scaleField(scale, value) {
  return `<div class="calc-field">
  <label class="calc-field__label" for="calc-${escapeHtml(scale.key)}">${escapeHtml(scale.name)} <span class="calc-field__unit">${escapeHtml(scale.unit)}</span></label>
  <input class="calc-field__input" id="calc-${escapeHtml(scale.key)}" name="${escapeHtml(scale.key)}" type="number" step="any" inputmode="decimal" autocomplete="off" value="${escapeHtml(String(value))}"${attributes({ "data-calc-field": scale.key })}>
</div>`;
}

/**
 * The three fields, each opening on zero in its own scale.
 *
 * @returns {string}
 */
function fieldsBlock() {
  return SCALES.map((scale) => scaleField(scale, roundTemperature(convert(0, "celsius", scale.key)))).join(
    "\n",
  );
}

/**
 * One row of the notable-temperatures table, or null when the Celsius column is not a number.
 *
 * @param {object[]} points
 * @returns {string}
 */
function pointsBlock(points) {
  return points
    .map(
      (point) => `<tr class="calc-row">
  <th class="calc-row__name" scope="row">${escapeHtml(point.name)}</th>
  <td class="calc-row__value">${escapeHtml(formatTemperature(point.celsius, "celsius"))}</td>
  <td class="calc-row__value">${escapeHtml(formatTemperature(convert(point.celsius, "celsius", "fahrenheit"), "fahrenheit"))}</td>
  <td class="calc-row__value">${escapeHtml(formatTemperature(convert(point.celsius, "celsius", "kelvin"), "kelvin"))}</td>
</tr>`,
    )
    .join("\n");
}

/**
 * Every block the calculator's template asks for.
 *
 * @param {{ elements?: object[] }} [options]
 * @returns {{ lede: string, fields: string, points: string }}
 */
export function calculatorPageValues({ elements = [] } = {}) {
  return {
    lede: CALCULATOR_LEDE,
    fields: fieldsBlock(),
    points: pointsBlock(referencePoints(elements)),
  };
}

/**
 * Start the calculator: every field writes the other two.
 *
 * An empty field is a reader starting again, so it clears the other two and says nothing. A value
 * below absolute zero still converts — the arithmetic is right and the reader may be exploring the
 * limit — but the page says which value cannot exist and marks the field it was typed in, rather
 * than leaving a reader to believe that −1000 °C is a temperature they could go and stand in.
 *
 * @param {Document} [root]
 * @returns {() => void} teardown
 */
export function startTemperatureCalculator(root = document) {
  const inputs = [...root.querySelectorAll("[data-calc-field]")];
  const warning = root.querySelector("[data-calc-warn]");

  if (inputs.length !== SCALES.length) {
    return () => {};
  }

  const keys = new Set(inputs.map((input) => input.dataset.calcField));

  if (SCALES.some((scale) => !keys.has(scale.key))) {
    return () => {};
  }

  function clear() {
    for (const input of inputs) {
      input.removeAttribute("aria-invalid");
    }

    if (warning) {
      warning.textContent = "";
    }
  }

  function onInput(event) {
    const input = event.currentTarget;
    const key = input.dataset.calcField;
    const value = readValue(input.value);

    clear();

    if (value === null) {
      if (input.value.trim() === "") {
        for (const other of inputs) {
          if (other !== input) {
            other.value = "";
          }
        }
      }

      return;
    }

    for (const other of inputs) {
      if (other === input) {
        continue;
      }

      other.value = String(roundTemperature(convert(value, key, other.dataset.calcField)));
    }

    const message = warningFor(value, key);

    if (message) {
      input.setAttribute("aria-invalid", "true");

      if (warning) {
        warning.textContent = message;
      }
    }
  }

  for (const input of inputs) {
    input.addEventListener("input", onInput);
  }

  return () => {
    for (const input of inputs) {
      input.removeEventListener("input", onInput);
    }
  };
}
