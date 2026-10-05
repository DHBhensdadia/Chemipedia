import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createElementsRepository } from "../../scripts/data/elements-repository.js";
import { RESULT_LIMIT, elementSearch, matchesFor } from "../../scripts/components/element-search.js";

/**
 * A stand-in for the browser's fetch that reads the real file from disk.
 *
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function fromDisk(url) {
  const name = url.split("/").pop();
  const body = await readFile(new URL(`../../data/${name}`, import.meta.url), "utf8");

  return new Response(body, { status: 200, headers: { "content-type": "application/json" } });
}

const elements = await createElementsRepository({ fetchImpl: fromDisk });
const all = elements.all();

test("an exact symbol or atomic number is the first answer", () => {
  assert.equal(matchesFor(all, "H")[0].symbol, "H");
  assert.equal(matchesFor(all, "C")[0].symbol, "C");
  assert.equal(matchesFor(all, "6")[0].symbol, "C");
  assert.equal(matchesFor(all, "118")[0].symbol, "Og");
});

test("a query ignores case and space around it", () => {
  assert.equal(matchesFor(all, "hydro")[0].symbol, "H");
  assert.equal(matchesFor(all, "HYDROGEN")[0].symbol, "H");
  assert.equal(matchesFor(all, "  gold  ")[0].symbol, "Au");
});

test("names that begin with the query come before names that merely contain it", () => {
  const names = matchesFor(all, "tin", { limit: 4 }).map((element) => element.name);

  assert.deepEqual(names, ["Tin", "Platinum", "Astatine", "Actinium"]);
});

test("a query can match a name anywhere in it, not only at the start", () => {
  const matches = matchesFor(all, "um");

  assert.equal(matches[0].symbol, "He", "Helium ends in the query and is the lightest of them");
  assert.ok(matches.every((element) => element.name.toLowerCase().includes("um")));
});

test("within a rank, atomic order decides", () => {
  const names = matchesFor(all, "h", { limit: 4 }).map((element) => element.name);

  assert.deepEqual(names, ["Hydrogen", "Helium", "Holmium", "Hafnium"]);
});

test("a symbol query ranks its element above the names that begin with the same letters", () => {
  const names = matchesFor(all, "ca", { limit: 5 }).map((element) => element.name);

  assert.deepEqual(names, ["Calcium", "Carbon", "Cadmium", "Caesium", "Californium"]);
});

test("a query with no match, or no query at all, offers nothing", () => {
  assert.deepEqual(matchesFor(all, "zzz"), []);
  assert.deepEqual(matchesFor(all, "unobtainium"), []);
  assert.deepEqual(matchesFor(all, ""), []);
  assert.deepEqual(matchesFor(all, "   "), []);
  assert.deepEqual(matchesFor(all, null), []);
});

test("the list is capped, however common the query", () => {
  assert.equal(matchesFor(all, "a").length, RESULT_LIMIT);
  assert.equal(matchesFor(all, "a", { limit: 3 }).length, 3);
});

test("the search is a form that works without scripting", () => {
  const markup = elementSearch();

  assert.match(
    markup,
    /<form class="element-search" action="\/elements\/" method="get" role="search" data-element-search>/,
  );
  assert.match(markup, /<label class="visually-hidden" for="element-search">/);
  assert.match(markup, /id="element-search" name="q" type="search"/);
  assert.match(markup, /aria-controls="element-search-results"/);
  assert.match(markup, /<button class="element-search__button" type="submit">Search<\/button>/);
  assert.match(
    markup,
    /<ul class="element-search__results" id="element-search-results" data-element-search-results aria-live="polite"><\/ul>/,
  );
});

test("the form's destination, button and label can be replaced", () => {
  const markup = elementSearch({ action: "/elements", button: "Search", label: "Find an element" });

  assert.match(markup, /action="\/elements"/);
  assert.match(markup, />Search<\/button>/);
  assert.match(markup, /Find an element<\/label>/);
});
