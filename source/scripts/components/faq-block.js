/**
 * The FAQ block: the questions a reader asks about one element, answered from its own record.
 *
 * The questions are fixed and the answers are measured. That split is the whole design: the
 * question list is written copy, friendlier than a label in a table, and every answer is produced
 * by the same formatter from the same units definition the property panel uses. Nothing is typed
 * twice, so a page cannot show a melting point in the panel that disagrees with the one in the
 * answer below it — the two are the same string.
 *
 * A question whose value the record does not have is left out rather than answered with the word
 * for not knowing: \"What is the melting point of Oganesson? Unknown\" is a worse sentence than
 * silence, and the property panel above is where an unknown value is recorded honestly. When every
 * answer is unknown the block renders nothing at all, so a page never carries an empty section.
 *
 * Pure: records in, strings out.
 */

import { escapeHtml } from "../lib/html.js";
import { UNKNOWN, formatMeasurement } from "../lib/format.js";

/**
 * The questions this block can ask, in the order a reader meets them: the temperatures an element
 * changes state at, then the two energies that describe how much it takes to make it change.
 *
 * @type {{ field: string, ask: (name: string) => string }[]}
 */
export const FAQ_FIELDS = [
  { field: "meltingPoint", ask: (name) => `What is the melting point of ${name}?` },
  { field: "boilingPoint", ask: (name) => `What is the boiling point of ${name}?` },
  { field: "electronegativity", ask: (name) => `What is the electronegativity of ${name}?` },
  { field: "heatOfVaporization", ask: (name) => `What is the heat of vaporization of ${name}?` },
  { field: "heatOfFusion", ask: (name) => `What is the heat of fusion of ${name}?` },
];

/**
 * The questions this element can be asked, with their answers.
 *
 * @param {object} element
 * @param {{ units: object }} options
 * @returns {{ question: string, answer: string }[]}
 */
export function faqEntries(element, { units } = {}) {
  const entries = [];

  for (const { field, ask } of FAQ_FIELDS) {
    const definition = units?.definitionFor(field) ?? {};
    const answer = formatMeasurement(element[field], definition);

    if (answer === UNKNOWN) {
      continue;
    }

    entries.push({ question: ask(element.name), answer });
  }

  return entries;
}

/**
 * The block as markup, or an empty string when this element has nothing to answer.
 *
 * @param {{ element: object, units: object }} options
 * @returns {string}
 */
export function faqBlock({ element, units }) {
  const entries = faqEntries(element, { units });

  if (entries.length === 0) {
    return "";
  }

  const rows = entries
    .map(
      (entry) => `<div class="faq__row">
<h3 class="faq__q">${escapeHtml(entry.question)}</h3>
<p class="faq__a">${escapeHtml(entry.answer)}</p>
</div>`,
    )
    .join("\n");

  return `<section class="faq" aria-labelledby="faq-title">
<h2 class="faq__title" id="faq-title">Questions about ${escapeHtml(element.name)}</h2>
${rows}
</section>`;
}
