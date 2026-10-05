import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";
import {
  QUERY_PARAM,
  elementsIndexPageValues,
  indexMatches,
  indexStatus,
  matchingElements,
} from "../../scripts/pages/elements-index.js";
import { routes } from "../../scripts/router/routes.js";

const template = await readFile(new URL("../../pages/elements-index.html", import.meta.url), "utf8");
const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);
const names = (query) => matchingElements(elements, query).map((element) => element.symbol);

test("the index is a declared route, and the finder's own destination", () => {
  const route = routes.find((candidate) => candidate.path === "/elements/");

  assert.ok(route, "the elements index is not declared");
  assert.equal(route.template, "elements-index");
  assert.deepEqual(route.styles, [
    "styles/components/periodic-table.css",
    "styles/components/element-card.css",
  ]);
  assert.equal(QUERY_PARAM, "q", "the home finder submits `?q=`, so this page reads the same name");
});

test("the filter matches a name, a symbol and an atomic number", () => {
  assert.equal(indexMatches(bySymbol("H"), ""), true, "an empty query filters nothing out");
  assert.equal(indexMatches(bySymbol("H"), "   "), true);

  assert.equal(indexMatches(bySymbol("Fe"), "iron"), true, "a name matches");
  assert.equal(indexMatches(bySymbol("Fe"), "IRON"), true, "case is folded");
  assert.equal(indexMatches(bySymbol("Fe"), "fe"), true, "a symbol matches");
  assert.equal(indexMatches(bySymbol("Fe"), "f"), true, "a symbol's first letter matches");
  assert.equal(indexMatches(bySymbol("Fe"), "26"), true, "an atomic number matches");

  assert.equal(indexMatches(bySymbol("Fe"), "irons"), false);
  assert.equal(indexMatches(bySymbol("Fe"), "262"), false, "an atomic number is matched exactly");
  assert.equal(indexMatches(bySymbol("Fe"), "h"), false);
  assert.equal(indexMatches(bySymbol("Fe"), "b"), false, "no name and no symbol begins with b");
});

test("a query nobody matches returns nothing rather than everything", () => {
  assert.deepEqual(names("zzzz"), []);
  assert.deepEqual(names("999"), []);
});

test("a digit query is an atomic number and finds exactly one element", () => {
  assert.deepEqual(names("79"), ["Au"]);
  assert.deepEqual(names("1"), ["H"]);
  assert.deepEqual(names("118"), ["Og"]);
});

test("a name filter keeps atomic order, and a symbol filter finds the family", () => {
  assert.deepEqual(names("hydro"), ["H"]);
  assert.deepEqual(names("irons"), []);

  // Six elements carry "ca" in their name or at the start of their symbol — carbon's name, not
  // its symbol — and they arrive in atomic order because a filter reorders nothing.
  const ca = names("ca");

  assert.deepEqual(ca, ["C", "Ca", "Sc", "Cd", "Cs", "Cf"]);
  assert.deepEqual(
    ca,
    [...ca].sort((one, other) => bySymbol(one).atomicNumber - bySymbol(other).atomicNumber),
  );

  // Seventy-nine names hold "ium", and every one of them is the same kind of word.
  assert.equal(names("ium").length, 79);
});

test("the status line counts what is left, in the project's own words", () => {
  assert.equal(indexStatus(118, 118, ""), "118 elements");
  assert.equal(indexStatus(1, 1, "hydrogen"), "1 element");
  assert.equal(indexStatus(118, 12, "hyd"), "12 of 118 elements match \u201chyd\u201d");
  assert.equal(indexStatus(118, 1, "gold"), "1 of 118 elements matches \u201cgold\u201d");
  assert.equal(indexStatus(118, 0, "zzz"), "No element matches \u201czzz\u201d");
});

test("the page's blocks fill its template, with a card for every element", () => {
  const values = elementsIndexPageValues({
    elements,
    categories: context.categories,
    units: context.units,
  });

  assert.deepEqual(Object.keys(values).sort(), placeholderKeys(template).sort());

  const page = fillTemplate(template, values, { name: "pages/elements-index.html" });

  assert.deepEqual(placeholderKeys(page), []);
  assert.equal((page.match(/data-element-card/g) ?? []).length, 118);
  assert.match(page, /role="status"[^>]*>118 elements</);
  assert.match(page, /<form class="idx-search" action="\/elements\/" method="get" role="search"/);
  assert.match(page, /name="q"/);

  // Every card links somewhere, and every link is an element page.
  const links = [...page.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);
  const elementLinks = links.filter((href) => href.startsWith("/elements/"));

  assert.equal(elementLinks.length, 118);

  for (const href of elementLinks) {
    assert.match(href, /^\/elements\/[a-z-]+\/$/);
  }

  assert.equal(new Set(elementLinks).size, 118, "two cards point at the same page");
});
