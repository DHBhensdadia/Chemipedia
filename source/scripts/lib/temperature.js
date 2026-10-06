/**
 * Temperatures, converted.
 *
 * Three scales, one hub. A conversion between any two of them is a step out to Kelvin and a step
 * back, which means the arithmetic is written once per scale rather than once per pair: the three
 * pairs a page might show are the same six functions read in a different order, and a fourth scale
 * later would add two functions rather than six.
 *
 * Kelvin is the hub because it is the only one of the three whose zero is a fact rather than a
 * convention. That is also why each scale carries its own `zero` — the same physical temperature
 * written in its own unit — which is the whole of the validation this library does: below it, a
 * temperature is not cold, it is impossible, and the page says so instead of printing a number.
 *
 * The library is pure and knows nothing about a page. Rounding is offered rather than applied, so
 * that a caller comparing two temperatures compares the true values and only a reader ever sees a
 * rounded one.
 */

/** How many decimals a reader is shown. Two is what the reference shows and what the numbers deserve. */
export const PRECISION = 2;

/**
 * The three scales, in the order a page presents them: the two everyday ones, then the absolute one.
 *
 * `zero` is absolute zero written in the scale's own unit, and `unit` is written the way this site
 * writes units — a degree sign for the two scales that have one and a space before it, because
 * "0 K" is a temperature and "0°K" is not a way anyone writes one.
 */
export const SCALES = [
  { key: "celsius", name: "Celsius", unit: "°C", zero: -273.15 },
  { key: "fahrenheit", name: "Fahrenheit", unit: "°F", zero: -459.67 },
  { key: "kelvin", name: "Kelvin", unit: "K", zero: 0 },
];

/** One step out to the hub. */
const TO_KELVIN = {
  celsius: (value) => value + 273.15,
  fahrenheit: (value) => (value + 459.67) * (5 / 9),
  kelvin: (value) => value,
};

/** And one step back. */
const FROM_KELVIN = {
  celsius: (value) => value - 273.15,
  fahrenheit: (value) => value * (9 / 5) - 459.67,
  kelvin: (value) => value,
};

/**
 * The scale with a given key.
 *
 * @param {string} key
 * @returns {{ key: string, name: string, unit: string, zero: number }}
 * @throws {TypeError} when the key names no scale, because every caller here is code rather than a
 *   reader, and a page that silently converted from a scale it guessed at would be wrong quietly
 */
export function scaleFor(key) {
  const scale = SCALES.find((candidate) => candidate.key === key);

  if (!scale) {
    throw new TypeError(`Not a temperature scale: ${JSON.stringify(key)}`);
  }

  return scale;
}

/**
 * A temperature translated from one scale to another.
 *
 * The value returned is the true one, not the one a reader sees: 0 °C is 32.000000000000006 °F in
 * binary floating point, and rounding that here would take the difference away from the caller who
 * wants to keep converting. Call `round` for what goes on a page.
 *
 * @param {number} value
 * @param {string} from
 * @param {string} to
 * @returns {number}
 */
export function convert(value, from, to) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new TypeError(`Not a temperature: ${JSON.stringify(value)}`);
  }

  return FROM_KELVIN[scaleFor(to).key](TO_KELVIN[scaleFor(from).key](number));
}

/**
 * A temperature brought down to the precision a reader is shown, and no further.
 *
 * Two decimals, so 0 °C is 32 °F rather than 32.000000000000006 °F, and a negative zero is
 * published as a zero.
 *
 * @param {number} value
 * @returns {number}
 */
export function roundTemperature(value) {
  const factor = 10 ** PRECISION;
  const rounded = Math.round(value * factor) / factor;

  return rounded === 0 ? 0 : rounded;
}

/**
 * A temperature as a reader should see it, and never as this machine computed it.
 *
 * @param {number} value
 * @param {string} scale a scale key
 * @returns {string} the value and its unit, separated by a non-breaking space
 */
export function formatTemperature(value, scale) {
  return `${roundTemperature(value)}\u00a0${scaleFor(scale).unit}`;
}

/**
 * What an input field holds, read as a number.
 *
 * An empty field is not a zero: a reader who clears the Celsius box has not asked for 0 °C, and the
 * page treats the two differently. Anything a number field refuses to parse arrives here as an
 * empty string too, which is why null and not NaN is the answer for it.
 *
 * @param {string} text
 * @returns {number | null}
 */
export function readValue(text) {
  const trimmed = String(text ?? "").trim();

  if (trimmed === "") {
    return null;
  }

  const number = Number(trimmed);

  return Number.isFinite(number) ? number : null;
}

/**
 * The warning a value earns, or null when it earns none.
 *
 * Only one thing is wrong with a temperature: being colder than cold. The message says which
 * temperature that is, in the scale the reader is typing in, so the sentence is useful rather than
 * merely correct.
 *
 * @param {number} value
 * @param {string} scale a scale key
 * @returns {string | null}
 */
export function warningFor(value, scale) {
  const { zero, unit } = scaleFor(scale);

  if (value < zero) {
    return `Below absolute zero (${formatTemperature(zero, scale)}), so this temperature cannot exist.`;
  }

  return null;
}
