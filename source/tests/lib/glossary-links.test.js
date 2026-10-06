import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ELEMENT_LIMIT,
  TERM_LIMIT,
  elementText,
  elementsForTerm,
  termsForElement,
} from "../../scripts/lib/glossary-links.js";
import { buildContext } from "../../tools/build-context.js";

const context = await buildContext();
const { elements, glossary } = context;
const hydrogen = elements[0];
const entryFor = (slug) => glossary.bySlug(slug);

/** A glossary of two terms, for the assertions where the answer should be obvious. */
const twoTerms = {
  all: () => [
    { term: "Ion", slug: "ion" },
    { term: "Solution", slug: "solution" },
  ],
};

test("the text searched is the entry's prose, and nothing else", () => {
  const text = elementText(hydrogen);

  assert.match(text, /Hydrogen/);
  assert.match(text, /the lightest element/i, "the summary is not searched");
  assert.match(text, /Cavendish/, "what is known about the discovery is part of the entry");
  assert.equal(text.includes("1.008"), false, "a number is not something a term is mentioned in");
});

test("a mention is a whole word, so a term is not found inside another word", () => {
  const found = termsForElement({ summary: "A solution of salt." }, twoTerms);

  assert.deepEqual(found.map((entry) => entry.slug), ["solution"], "`Ion` fired inside `solution`");
  assert.deepEqual(
    elementsForTerm({ term: "Ion" }, [{ summary: "A solution of salt." }]),
    [],
    "the term's own direction is a different rule",
  );
  assert.equal(
    elementsForTerm({ term: "Ion" }, [{ summary: "A positive ion." }]).length,
    1,
    "a mention at a word boundary was missed",
  );
});

test("the two directions are one relation read from either end", () => {
  const table = [{ summary: "A positive ion carries a charge." }];

  assert.deepEqual(
    termsForElement(table[0], twoTerms).map((entry) => entry.slug),
    ["ion"],
  );
  assert.deepEqual(
    elementsForTerm({ term: "Ion" }, table).map((element) => element.summary),
    table.map((element) => element.summary),
  );
});

test("the two ends of the shipped relation agree, term for term", () => {
  let links = 0;

  for (const element of elements) {
    for (const entry of termsForElement(element, glossary)) {
      links += 1;

      // The term's own list is capped, so the check is made against the relation itself rather than
      // against the eight links a page shows: a term mentioned by twenty elements must still be
      // mentioned by this one.
      const mentioned = elementsForTerm(entry, elements, elements.length);

      assert.ok(
        mentioned.some((other) => other.slug === element.slug),
        `${entry.slug} does not list ${element.slug}, which lists it`,
      );
    }
  }

  assert.ok(links > 150, `only ${links} element-to-term links were written`);
});

test("a list is capped, and the cap is the caller's to set", () => {
  const gas = entryFor("gas");
  const all = elementsForTerm(gas, elements, elements.length);

  assert.equal(ELEMENT_LIMIT, 8);
  assert.equal(TERM_LIMIT, 8);
  assert.ok(all.length > ELEMENT_LIMIT, "the fixture no longer exercises the cap");
  assert.equal(elementsForTerm(gas, elements).length, ELEMENT_LIMIT);
  assert.equal(elementsForTerm(gas, elements, 3).length, 3);
  assert.equal(termsForElement(hydrogen, glossary, 2).length, 2);
  assert.deepEqual(
    termsForElement(hydrogen, glossary, 2).map((entry) => entry.slug),
    termsForElement(hydrogen, glossary, 8).slice(0, 2).map((entry) => entry.slug),
    "the cap does not take the list's own first entries",
  );
});
