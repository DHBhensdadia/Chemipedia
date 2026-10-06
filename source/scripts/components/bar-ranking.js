/**
 * The ranked rows of a ranking page: one row per element, with a bar whose length is where that
 * element's value sits between the page's lowest and highest.
 *
 * The bar is an ordinal scale, not a length measured from zero, and that is a deliberate reading of
 * the data. Most melting points in the dataset are below zero degrees Celsius, so a bar drawn from
 * zero would be a bar about a unit's arbitrary origin rather than about the elements: carbon's
 * 3549.85 °C is the highest melting point in the table and helium's -272.2 °C the lowest, and what a
 * reader wants to see is where the 118 sit between those two ends. The page's own note says so in a
 * sentence, and a token keeps a little length on the lowest bar so that it is visible rather than
 * absent.
 *
 * Rows arrive already ordered — the ranking is the page module's decision, made with the data
 * layer's own comparison — so this module renders what it is given and adds no second opinion about
 * which element comes first.
 *
 * The one number this component puts in a `style` attribute is the ratio. Like the tile's grid
 * position, it is data rather than a design value: it is derived from the record's own measurement,
 * and the length it produces is decided by the stylesheet from a token.
 */

import { attributes, classNames, escapeHtml } from "../lib/html.js";
import { UNKNOWN, formatMeasurement } from "../lib/format.js";

/**
 * Where a value sits between a domain's two ends, as a fraction from 0 to 1.
 *
 * A domain with no width — one known value, or every known value the same — has no scale to place
 * anything on, so the value sits at the top: a bar of full length for something that is both the
 * highest and the lowest is the honest picture of a one-value scale. No domain at all is a
 * different case: nothing is measured, so nothing is placed on any scale and the answer is no
 * length rather than full length.
 *
 * @param {number | null} value
 * @param {{ min: number, max: number } | null} [domain]
 * @returns {number}
 */
export function barRatio(value, domain = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  const { min, max } = domain ?? {};

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }

  if (max <= min) {
    return 1;
  }

  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * Whether a record has a value for a field.
 *
 * Zero is a value: a melting point of 0 °C is not a missing measurement, and treating it as one
 * would file it with the elements the source does not know.
 *
 * @param {object} element
 * @param {string} field
 * @returns {boolean}
 */
export function hasValue(element, field) {
  return element[field] !== null && element[field] !== undefined;
}

/**
 * The two ends of a field's domain across the records that have a value, or null when none does.
 *
 * @param {object[]} elements
 * @param {string} field
 * @returns {{ min: number, max: number } | null}
 */
export function domainOf(elements, field) {
  const values = elements.filter((element) => hasValue(element, field)).map((element) => element[field]);

  if (values.length === 0) {
    return null;
  }

  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * One ranked row.
 *
 * The position is shown only for elements the source has measured, because an element with no
 * measurement has no place in an order of measurements. Its value column says so in the project's
 * one word for not knowing rather than with a dash.
 *
 * The element's link is named by what it shows — the symbol, the name and the atomic number —
 * rather than by an `aria-label` that reworded them, because a name written twice is a name that
 * can be written twice differently, and the label-in-name rule holds the accessible name to the
 * words on the screen.
 *
 * @param {{
 *   element: object,
 *   field: string,
 *   units?: object,
 *   domain: { min: number, max: number } | null,
 *   place: number | null
 * }} options
 * @returns {string}
 */
export function barRankRow({ element, field, units, domain, place }) {
  const measured = hasValue(element, field);
  const definition = units?.definitionFor(field) ?? {};
  const value = measured ? formatMeasurement(element[field], definition) : UNKNOWN;
  const ratio = measured && domain ? barRatio(element[field], domain) : 0;

  return `<li class="${classNames("rank", !measured && "rank--unknown")}"${attributes({
    "data-key": element.category,
    "data-ratio": measured ? ratio.toFixed(4) : null,
  })}>
<span class="rank__place" aria-hidden="true">${place === null ? "" : escapeHtml(place)}</span>
<a class="rank__element" href="/elements/${escapeHtml(element.slug)}/">
<span class="rank__sym">${escapeHtml(element.symbol)}</span>
<span class="rank__name">${escapeHtml(element.name)}</span>
<span class="rank__z">${escapeHtml(element.atomicNumber)}</span>
</a>
<span class="rank__bar" aria-hidden="true">${measured ? `<span class="rank__fill" style="--ratio:${ratio.toFixed(4)}"></span>` : ""}</span>
<span class="rank__value">${escapeHtml(value)}</span>
</li>`;
}

/**
 * Every row of a ranking, in the order the elements arrive in.
 *
 * @param {{ elements: object[], field: string, units?: object }} options
 * @returns {string}
 */
export function barRanking({ elements, field, units }) {
  const domain = domainOf(elements, field);
  let place = 0;

  return elements
    .map((element) => {
      if (hasValue(element, field)) {
        place += 1;

        return barRankRow({ element, field, units, domain, place });
      }

      return barRankRow({ element, field, units, domain, place: null });
    })
    .join("\n");
}
