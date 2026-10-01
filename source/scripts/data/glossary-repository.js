/**
 * The only reader of `data/glossary.json`.
 *
 * The glossary is a page of four hundred terms with an A–Z index and a badge on each one saying
 * how hard it is. All of that is arrangement, and arrangement is testable: grouping by letter,
 * jumping to a letter, filtering by a word, and looking a term up by its URL are rules, not
 * content. They live here, where they can be tested against a handful of terms, rather than in a
 * page that needs all four hundred before it can be looked at.
 *
 * The definitions themselves are written in the glossary phase. This module knows what shape they
 * arrive in and nothing else about them.
 */

import { loadJson } from "./json-source.js";

/** The file this repository owns. */
export const GLOSSARY_FILE = "glossary.json";

/** The only difficulty levels a term may carry, hardest last. */
export const LEVELS = ["Beginner", "Novice", "Expert"];

/** The letters the index can group under. Terms are filed by the first letter of their slug. */
export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Read the glossary and return its queries.
 *
 * @param {{ fetchImpl?: typeof fetch, base?: string }} [options] injected so tests need no network
 * @returns {Promise<object>}
 */
export async function createGlossaryRepository({ fetchImpl = fetch, base } = {}) {
  const terms = await loadJson(GLOSSARY_FILE, { fetchImpl, base });

  if (!Array.isArray(terms)) {
    throw new TypeError(`${GLOSSARY_FILE} should hold an array of terms`);
  }

  const bySlug = new Map(terms.map((entry) => [entry.slug, entry]));

  /**
   * Terms sorted the way a reader reads them, which is how an index has to be built.
   *
   * @returns {object[]}
   */
  const sorted = () =>
    [...terms].sort((one, other) => one.term.localeCompare(other.term, "en", { sensitivity: "base" }));

  return {
    /** Every term, in reading order. */
    all: sorted,

    /** How many terms there are, so a caller never writes `all().length`. */
    count: () => terms.length,

    /**
     * One term by slug.
     *
     * @param {string} slug
     * @returns {object | null}
     */
    bySlug: (slug) => bySlug.get(slug) ?? null,

    /**
     * The letters that actually have terms under them, in order.
     *
     * Derived from the content rather than from the alphabet, so the index cannot offer a letter
     * that leads to an empty page.
     *
     * @returns {string[]}
     */
    letters: () => {
      const present = new Set(sorted().map((entry) => entry.slug.charAt(0).toUpperCase()));

      return LETTERS.filter((letter) => present.has(letter));
    },

    /**
     * The terms filed under a letter, in reading order.
     *
     * @param {string} letter
     * @returns {object[]}
     */
    byLetter: (letter) => {
      const wanted = String(letter ?? "").trim().charAt(0).toUpperCase();

      return sorted().filter((entry) => entry.slug.charAt(0).toUpperCase() === wanted);
    },

    /**
     * The terms whose text contains a word, matched against both term and definition.
     *
     * A reader searching a glossary may know the word and not the term — "the study of reaction
     * rates" should find *kinetics* — so the definition is searched too, and an empty query
     * returns everything rather than nothing.
     *
     * @param {string} query
     * @returns {object[]}
     */
    search: (query) => {
      const wanted = String(query ?? "").trim().toLowerCase();

      if (wanted === "") {
        return sorted();
      }

      return sorted().filter(
        (entry) =>
          entry.term.toLowerCase().includes(wanted) ||
          entry.definition.toLowerCase().includes(wanted),
      );
    },

    /**
     * How many terms carry each difficulty level.
     *
     * @returns {Record<string, number>}
     */
    levelCounts: () =>
      Object.fromEntries(
        LEVELS.map((level) => [level, terms.filter((entry) => entry.level === level).length]),
      ),
  };
}
