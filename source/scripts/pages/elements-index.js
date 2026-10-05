/**
 * The elements index — 118 cards, and the filter over them.
 *
 * The page is two halves with one job each. The cards are written at build time, by
 * `elementsIndexPageValues`, so the index is a real document: a cold load, a crawler and a curl all
 * see all 118 elements with their names, groups, weights and states, and the page works with the
 * script switched off. The filter is the page's behaviour, and it is an improvement laid over the
 * cards the document already holds rather than a second way of drawing them: `startElementsIndex`
 * walks the cards, matches each one's `data-` attributes against the query, and hides the ones that
 * do not match.
 *
 * The matching rule is one function, `indexMatches`, and it answers the question the exit criteria
 * ask — name, symbol and atomic number. A query of digits is an atomic number and is matched
 * exactly, because nobody types the first digit of an atomic number looking for a hundred and
 * eighteen elements. Anything else is matched against the name and the symbol, and the cards keep
 * the document's atomic order: a filter is not a search result, so it reorders nothing.
 *
 * The index is also where the home page's finder lands: that form submits `?q=` here by the
 * browser's own means, and this module reads the query on the way in so the reader arrives at the
 * page already filtered. The submission is not intercepted — a form that works without a script
 * stays a form that works without a script.
 */

import { elementCards } from "../components/element-card.js";

/** The query parameter the home page's finder submits, and this page reads. */
export const QUERY_PARAM = "q";

/**
 * Whether an element matches a query.
 *
 * @param {{ name: string, symbol: string, atomicNumber: number }} element
 * @param {string} query
 * @returns {boolean} every element matches an empty query
 */
export function indexMatches(element, query) {
  const text = String(query ?? "").trim().toLowerCase();

  if (text === "") {
    return true;
  }

  if (/^\d+$/.test(text)) {
    return element.atomicNumber === Number(text);
  }

  return (
    element.name.toLowerCase().includes(text) ||
    element.symbol.toLowerCase().startsWith(text)
  );
}

/**
 * The elements a query matches, in the order they arrive in.
 *
 * @param {object[]} elements
 * @param {string} query
 * @returns {object[]}
 */
export function matchingElements(elements, query) {
  return elements.filter((element) => indexMatches(element, query));
}

/**
 * What the status line says: the count, and the query when there is one.
 *
 * The count is not decoration. A filter that hides 106 cards without saying how many are left
 * leaves a reader looking at a short list and wondering whether the page is broken.
 *
 * @param {number} total
 * @param {number} matched
 * @param {string} query
 * @returns {string}
 */
export function indexStatus(total, matched, query) {
  const text = String(query ?? "").trim();
  const plural = (count) => `${count} ${count === 1 ? "element" : "elements"}`;

  if (text === "" || matched === total) {
    return plural(total);
  }

  if (matched === 0) {
    return `No element matches \u201c${text}\u201d`;
  }

  return `${matched} of ${plural(total)} ${matched === 1 ? "matches" : "match"} \u201c${text}\u201d`;
}

/**
 * Every block the index's template asks for.
 *
 * @param {{ elements: object[], categories?: object[], units?: object }} options
 * @returns {{ cards: string, status: string }}
 */
export function elementsIndexPageValues({ elements, categories = [], units }) {
  return {
    cards: elementCards({ elements, categories, units }),
    status: indexStatus(elements.length, elements.length, ""),
  };
}

/**
 * The query the page was opened with, from `?q=`.
 *
 * @param {Document} root
 * @returns {string}
 */
function queryFromLocation(root) {
  const view = root?.defaultView ?? (typeof window === "undefined" ? null : window);

  return new URLSearchParams(view?.location?.search ?? "").get(QUERY_PARAM) ?? "";
}

/**
 * Start the index's filter: hide the cards that do not match, keep the status line honest, and
 * honour a query the page arrived with.
 *
 * @param {Document} [root]
 * @returns {() => void} teardown
 */
export function startElementsIndex(root = document) {
  const form = root.querySelector("[data-index-search]");
  const input = root.querySelector("[data-index-input]");
  const status = root.querySelector("[data-index-status]");
  const entries = [...root.querySelectorAll("[data-element-card]")].map((card) => ({
    card,
    element: {
      name: card.dataset.name ?? "",
      symbol: card.dataset.symbol ?? "",
      atomicNumber: Number(card.dataset.atomicNumber),
    },
  }));

  if (!input || entries.length === 0) {
    return () => {};
  }

  function apply(query) {
    let matched = 0;

    for (const { card, element } of entries) {
      const hit = indexMatches(element, query);

      card.hidden = !hit;
      matched += hit ? 1 : 0;
    }

    if (status) {
      status.textContent = indexStatus(entries.length, matched, query);
    }
  }

  const onInput = () => apply(input.value);
  const onSubmit = (event) => {
    event.preventDefault();
    apply(input.value);
  };

  input.addEventListener("input", onInput);
  form?.addEventListener("submit", onSubmit);

  const initial = queryFromLocation(root);

  if (initial !== "") {
    input.value = initial;
  }

  apply(input.value);

  return () => {
    input.removeEventListener("input", onInput);
    form?.removeEventListener("submit", onSubmit);
  };
}
