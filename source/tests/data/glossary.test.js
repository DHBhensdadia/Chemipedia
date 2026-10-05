import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  LETTERS,
  LEVELS,
  createGlossaryRepository,
  GLOSSARY_FILE,
} from "../../scripts/data/glossary-repository.js";

/**
 * A handful of terms standing in for the four hundred.
 *
 * The definitions are written here and belong to no glossary but this one. What is under test is
 * the arrangement — grouping, jumping, searching, looking up — which is the same for six terms as
 * for four hundred, and much easier to see when it goes wrong.
 */
const FIXTURE = [
  { term: "Kinetics", slug: "kinetics", level: "Expert", definition: "The study of how fast a reaction goes." },
  { term: "Acid", slug: "acid", level: "Beginner", definition: "A substance that gives up a proton." },
  { term: "Mole", slug: "mole", level: "Beginner", definition: "The amount of a substance holding Avogadro's number of particles." },
  { term: "Isotope", slug: "isotope", level: "Novice", definition: "One of two atoms of an element with different numbers of neutrons." },
  { term: "Zinc", slug: "zinc", level: "Novice", definition: "A metal that protects steel by corroding in its place." },
  { term: "Period", slug: "period", level: "Novice", definition: "A row of the periodic table." },
];

/** @param {unknown} body @returns {Promise<Response>} */
const serving = (body) =>
  Promise.resolve(new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } }));

const glossary = await createGlossaryRepository({ fetchImpl: () => serving(FIXTURE) });

test("the repository reads the file it says it owns", async () => {
  let requested = null;

  await createGlossaryRepository({
    fetchImpl: (url) => {
      requested = url;
      return serving(FIXTURE);
    },
  });

  assert.ok(requested.endsWith(GLOSSARY_FILE), `asked for ${requested}`);
});

test("every term is available, in reading order", () => {
  assert.equal(glossary.count(), FIXTURE.length);
  assert.deepEqual(
    glossary.all().map((entry) => entry.term),
    ["Acid", "Isotope", "Kinetics", "Mole", "Period", "Zinc"],
  );
});

test("a term resolves by its slug and a missing one returns null", () => {
  assert.equal(glossary.bySlug("mole").term, "Mole");
  assert.equal(glossary.bySlug("unobtainium"), null);
});

test("the index offers only the letters that have terms under them", () => {
  assert.deepEqual(glossary.letters(), ["A", "I", "K", "M", "P", "Z"]);
});

test("a letter returns its terms and an unused letter returns none", () => {
  assert.deepEqual(glossary.byLetter("a").map((entry) => entry.term), ["Acid"]);
  assert.deepEqual(glossary.byLetter("Q"), []);
  assert.deepEqual(glossary.byLetter("m").map((entry) => entry.term), ["Mole"]);
});

test("a search matches the term, and also the definition a reader half-remembers", () => {
  assert.deepEqual(glossary.search("mole").map((entry) => entry.term), ["Mole"]);
  assert.deepEqual(
    glossary.search("proton").map((entry) => entry.term),
    ["Acid"],
    "the word is only in the definition",
  );
  assert.deepEqual(glossary.search("NEUTRON").map((entry) => entry.term), ["Isotope"]);
});

test("an empty search returns everything rather than nothing", () => {
  assert.equal(glossary.search("").length, FIXTURE.length);
  assert.equal(glossary.search(null).length, FIXTURE.length);
});

test("the difficulty levels are counted and add up", () => {
  const counts = glossary.levelCounts();

  assert.deepEqual(Object.keys(counts), LEVELS);
  assert.deepEqual(counts, { Beginner: 2, Novice: 3, Expert: 1 });
  assert.equal(
    Object.values(counts).reduce((sum, count) => sum + count, 0),
    glossary.count(),
  );
});

test("every term carries the shape the page expects", () => {
  for (const entry of glossary.all()) {
    assert.equal(typeof entry.term, "string");
    assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${entry.term} has an unsafe slug`);
    assert.ok(LEVELS.includes(entry.level), `${entry.term} has the level "${entry.level}"`);
    assert.ok(entry.definition.trim() !== "", `${entry.term} has no definition`);
  }
});

test("the data file must hold an array", async () => {
  await assert.rejects(
    () => createGlossaryRepository({ fetchImpl: () => serving({ terms: [] }) }),
    TypeError,
  );
});

/**
 * The glossary the site actually ships, read from disk.
 *
 * The tests above hold the arrangement with six terms, which is where a rule is easy to see. These
 * hold the content: that the file found its four hundred and eighteen, that every letter of the
 * alphabet has something under it because the index offers only the letters that do, and that each
 * definition is finished prose rather than a placeholder.
 *
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function shippedFromDisk(url) {
  const name = url.split("/").pop();
  const body = await readFile(new URL(`../../data/${name}`, import.meta.url), "utf8");

  return new Response(body, { status: 200, headers: { "content-type": "application/json" } });
}

const shipped = await createGlossaryRepository({ fetchImpl: shippedFromDisk });

test("the shipped glossary holds the four hundred and eighteen terms the site promises", () => {
  assert.equal(shipped.count(), 418);
});

test("every letter of the alphabet has terms under it, so no jump leads nowhere", () => {
  assert.deepEqual(shipped.letters(), LETTERS);
});

test("every shipped term is complete enough to publish", () => {
  for (const entry of shipped.all()) {
    assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${entry.term} has an unsafe slug`);
    assert.ok(LEVELS.includes(entry.level), `${entry.term} has the level "${entry.level}"`);
    assert.ok(entry.definition.trim().length >= 60, `${entry.term}'s definition is too short`);
    assert.ok(entry.definition.length <= 400, `${entry.term}'s definition is too long`);
    assert.match(entry.definition.trim(), /[.!?]$/, `${entry.term}'s definition is not finished`);
  }
});

test("no two shipped terms share a slug or a name", () => {
  const entries = shipped.all();
  const slugs = new Set(entries.map((entry) => entry.slug));
  const names = new Set(entries.map((entry) => entry.term.toLowerCase()));

  assert.equal(slugs.size, entries.length);
  assert.equal(names.size, entries.length);
});
