/**
 * Where a number sits on a scale, which band of a legend it belongs to, and — when the caller has
 * real colours — the colour it takes.
 *
 * The alternate table views answer questions with a measurement rather than a category — how
 * electronegative an element is, where it sits on a scale — and a measurement needs a position on
 * a ramp and a band in a legend. Those two questions are pure arithmetic, and the table asks
 * exactly them: it puts a band number on a tile and the stylesheet turns that band into a colour,
 * so the six colours live in `tokens.css` with every other design value instead of in a JavaScript
 * constant that could drift from them.
 *
 * The colour half of the module is here for the callers that do hold colours — a bar, a chart, a
 * future continuous view — and it obeys two rules that are rules rather than choices:
 *
 *   - The domain's two ends get the scale's two end colours exactly. Not a value near them: a
 *     reader looking at the legend's endpoints and at fluorine's tile must see the same colour.
 *   - A value outside the domain clamps to the nearest end. An outlier must not invent a seventh
 *     colour the legend does not have, and it must not be silently dropped either.
 *
 * A missing value is not on the scale, and is not zero either. The data layer keeps `null` distinct
 * from a measurement and this module keeps it distinct from a position: `positionIn(null, domain)`
 * is `null`, and the caller decides what a tile with no value looks like.
 *
 * Pure: no DOM, no data file, no stylesheet.
 */

/**
 * Expand a three- or six-digit hex colour.
 *
 * Kept local rather than imported from `contrast.js`, which owns luminance and contrast and has no
 * business parsing a colour for a different purpose; the two uses are one `replace` apart and
 * neither should start importing the other's whole surface for it.
 *
 * @param {string} hex
 * @returns {string} six lowercase digits, no hash
 */
function digits(hex) {
  const value = String(hex).trim().replace(/^#/, "").toLowerCase();

  if (/^[0-9a-f]{3}$/.test(value)) {
    return value
      .split("")
      .map((digit) => digit + digit)
      .join("");
  }

  if (/^[0-9a-f]{6}$/.test(value)) {
    return value;
  }

  throw new TypeError(`Not a hex colour: ${hex}`);
}

/**
 * Halfway — and any other fraction — between two colours, in sRGB.
 *
 * Component-wise interpolation is what the eye expects from a two-colour ramp, and it keeps the
 * result monotonic in luminance when the stops are: if the ends get darker, everything between them
 * gets darker at a steady rate, which is what a reader reads off the legend.
 *
 * @param {string} from
 * @param {string} to
 * @param {number} t 0 gives `from`, 1 gives `to`
 * @returns {string} a six-digit colour with a leading hash
 */
export function mixColours(from, to, t) {
  const first = digits(from);
  const second = digits(to);
  const ratio = Math.min(1, Math.max(0, t));
  const channels = [0, 2, 4].map((offset) => {
    const one = Number.parseInt(first.slice(offset, offset + 2), 16);
    const other = Number.parseInt(second.slice(offset, offset + 2), 16);

    return Math.round(one + (other - one) * ratio);
  });

  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Where a value sits on a domain, from 0 to 1, clamped at both ends.
 *
 * @param {unknown} value
 * @param {[number, number]} domain
 * @returns {number | null} null when there is no measurement to place
 */
export function positionIn(value, [low, high]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.min(1, Math.max(0, (number - low) / (high - low)));
}

/**
 * The band a value falls in, 0 for the domain's low end.
 *
 * The last band includes the domain's high end, so the maximum measurement is in the legend rather
 * than just past it.
 *
 * @param {unknown} value
 * @param {{ domain: [number, number], bands: number }} scale
 * @returns {number | null}
 */
export function bandFor(value, { domain, bands }) {
  const position = positionIn(value, domain);

  return position === null ? null : Math.min(bands - 1, Math.floor(position * bands));
}

/**
 * A scale: a domain, a ramp, and the bands a legend prints.
 *
 * @param {{
 *   stops: string[],
 *   domain: [number, number],
 *   bands?: number
 * }} options
 * @returns {{
 *   stops: string[],
 *   domain: [number, number],
 *   bands: number,
 *   edges: number[],
 *   positionOf: (value: unknown) => number | null,
 *   bandFor: (value: unknown) => number | null,
 *   colourFor: (value: unknown) => string | null,
 *   bandColour: (band: number) => string,
 *   bandRange: (band: number) => [number, number]
 * }}
 * @throws {TypeError} when the ramp is shorter than two colours or the domain is empty
 */
export function createColourScale({ stops, domain, bands = stops.length }) {
  if (!Array.isArray(stops) || stops.length < 2) {
    throw new TypeError("A scale needs at least two colours to interpolate between");
  }

  const [low, high] = domain;

  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
    throw new TypeError(`A scale needs a domain that rises: ${low}–${high}`);
  }

  if (!Number.isInteger(bands) || bands < 1) {
    throw new TypeError(`A scale needs whole bands: ${bands}`);
  }

  stops.forEach(digits);

  const width = (high - low) / bands;

  /**
   * The colour of a value, interpolated between the stops.
   *
   * @param {unknown} value
   * @returns {string | null}
   */
  function colourFor(value) {
    const position = positionIn(value, [low, high]);

    if (position === null) {
      return null;
    }

    const span = position * (stops.length - 1);
    const index = Math.min(stops.length - 2, Math.floor(span));

    return mixColours(stops[index], stops[index + 1], span - index);
  }

  return {
    stops,
    domain: [low, high],
    bands,
    /** Where each band begins, for a legend that prints its intervals. */
    edges: Array.from({ length: bands }, (_, band) => low + band * width),
    positionOf: (value) => positionIn(value, [low, high]),
    bandFor: (value) => bandFor(value, { domain: [low, high], bands }),
    colourFor,
    /**
     * The colour a band's swatch takes.
     *
     * When the legend prints exactly as many bands as the ramp has colours — which is how the
     * reference draws its electronegativity legend — a band takes its own stop, so the tile and
     * the legend are the same colour rather than two values near each other. With any other band
     * count the ramp is sampled at the band's middle, which is the colour that represents the
     * band's range best.
     */
    bandColour: (band) => {
      if (bands === stops.length) {
        return stops[Math.min(stops.length - 1, Math.max(0, band))];
      }

      return colourFor(low + band * width + width / 2) ?? stops[0];
    },
    /** The two values a band spans, as the legend would label them. */
    bandRange: (band) => [low + band * width, band === bands - 1 ? high : low + (band + 1) * width],
  };
}
