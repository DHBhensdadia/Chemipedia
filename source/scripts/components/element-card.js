/**
 * One card on the elements index: the element's tile, its name, its group, its atomic weight and
 * its state.
 *
 * A card is a link to the element's page before it is anything else, so the whole card is the
 * link, and what names it is what it shows: the tile's number and symbol, the name, the group, the
 * weight and the state. It used to be named by an `aria-label` that reworded the tile — "Hydrogen,
 * symbol H, atomic number 1" — and the two drifted apart: the label hid the group and the
 * measurement from a reader who cannot see them, and it named the link in an order the visible text
 * does not have, which is the label-in-name failure the accessibility sweep and Lighthouse both
 * reported. A name that is the content cannot drift from the content.
 *
 * Three of the card's five facts are data, and each comes from its owner rather than from this
 * file: the weight is the element's `atomicWeight` formatted with the unit `units.json` gives it,
 * so it cannot disagree with the property panel that prints the same field; the state is the
 * record's own word, capitalised the way `lib/format.js` capitalises any phrase; and the group is
 * the categories repository's display name, so `non-metals` is data and `Non-metal` is what the
 * card says. A missing weight is not a blank: it is the project's one word for not knowing.
 *
 * What the card deliberately does not do is decide its own colour. It emits the element's category
 * as `data-key` and lets `periodic-table.css` turn that key into `--fill` and `--on-fill`, which is
 * the same rule the table, the legend chips and the element page's hero card follow.
 *
 * The card also carries the three searchable facts as `data-` attributes — the name, the symbol
 * and the atomic number — because the index filters the cards the page already holds rather than
 * fetching the data a second time. They are the same three facts the tile shows, written in the
 * form a client-side filter can read.
 */

import { attributes, escapeHtml } from "../lib/html.js";
import { UNKNOWN, capitalise, formatMeasurement } from "../lib/format.js";

/**
 * The unit definition for a field, or an empty one when the units data has none.
 *
 * @param {object | undefined} units the units repository
 * @param {string} field
 * @returns {{ unit?: string | null, decimals?: number, significant?: number }}
 */
function definitionFor(units, field) {
  return units?.definitionFor(field) ?? {};
}

/**
 * The card's second line: the group, then the weight and the state together.
 *
 * @param {object} element
 * @param {{ category: object | null, units: object | undefined }} options
 * @returns {string}
 */
export function cardMeta({ element, category, units }) {
  const group = category?.name ?? UNKNOWN;
  const weight = formatMeasurement(element.atomicWeight, definitionFor(units, "atomicWeight"));
  const state = capitalise(element.state) || UNKNOWN;

  return `<span class="card__meta">
<span class="card__name">${escapeHtml(element.name)}</span>
<span class="card__group">${escapeHtml(group)}</span>
<span class="card__facts">${escapeHtml(weight)} · ${escapeHtml(state)}</span>
</span>`;
}

/**
 * One card, as a list item.
 *
 * @param {{
 *   element: object,
 *   category?: object | null,
 *   units?: object
 * }} options `category` is the element's own category record, looked up by the caller
 * @returns {string}
 */
export function elementCard({ element, category = null, units }) {
  return `<li class="card"${attributes({
    "data-element-card": true,
    "data-name": element.name.toLowerCase(),
    "data-symbol": element.symbol.toLowerCase(),
    "data-atomic-number": element.atomicNumber,
  })}>
<a class="card__link" href="/elements/${escapeHtml(element.slug)}/"${attributes({
    "data-key": element.category,
  })}>
<span class="card__tile"><span class="card__z">${escapeHtml(element.atomicNumber)}</span><span class="card__sym">${escapeHtml(element.symbol)}</span></span>
${cardMeta({ element, category, units })}
</a>
</li>`;
}

/**
 * Every element as its card, in the order given.
 *
 * @param {{ elements: object[], categories?: object[], units?: object }} options
 * @returns {string} the cards, one per line, ready to fill a list
 */
export function elementCards({ elements, categories = [], units }) {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  return elements
    .map((element) => elementCard({ element, category: bySlug.get(element.category) ?? null, units }))
    .join("\n");
}
