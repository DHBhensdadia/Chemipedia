/**
 * The relation between a glossary term and the element entries that mention it.
 *
 * There is one relation here, and it is read from two ends: a term's page lists the elements whose
 * own prose mentions it, and an element's page lists the terms its own prose mentions. Both ends
 * have to agree — a term page that says oxygen mentions a word while the element page does not link
 * it back is a page disagreeing with the page beside it — so both are this file: one field list,
 * one whole-word rule, and one place to change when a definition stops using a word.
 *
 * The text searched is the prose a reader actually sees: the summary, the uses, the sources, and
 * what is known about the discovery. A term is linked from an element because the element's own
 * entry mentions it, not because some field or another happens to contain the letters.
 *
 * The match is on word boundaries, which is what keeps a term like `ion` from firing on the end of
 * `solution` — and, because both ends use the same rule, an element that mentions a term is
 * guaranteed to be on that term's page.
 */

/** How many elements one term's page lists before it stops. */
export const ELEMENT_LIMIT = 8;

/** The same, for the terms one element's page lists. */
export const TERM_LIMIT = 8;

/** Everything about an element that a reader might have met a glossary term in. */
const ELEMENT_TEXT_FIELDS = [
  "name",
  "symbol",
  "category",
  "block",
  "state",
  "crystalStructure",
  "summary",
  "uses",
  "sources",
];

/**
 * The text of an element's entry, as one string to search.
 *
 * @param {object} element
 * @returns {string}
 */
export function elementText(element) {
  const plain = ELEMENT_TEXT_FIELDS.map((field) => element[field] ?? "");
  const discovery = element.discovery ?? {};

  return [...plain, discovery.discoveredBy, discovery.place, discovery.nameOrigin]
    .filter((value) => typeof value === "string")
    .join(" \u00b7 ");
}

/**
 * Escape a string so it can be used inside a regular expression.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Whether some text mentions a name as a whole word.
 *
 * @param {string} text
 * @param {string} name
 * @returns {boolean}
 */
function mentions(text, name) {
  return new RegExp(`\\b${escapeRegExp(name)}\\b`, "i").test(text);
}

/**
 * The elements whose entries mention a term as a whole word, in atomic order.
 *
 * The list is capped, because a word like gas is genuinely mentioned by most of the table, and the
 * cap is the caller's to set: a term page keeps its own limit.
 *
 * @param {{ term: string }} entry
 * @param {object[]} elements every record, in atomic order
 * @param {number} [limit]
 * @returns {object[]}
 */
export function elementsForTerm(entry, elements, limit = ELEMENT_LIMIT) {
  return elements.filter((element) => mentions(elementText(element), entry.term)).slice(0, limit);
}

/**
 * The terms an element's entry mentions, in the glossary's reading order.
 *
 * The mirror of `elementsForTerm`, and deliberately the same rule read from the other end.
 *
 * @param {object} element
 * @param {{ all: () => object[] }} glossary
 * @param {number} [limit]
 * @returns {object[]}
 */
export function termsForElement(element, glossary, limit = TERM_LIMIT) {
  const text = elementText(element);

  return glossary
    .all()
    .filter((entry) => mentions(text, entry.term))
    .slice(0, limit);
}
