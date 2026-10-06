/**
 * The data a build renders from.
 *
 * The browser reads the data files over HTTP through the repositories; the build needs the same
 * repositories and the same files, from disk. Rather than a second reader that could disagree with
 * the first — a different check for a missing field, a different notion of which record is which —
 * the build hands each repository a `fetch` that reads the file at the path it was asked for. The
 * repository, the validation and the indexes are then the same code in both places, and the only
 * thing that differs is where the bytes come from.
 *
 * The base is an absolute path for the same reason: `loadJson` builds `${base}/${name}`, so with the
 * data directory as the base the fetch's argument is already the file to open.
 *
 * Four files, once, however many routes the build renders. The manifest needs the elements and the
 * terms before it can even be assembled — the 118 element routes and the 418 glossary routes are
 * derived from the records — and every one of those pages reads the same repository.
 *
 * The glossary is handed over as the repository rather than as its array, because its pages ask it
 * questions: which letters have terms under them, what order the terms read in, which term is which
 * slug. A copy of the array could answer none of those.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { createCategoriesRepository } from "../scripts/data/categories-repository.js";
import { createElementsRepository } from "../scripts/data/elements-repository.js";
import { createGlossaryRepository } from "../scripts/data/glossary-repository.js";
import { createUnitsRepository } from "../scripts/data/units-repository.js";
import { sourceDir } from "./site-paths.js";

/** Where the authored data lives. The build copies this directory to `/data` in the output. */
export const dataDir = path.join(sourceDir, "data");

/**
 * A `fetch` that answers with the contents of a file.
 *
 * It answers the shape a repository reads and nothing else: `ok`, `status` and a `json()` that
 * parses. A missing file throws, because a build whose data is absent should stop rather than
 * render 118 pages of "Unknown".
 *
 * @param {string | URL} url the path to read
 * @returns {Promise<Response>}
 */
export async function fromDataFile(url) {
  const body = await readFile(String(url), "utf8");

  return new Response(body, {
    status: 200,
    statusText: "OK",
    headers: { "content-type": "application/json" },
  });
}

/**
 * Load every data file the build renders from.
 *
 * @returns {Promise<{ elements: object[], categories: object[], units: object, glossary: object }>}
 *   `units` and `glossary` are the repositories themselves: a page asks them a question rather than
 *   taking a copy of the table
 */
export async function buildContext() {
  const options = { fetchImpl: fromDataFile, base: dataDir };
  const [elements, categories, units, glossary] = await Promise.all([
    createElementsRepository(options),
    createCategoriesRepository(options),
    createUnitsRepository(options),
    createGlossaryRepository(options),
  ]);

  return { elements: elements.all(), categories: categories.all(), units, glossary };
}
