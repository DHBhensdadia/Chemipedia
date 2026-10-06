/**
 * The glossary index — every term, under its letter, with a filter over the lot.
 *
 * The page is one list of four hundred and eighteen rows. Each row is a term, its definition and
 * its difficulty badge, and the rows are filed under one heading per letter so that a reader can
 * walk the alphabet or jump straight to a letter from the rail.
 *
 * It is written at build time, like every other family here: the rows are in the document before
 * any script runs, so the page is a real page to a crawler, to a reader with the script switched
 * off, and to the first paint. The filter is an improvement laid over those rows — it hides the
 * ones that do not match, hides a letter that has nothing left under it, and keeps the count
 * honest — rather than a second way of drawing the list.
 *
 * The grouping rule is not repeated here. The repository owns which letters have terms under them
 * and what order those terms read in, and this module asks it, so a page cannot offer a letter
 * that leads to an empty heading.
 */

import { LEVELS } from "../data/glossary-repository.js";
import { attributes, classNames, escapeHtml } from "../lib/html.js";

/** The index's lede, in our own words. */
export const INDEX_LEDE =
  "Every word this site uses to explain the chemistry it shows, with a plain definition and a " +
  "badge saying how much each one assumes you already know.";

/** The query parameter the page reads, so a link can arrive already filtered. */
export const QUERY_PARAM = "q";

/**
 * Whether a term matches a query.
 *
 * The definition is searched as well as the term, because a reader who wants a word often knows
 * the idea and not the name: searching for the study of reaction rates should reach kinetics. This
 * is the same rule the repository's own search follows, applied here to the rows already in the
 * document.
 *
 * @param {{ term: string, definition: string }} entry
 * @param {string} query
 * @returns {boolean} every term matches an empty query
 */
export function termMatches(entry, query) {
  const wanted = String(query ?? "").trim().toLowerCase();

  if (wanted === "") {
    return true;
  }

  return (
    entry.term.toLowerCase().includes(wanted) ||
    entry.definition.toLowerCase().includes(wanted)
  );
}

/**
 * What the status line says.
 *
 * A filter that hides four hundred rows without a word leaves a reader wondering whether the page
 * broke, so the line always carries the count and names the query when there is one.
 *
 * @param {number} total
 * @param {number} matched
 * @param {string} query
 * @returns {string}
 */
export function glossaryStatus(total, matched, query) {
  const text = String(query ?? "").trim();
  const count = (value) => `${value} ${value === 1 ? "term" : "terms"}`;

  if (text === "" || matched === total) {
    return count(total);
  }

  if (matched === 0) {
    return `No term matches \u201c${text}\u201d`;
  }

  return `${matched} of ${count(total)} ${matched === 1 ? "matches" : "match"} \u201c${text}\u201d`;
}

/**
 * One difficulty badge.
 *
 * @param {string} level
 * @returns {string}
 * @throws {TypeError} when the level is not one of the three, rather than drawing an unstyled one
 */
export function levelBadge(level) {
  if (!LEVELS.includes(level)) {
    throw new TypeError(`Not a difficulty level: ${level}`);
  }

  const modifier = `gls-lvl--${level.toLowerCase()}`;

  return `<span class="${classNames("gls-lvl", modifier)}">${escapeHtml(level)}</span>`;
}

/**
 * One row: the term, its definition and its badge, as a link to the term's own page.
 *
 * The term and the definition are copied into `data-` attributes so the filter can read them
 * without walking the text of the document, which is both quicker and unaffected by the badge or
 * by anything added to the row later.
 *
 * @param {{ term: string, slug: string, level: string, definition: string }} entry
 * @returns {string}
 */
export function termRow(entry) {
  const letter = entry.slug.charAt(0).toUpperCase();

  return `<li${attributes({
    class: "gls-row",
    "data-glossary-row": true,
    "data-letter": letter,
    "data-term": entry.term,
    "data-definition": entry.definition,
  })}>
<a class="gls-row__link" href="/glossary/${encodeURIComponent(entry.slug)}/">
<span class="gls-row__term">${escapeHtml(entry.term)}</span>
<span class="gls-row__def">${escapeHtml(entry.definition)}</span>
${levelBadge(entry.level)}
</a>
</li>`;
}

/**
 * The letter blocks, in the repository's reading order.
 *
 * A letter with no terms under it gets no block at all, which is the same rule the rail follows:
 * the repository answers which letters exist, and both the rail and the list are drawn from that
 * one answer.
 *
 * @param {{ letters: () => string[], byLetter: (letter: string) => object[] }} glossary
 * @returns {string}
 */
export function letterBlocks(glossary) {
  return glossary
    .letters()
    .map((letter) => {
      const rows = glossary.byLetter(letter).map(termRow).join("\n");

      return `<section${attributes({
        class: "gls-letter",
        id: `letter-${letter}`,
        "data-letter-block": letter,
      })}>
<h2 class="gls-letter__h">${escapeHtml(letter)}</h2>
<ul class="gls-list">
${rows}
</ul>
</section>`;
    })
    .join("\n");
}

/**
 * The rail of letters down the left edge.
 *
 * Each link carries the letter as its accessible name spelled out, because a link whose whole text
 * is one lower-case letter is a poor thing to read aloud.
 *
 * @param {{ letters: () => string[] }} glossary
 * @returns {string}
 */
export function jumpRail(glossary) {
  const links = glossary
    .letters()
    .map(
      (letter) =>
        `<a${attributes({
          class: "gls-rail__item",
          href: `#letter-${letter}`,
          "data-letter-link": letter,
          "aria-label": `Jump to ${letter}`,
        })}>${escapeHtml(letter.toLowerCase())}</a>`,
    )
    .join("\n");

  return `<nav class="gls-rail" aria-label="Jump to a letter">
${links}
</nav>`;
}

/**
 * Every block the index's template asks for.
 *
 * The keys are in the order their template asks for them, which is what lets the render test hold
 * the two files to each other.
 *
 * @param {{ glossary: object }} options the glossary repository, which owns the reading order and
 *   which letters have terms under them
 * @returns {{ lede: string, status: string, jump: string, sections: string }}
 */
export function glossaryIndexValues({ glossary }) {
  const total = glossary.count();

  return {
    lede: INDEX_LEDE,
    status: glossaryStatus(total, total, ""),
    jump: jumpRail(glossary),
    sections: letterBlocks(glossary),
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
 * Start the filter: hide the rows that do not match, hide the letters left with nothing, and keep
 * the status line and the rail honest.
 *
 * @param {Document} [root]
 * @returns {() => void} teardown
 */
export function startGlossaryIndex(root = document) {
  const input = root.querySelector("[data-glossary-input]");
  const form = root.querySelector("[data-glossary-search]");
  const status = root.querySelector("[data-glossary-status]");
  const rows = [...root.querySelectorAll("[data-glossary-row]")].map((row) => ({
    row,
    entry: { term: row.dataset.term ?? "", definition: row.dataset.definition ?? "" },
  }));
  const blocks = [...root.querySelectorAll("[data-letter-block]")];
  const links = [...root.querySelectorAll("[data-letter-link]")];

  if (!input || rows.length === 0) {
    return () => {};
  }

  function apply(query) {
    const visible = new Map();
    let matched = 0;

    for (const { row, entry } of rows) {
      const hit = termMatches(entry, query);

      row.hidden = !hit;
      matched += hit ? 1 : 0;

      const letter = row.dataset.letter ?? "";
      visible.set(letter, (visible.get(letter) ?? 0) + (hit ? 1 : 0));
    }

    for (const block of blocks) {
      block.hidden = (visible.get(block.dataset.letterBlock ?? "") ?? 0) === 0;
    }

    for (const link of links) {
      link.classList.toggle("is-empty", (visible.get(link.dataset.letterLink ?? "") ?? 0) === 0);
    }

    if (status) {
      status.textContent = glossaryStatus(rows.length, matched, query);
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
