/**
 * The element search: type a name, a symbol or a number, and go to the element.
 *
 * The form is a form first. It submits the query to the elements index by the browser's own means,
 * which works with JavaScript switched off, can be bookmarked and needs no behaviour module; the
 * behaviour this file adds is an improvement on top of that, not a replacement for it. With the
 * module attached, typing filters, and Enter goes straight to the first match — which is what
 * "find an element" should mean.
 *
 * The matching is its own function because it is the part worth testing: exact symbol and exact
 * atomic number first, then names that begin with the query, then symbols that begin with it, then
 * names that contain it anywhere. Within a rank, atomic order decides, so "h" offers Hydrogen
 * before Helium and Holmium rather than in the order the data happens to hold.
 *
 * Pure matching, string markup, and one attachment — the same shape as the rest of `components/`.
 */

import { attributes, escapeHtml } from "../lib/html.js";

/** The most results a query offers at once. */
export const RESULT_LIMIT = 8;

/**
 * The elements a query matches, best first.
 *
 * @param {object[]} elements
 * @param {string} query
 * @param {{ limit?: number }} [options]
 * @returns {object[]}
 */
export function matchesFor(elements, query, { limit = RESULT_LIMIT } = {}) {
  const text = String(query ?? "").trim().toLowerCase();

  if (text === "") {
    return [];
  }

  const ranked = [];

  for (const element of elements) {
    const name = element.name.toLowerCase();
    const symbol = element.symbol.toLowerCase();
    let rank = null;

    if (symbol === text || String(element.atomicNumber) === text) {
      rank = 0;
    } else if (name.startsWith(text)) {
      rank = 1;
    } else if (symbol.startsWith(text)) {
      rank = 2;
    } else if (name.includes(text)) {
      rank = 3;
    }

    if (rank !== null) {
      ranked.push({ element, rank });
    }
  }

  return ranked
    .sort((one, other) => one.rank - other.rank || one.element.atomicNumber - other.element.atomicNumber)
    .slice(0, limit)
    .map(({ element }) => element);
}

/**
 * The search as markup.
 *
 * @param {{
 *   action?: string,
 *   name?: string,
 *   id?: string,
 *   label?: string,
 *   placeholder?: string,
 *   button?: string
 * }} [options]
 * @returns {string}
 */
export function elementSearch({
  action = "/elements/",
  name = "q",
  id = "element-search",
  label = "Search for an element by name, symbol or atomic number",
  placeholder = "Name, symbol or number",
  button = "Find element",
} = {}) {
  return `<form${attributes({
    class: "element-search",
    action,
    method: "get",
    role: "search",
    "data-element-search": true,
  })}>
<label class="visually-hidden" for="${escapeHtml(id)}">${escapeHtml(label)}</label>
<input${attributes({
    class: "element-search__input",
    id,
    name,
    type: "search",
    placeholder,
    autocomplete: "off",
    "aria-controls": `${id}-results`,
  })}>
<button class="element-search__button" type="submit">${escapeHtml(button)}</button>
</form>
<ul${attributes({
    class: "element-search__results",
    id: `${id}-results`,
    "data-element-search-results": true,
    "aria-live": "polite",
  })}></ul>`;
}

/**
 * Bind the live filter to a rendered search.
 *
 * The form still submits when nothing matches, which is the honest outcome: the reader lands on
 * the elements index, which can search the whole 118 where this list shows the best few.
 *
 * @param {ParentNode} root
 * @param {{
 *   elements: object[],
 *   hrefFor?: (element: object) => string,
 *   limit?: number,
 *   go?: (href: string) => void
 * }} options `go` is injectable so a test or a router can take the navigation instead of `location`
 * @returns {() => void} teardown
 */
export function attachElementSearch(root, { elements, hrefFor, limit, go } = {}) {
  const form = root.querySelector("[data-element-search]");
  const input = form?.querySelector("input");
  const results = root.querySelector("[data-element-search-results]");

  if (!form || !input || !results) {
    return () => {};
  }

  const linkFor = hrefFor ?? ((element) => `/elements/${element.slug}/`);
  const navigate = go ?? ((href) => window.location.assign(href));
  let matches = [];

  function render() {
    const query = input.value.trim();

    matches = matchesFor(elements, query, { limit });

    if (query === "") {
      results.innerHTML = "";

      return;
    }

    if (matches.length === 0) {
      results.innerHTML = `<li class="element-search__empty">No element matches &ldquo;${escapeHtml(query)}&rdquo;</li>`;

      return;
    }

    results.innerHTML = matches
      .map(
        (element) => `<li class="element-search__result"><a${attributes({
          class: "element-search__link",
          href: linkFor(element),
        })}><span class="element-search__sym">${escapeHtml(element.symbol)}</span><span class="element-search__name">${escapeHtml(element.name)}</span><span class="element-search__z">${escapeHtml(element.atomicNumber)}</span></a></li>`,
      )
      .join("\n");
  }

  function onSubmit(event) {
    if (matches.length > 0) {
      event.preventDefault();
      navigate(linkFor(matches[0]));
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      input.value = "";
      render();
    }
  }

  form.addEventListener("submit", onSubmit);
  input.addEventListener("input", render);
  input.addEventListener("keydown", onKeyDown);

  return () => {
    form.removeEventListener("submit", onSubmit);
    input.removeEventListener("input", render);
    input.removeEventListener("keydown", onKeyDown);
  };
}
