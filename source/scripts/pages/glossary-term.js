/**
 * A glossary term's own page — one module behind all four hundred and eighteen.
 *
 * The reference's term page carries the definition and nothing else, and gives the rest of its
 * space to two rails into sections this site does not build. Ours uses that space for what the
 * plan asked a term page to do: the definition, the terms it sits near, and the elements whose
 * entries mention it. Both of those lists are derived from the records rather than written, so a
 * correction to a definition or to an element's prose moves the links with it instead of leaving
 * them pointing at a word that is no longer there. The second list is the same relation the
 * element pages read from their own end, so it lives in `lib/glossary-links.js` rather than here.
 *
 * Runs at build time in Node. There is no behaviour: a term page is content, the router is the
 * only script it needs, and that is why it has no entry in the app's behaviour table.
 */

import { elementsForTerm } from "../lib/glossary-links.js";
import { attributes, escapeHtml } from "../lib/html.js";
import { levelBadge } from "./glossary.js";

/** Enough related terms to be useful and few enough to stay a column. */
const RELATED_LIMIT = 6;

/**
 * Words too common to mean anything when two terms share one.
 *
 * A term is related to another when their names share a word, so the words that every name might
 * share have to be left out or every term would be related to every other.
 */
const STOP_WORDS = new Set([
  "acid",
  "atom",
  "atoms",
  "bond",
  "bonds",
  "chemistry",
  "compound",
  "compounds",
  "constant",
  "effect",
  "energy",
  "equation",
  "forces",
  "group",
  "law",
  "level",
  "mass",
  "metal",
  "metals",
  "molecule",
  "molecules",
  "number",
  "point",
  "reaction",
  "reactions",
  "rule",
  "state",
  "theory",
  "water",
]);

/**
 * The words in a term's name that are worth matching on.
 *
 * @param {string} text
 * @returns {Set<string>}
 */
export function words(text) {
  const found = String(text ?? "")
    .toLowerCase()
    .match(/[a-z]{4,}/g) ?? [];

  return new Set(found.filter((word) => !STOP_WORDS.has(word)));
}

/**
 * Terms whose names share a word with this one, most shared first.
 *
 * @param {{ term: string, slug: string }} entry
 * @param {{ all: () => object[] }} glossary
 * @param {number} [limit]
 * @returns {object[]}
 */
export function relatedTerms(entry, glossary, limit = RELATED_LIMIT) {
  const mine = words(entry.term);

  if (mine.size === 0) {
    return [];
  }

  return glossary
    .all()
    .filter((other) => other.slug !== entry.slug)
    .map((other) => ({
      other,
      shared: [...words(other.term)].filter((word) => mine.has(word)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (one, other) =>
        other.shared - one.shared || one.other.term.localeCompare(other.other.term, "en"),
    )
    .slice(0, limit)
    .map(({ other }) => other);
}

/**
 * The terms either side of this one in reading order.
 *
 * @param {{ slug: string }} entry
 * @param {{ all: () => object[] }} glossary
 * @returns {{ previous: object | null, next: object | null }}
 */
export function neighbours(entry, glossary) {
  const entries = glossary.all();
  const index = entries.findIndex((other) => other.slug === entry.slug);

  return {
    previous: index > 0 ? entries[index - 1] : null,
    next: index >= 0 && index < entries.length - 1 ? entries[index + 1] : null,
  };
}

/**
 * A list of terms as pills.
 *
 * @param {object[]} entries
 * @returns {string}
 */
function termPills(entries) {
  const items = entries
    .map(
      (other) =>
        `<li><a class="gls-related__link" href="/glossary/${encodeURIComponent(other.slug)}/">` +
        `${escapeHtml(other.term)}</a></li>`,
    )
    .join("\n");

  return `<ul class="gls-related__list">\n${items}\n</ul>`;
}

/**
 * A list of elements as pills.
 *
 * @param {object[]} elements
 * @returns {string}
 */
function elementPills(elements) {
  const items = elements
    .map(
      (element) =>
        `<li><a class="gls-related__link" href="/elements/${encodeURIComponent(element.slug)}/">` +
        `${escapeHtml(element.name)}</a></li>`,
    )
    .join("\n");

  return `<ul class="gls-related__list">\n${items}\n</ul>`;
}

/**
 * The rail of terms and elements a term sits near, or nothing when it sits near none.
 *
 * @param {object} options
 * @returns {string}
 */
export function relatedRail(entry, glossary, elements) {
  const terms = relatedTerms(entry, glossary);
  const related = elementsForTerm(entry, elements);
  const blocks = [];

  if (terms.length > 0) {
    blocks.push(`<div class="gls-side__block">
<h2 class="gls-side__k">Terms it sits near</h2>
${termPills(terms)}
</div>`);
  }

  if (related.length > 0) {
    blocks.push(`<div class="gls-side__block">
<h2 class="gls-side__k">Elements that mention it</h2>
${elementPills(related)}
</div>`);
  }

  if (blocks.length === 0) {
    return "";
  }

  return `<aside class="gls-side">\n${blocks.join("\n")}\n</aside>`;
}

/**
 * The pager: the term before this one and the term after, in reading order.
 *
 * @param {{ previous: object | null, next: object | null }} options
 * @returns {string}
 */
export function pager({ previous, next }) {
  const link = (entry, direction, label) =>
    entry === null
      ? ""
      : `<a${attributes({
          class: `gls-pager__link gls-pager__link--${direction}`,
          href: `/glossary/${encodeURIComponent(entry.slug)}/`,
          rel: direction,
        })}>
<span class="gls-pager__k">${label}</span>
<span class="gls-pager__n">${escapeHtml(entry.term)}</span>
</a>`;

  const parts = [link(previous, "previous", "Previous"), link(next, "next", "Next")].filter(
    (part) => part !== "",
  );

  if (parts.length === 0) {
    return "";
  }

  return `<nav class="shell gls-pager" aria-label="Terms either side">\n${parts.join("\n")}\n</nav>`;
}

/**
 * Every block a term's template asks for.
 *
 * The keys are in the order their template asks for them, which is what lets the render test hold
 * the two files to each other.
 *
 * @param {{ route: { term: object }, glossary: object, elements: object[] }} options
 * @returns {{ backHref: string, letter: string, name: string, badge: string, definition: string, related: string, pager: string }}
 * @throws {TypeError} when the route carries no term, or one the glossary does not hold
 */
export function glossaryTermValues({ route, glossary, elements }) {
  const entry = route.term;

  if (!entry) {
    throw new TypeError(`The route ${route.path} carries no term`);
  }

  if (glossary.bySlug(entry.slug) === null) {
    throw new TypeError(`The route ${route.path} carries a term the glossary does not hold`);
  }

  const letter = entry.slug.charAt(0).toUpperCase();

  return {
    backHref: `/glossary/#letter-${letter}`,
    letter,
    name: entry.term,
    badge: levelBadge(entry.level),
    definition: entry.definition,
    related: relatedRail(entry, glossary, elements),
    pager: pager(neighbours(entry, glossary)),
  };
}
