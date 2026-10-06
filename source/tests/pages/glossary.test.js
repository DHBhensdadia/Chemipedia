import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { LEVELS } from "../../scripts/data/glossary-repository.js";
import {
  INDEX_LEDE,
  glossaryIndexValues,
  glossaryStatus,
  jumpRail,
  levelBadge,
  startGlossaryIndex,
  termMatches,
  termRow,
} from "../../scripts/pages/glossary.js";
import { elementsForTerm } from "../../scripts/lib/glossary-links.js";
import {
  glossaryTermValues,
  neighbours,
  relatedTerms,
  words,
} from "../../scripts/pages/glossary-term.js";
import { allRoutes, glossaryRoutes, routes } from "../../scripts/router/routes.js";
import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";

const context = await buildContext();
const { elements, categories, glossary } = context;
const terms = glossary.all();
const termPages = glossaryRoutes(terms);
const manifest = allRoutes(elements, categories, terms);
const declared = new Set(manifest.map((route) => route.path));
const routeBySlug = new Map(termPages.map((route) => [route.term.slug, route]));
const entryFor = (slug) => routeBySlug.get(slug).term;
const valuesFor = (slug) =>
  glossaryTermValues({ route: routeBySlug.get(slug), glossary, elements });
const indexValues = glossaryIndexValues({ glossary });

/**
 * Every destination in a block of markup, as it was written.
 *
 * The suite has no DOM, so a link is read out of the markup rather than out of a parsed tree — which
 * is also the honest reading, because what a crawler and a reader with the script off will follow is
 * the markup itself.
 */
const hrefsIn = (markup) => [...markup.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);

/**
 * A stand-in for the document the filter runs against.
 *
 * The filter touches four things on a row, two on a letter block and two on a rail link, so a fake
 * that answers the same selectors is enough to hold its rule. What is deliberately not faked is
 * layout: whether a hidden row is gone from the page is the browser's business, and the browser pass
 * is where that is answered.
 */
function fakeRoot({ rows = [], letters = [], query = "" } = {}) {
  /** The handlers a target was given, so a test can drive the page the way a reader does. */
  const listening = () => {
    const handlers = new Map();

    return {
      handlers,
      addEventListener: (name, handler) => handlers.set(name, handler),
      removeEventListener: (name) => handlers.delete(name),
      fire: (name, event = {}) => handlers.get(name)?.(event),
    };
  };
  const input = { value: "", ...listening() };
  const form = listening();
  const status = { textContent: "" };
  const blocks = letters.map((letter) => ({ hidden: false, dataset: { letterBlock: letter } }));
  const links = letters.map((letter) => {
    const classes = new Set();

    return {
      dataset: { letterLink: letter },
      classList: { toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)) },
      dimmed: () => classes.has("is-empty"),
    };
  });

  return {
    input,
    form,
    status,
    blocks,
    links,
    rows,
    document: {
      querySelector: (selector) =>
        ({
          "[data-glossary-input]": input,
          "[data-glossary-search]": form,
          "[data-glossary-status]": status,
        })[selector] ?? null,
      querySelectorAll: (selector) =>
        ({
          "[data-glossary-row]": rows,
          "[data-letter-block]": blocks,
          "[data-letter-link]": links,
        })[selector] ?? [],
      defaultView: { location: { search: query } },
    },
  };
}

/**
 * A page of three terms, filtered by typing into its own field.
 *
 * The filter is started once and driven through the events the browser would send, because that is
 * the only interface it has: it is not re-run. The rows, the blocks, the rail and the status line
 * are then read back from the same objects the filter was handed.
 */
function filteredPage(query) {
  const fake = fakeRoot({
    rows: [
      fakeRow("Acid", "A substance that gives up a proton.", "A"),
      fakeRow("Base", "A substance that takes a proton.", "B"),
      fakeRow("Buffer", "A solution that resists a change in pH.", "B"),
    ],
    letters: ["A", "B"],
  });
  const release = startGlossaryIndex(fake.document);
  const visible = () => fake.rows.filter((row) => !row.hidden).map((row) => row.dataset.term);
  const dim = () => fake.links.filter((link) => link.dimmed()).map((link) => link.dataset.letterLink);
  const type = (value) => {
    fake.input.value = value;
    fake.input.fire("input");
  };

  type(query ?? "");

  return { fake, release, visible, dim, type, collapsed: () => fake.blocks.filter((block) => block.hidden).map((block) => block.dataset.letterBlock) };
}

/** A row as the build writes one: the dataset the filter reads, and a `hidden` to set. */
const fakeRow = (term, definition, letter) => ({
  hidden: false,
  dataset: { term, definition, letter },
});

test("the site publishes one route per term, and every route is its own URL", () => {
  const paths = termPages.map((route) => route.path);

  assert.equal(termPages.length, 418);
  assert.equal(new Set(paths).size, 418, "two terms share a URL");
  assert.equal(manifest.length, routes.length + 118 + 11 + 418);
  assert.equal(routeBySlug.size, terms.length, "a term has no page");

  for (const route of termPages) {
    const { term } = route;

    assert.equal(route.template, "glossary-term");
    assert.equal(route.path, `/glossary/${term.slug}/`);
    assert.equal(route.section, "reference");
    assert.equal(route.path, `${route.path.replace(/\/$/, "")}/`, "the URL is not canonical");
    assert.ok(route.title.includes(term.term), `${route.path} does not name its term`);
    assert.equal(route.description, term.definition, `${route.path} does not say what it means`);
    assert.equal(
      route.styles.includes("styles/pages/glossary.css"),
      true,
      `${route.path} does not declare the family's sheet`,
    );
  }
});

test("the index files every term under its letter, once, under one heading per letter", () => {
  const letters = glossary.letters();

  assert.equal(letters.length, 26);
  assert.equal(letters.join(""), "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  assert.equal(indexValues.lede, INDEX_LEDE);

  const blocks = [...indexValues.sections.matchAll(/data-letter-block="([^"]*)"/g)].map(
    ([, letter]) => letter,
  );

  assert.deepEqual(blocks, letters, "the letter headings are not the letters that have terms");

  const filed = [...indexValues.sections.matchAll(/data-term="([^"]*)"/g)].map(([, term]) => term);

  assert.equal(filed.length, terms.length, "the index lists the wrong number of terms");
  assert.equal(new Set(filed).size, terms.length, "the index lists a term twice");

  for (const letter of letters) {
    const inBlock = glossary.byLetter(letter).map((entry) => entry.term);
    const block = indexValues.sections
      .split("<section")
      .find((part) => part.includes(`data-letter-block="${letter}"`));

    assert.ok(block, `${letter} has no block`);
    assert.equal(
      [...block.matchAll(/data-term="([^"]*)"/g)].length,
      inBlock.length,
      `${letter} does not hold its own terms`,
    );
  }
});

test("the rail offers one link per letter, and it lands on that letter's heading", () => {
  const rail = jumpRail(glossary);
  const links = [...rail.matchAll(/href="#letter-([^"]*)"/g)].map(([, letter]) => letter);

  assert.deepEqual(links, glossary.letters());
  assert.equal(new Set(links).size, links.length, "the rail repeats a letter");
  assert.match(rail, /aria-label="Jump to A"/);

  // Every jump target has to exist in the list, or the rail is a row of links to nowhere.
  for (const letter of links) {
    assert.match(indexValues.sections, new RegExp(`id="letter-${letter}"`), `${letter} has no target`);
  }
});

test("a row carries the term, its definition and its badge, and opens the term's page", () => {
  const row = termRow(entryFor("absolute-zero"));

  assert.match(row, /<li class="gls-row"/);
  assert.match(row, /data-letter="A"/);
  assert.match(row, /href="\/glossary\/absolute-zero\/"/);
  assert.match(row, /<span class="gls-row__term">Absolute zero<\/span>/);
  assert.match(row, /<span class="gls-row__def">/);
  assert.match(row, /class="gls-lvl gls-lvl--beginner">Beginner</);
});

test("a badge is drawn for the three levels and refused for anything else", () => {
  for (const level of LEVELS) {
    assert.match(levelBadge(level), new RegExp(`^<span class="gls-lvl gls-lvl--${level.toLowerCase()}">`));
  }

  assert.deepEqual(LEVELS, ["Beginner", "Novice", "Expert"]);
  assert.throws(() => levelBadge("Intermediate"), /Not a difficulty level: Intermediate/);
  assert.throws(() => levelBadge("beginner"), TypeError, "the level is the record's own spelling");
});

test("the filter reads the term and the definition, and an empty query keeps everything", () => {
  const entry = { term: "Kinetics", definition: "The study of how fast a reaction goes." };

  for (const query of ["", "   ", null, undefined]) {
    assert.equal(termMatches(entry, query), true, `${JSON.stringify(query)} hid the row`);
  }

  assert.equal(termMatches(entry, "kinet"), true);
  assert.equal(termMatches(entry, "KINETICS"), true);
  assert.equal(termMatches(entry, "how fast"), true, "the definition is not searched");
  assert.equal(termMatches(entry, "thermodynamics"), false);
});

test("the status line counts what is left, and names the query when it hid something", () => {
  assert.equal(glossaryStatus(418, 418, ""), "418 terms");
  assert.equal(glossaryStatus(418, 418, "acid"), "418 terms", "an unmoved list needs no query");
  assert.equal(glossaryStatus(418, 1, "acid"), "1 of 418 terms matches \u201cacid\u201d");
  assert.equal(glossaryStatus(418, 12, "acid"), "12 of 418 terms match \u201cacid\u201d");
  assert.equal(glossaryStatus(418, 0, "zzz"), "No term matches \u201czzz\u201d");
  assert.equal(glossaryStatus(1, 1, ""), "1 term");
});

test("the filter hides what does not match and keeps the count honest", () => {
  const page = filteredPage("");

  assert.deepEqual(page.visible(), ["Acid", "Base", "Buffer"]);
  assert.equal(page.fake.status.textContent, "3 terms");

  page.type("buffer");

  assert.deepEqual(page.visible(), ["Buffer"], "a row that does not match stayed");
  assert.equal(page.fake.status.textContent, "1 of 3 terms matches \u201cbuffer\u201d");

  page.type("proton");

  assert.deepEqual(page.visible(), ["Acid", "Base"], "the definition is not searched");
  assert.equal(page.fake.status.textContent, "2 of 3 terms match \u201cproton\u201d");

  page.type("nothing here");

  assert.deepEqual(page.visible(), []);
  assert.equal(page.fake.status.textContent, "No term matches \u201cnothing here\u201d");

  page.type("");

  assert.deepEqual(page.visible(), ["Acid", "Base", "Buffer"], "clearing the field did not restore");
  assert.deepEqual(page.dim(), [], "a letter stayed dimmed");
  assert.deepEqual(page.collapsed(), [], "a letter stayed folded up");

  page.release();
});

test("a letter with nothing left under it is folded up and its rail link stops looking live", () => {
  const page = filteredPage("buffer");

  assert.deepEqual(page.visible(), ["Buffer"]);
  assert.deepEqual(page.collapsed(), ["A"], "a letter with no rows left is still on the page");
  assert.deepEqual(page.dim(), ["A"]);

  page.type("acid");

  assert.deepEqual(page.collapsed(), ["B"]);
  assert.deepEqual(page.dim(), ["B"]);
  assert.equal(page.fake.status.textContent, "1 of 3 terms matches \u201cacid\u201d");
});

test("the filter arrives already applied when the URL carries a query, and stops at the edges", () => {
  const arrived = fakeRoot({
    rows: [fakeRow("Acid", "A substance that gives up a proton.", "A")],
    letters: ["A"],
    query: "?q=acid",
  });

  startGlossaryIndex(arrived.document);

  assert.equal(arrived.input.value, "acid", "the arriving query is not written into the field");
  assert.equal(arrived.status.textContent, "1 term", "a page that arrived filtered is not filtered");

  // A page with a field and no rows, and a page with no field at all, are both a teardown and
  // nothing else: the filter is an improvement on the build's own list, never its source.
  const rowsless = startGlossaryIndex(fakeRoot({ rows: [], letters: [] }).document);

  assert.equal(typeof rowsless, "function");
  assert.equal(rowsless(), undefined, "the teardown is callable");

  const bare = startGlossaryIndex({ querySelector: () => null, querySelectorAll: () => [] });

  assert.equal(bare(), undefined, "a document with no field gets a teardown and nothing else");
});

test("a term page names its term, prints its definition and points back at its letter", () => {
  const values = valuesFor("absolute-zero");

  assert.equal(values.name, "Absolute zero");
  assert.equal(values.letter, "A");
  assert.equal(values.backHref, "/glossary/#letter-A");
  assert.match(values.badge, /gls-lvl--beginner/);
  assert.equal(values.definition, entryFor("absolute-zero").definition);
  assert.ok(values.pager.includes('rel="next"'), "the first term has no next");
  assert.equal(values.pager.includes('rel="previous"'), false, "the first term has a previous");
});

test("the pager walks the reading order and stops at the ends", () => {
  const first = neighbours(terms[0], glossary);
  const last = neighbours(terms.at(-1), glossary);

  assert.equal(first.previous, null);
  assert.equal(first.next.slug, terms[1].slug);
  assert.equal(last.next, null);
  assert.equal(last.previous.slug, terms.at(-2).slug);

  const middle = valuesFor(terms[1].slug).pager;

  assert.match(middle, new RegExp(`href="/glossary/${terms[0].slug}/" rel="previous"`));
  assert.match(middle, new RegExp(`href="/glossary/${terms[2].slug}/" rel="next"`));
});

test("related terms share a word with the term, most shared first", () => {
  assert.deepEqual([...words("Atomic mass unit")], ["atomic", "unit"], "`mass` is a stop word");
  assert.deepEqual([...words("Acid")], [], "a word every term might share is not a relation");

  const unit = relatedTerms(entryFor("atomic-mass-unit"), glossary);

  assert.equal(unit.length, 6, "the limit is not applied");
  assert.equal(unit[0].slug, "atomic-number", "the closest relation is not first");
  assert.equal(
    unit.some((entry) => entry.slug === "atomic-mass-unit"),
    false,
    "a term is not related to itself",
  );

  const oxidation = relatedTerms(entryFor("oxidation"), glossary);

  assert.deepEqual(oxidation.map((entry) => entry.slug), ["oxidation-state"]);
  assert.deepEqual(relatedTerms(entryFor("acid"), glossary), []);
});

test("a term is linked from the elements whose own prose mentions it, as a whole word", () => {
  const acid = elementsForTerm(entryFor("acid"), elements);

  assert.equal(acid.length, 6);
  assert.deepEqual(
    acid.map((element) => element.name),
    ["Oxygen", "Sulphur", "Vanadium", "Antimony", "Tantalum", "Lead"],
  );

  // A word boundary, not a substring: `ion` must not fire on the end of `solution`.
  const ion = elementsForTerm({ term: "ion" }, [
    { summary: "A solution of salt." },
    { summary: "A positive ion." },
  ]);

  assert.deepEqual(ion.map((element) => element.summary), ["A positive ion."]);
  assert.equal(elementsForTerm(entryFor("zwitterion"), elements).length, 0, "an invented mention");
});

test("a term page carries its cross-links, and a term with no neighbours carries none", () => {
  const rail = valuesFor("isotope").related;

  assert.match(rail, /class="gls-side"/);
  assert.match(rail, /Terms it sits near/);
  assert.match(rail, /href="\/glossary\/kinetic-isotope-effect\/"/);
  assert.match(rail, /Elements that mention it/);
  assert.match(rail, /href="\/elements\/technetium\/"/);

  // A term can be mentioned by elements and share a word with no other term: `acid` has six element
  // links and no relations, so its aside carries the one block rather than a heading over nothing.
  assert.equal(valuesFor("acid").related.includes("Terms it sits near"), false);
  assert.match(valuesFor("acid").related, /Elements that mention it/);

  // A term with neither still has a page; it has no aside at all, rather than an empty one.
  assert.equal(valuesFor("absorbance").related, "");
});

test("a route with no term, or a term the glossary does not hold, is refused", () => {
  assert.throws(
    () => glossaryTermValues({ route: { path: "/glossary/acid/" }, glossary, elements }),
    /carries no term/,
  );
  assert.throws(
    () =>
      glossaryTermValues({
        route: { path: "/glossary/invented/", term: { slug: "invented", term: "Invented" } },
        glossary,
        elements,
      }),
    /carries a term the glossary does not hold/,
  );
});

test("every link the index writes is a declared route", () => {
  const links = hrefsIn(indexValues.sections);

  assert.equal(links.length, terms.length, "a row is missing its link or carries two");

  for (const href of links) {
    assert.ok(declared.has(href), `${href} is not a declared route`);
  }
});

test("every cross-link on every term page resolves", () => {
  let related = 0;
  let element = 0;

  for (const route of termPages) {
    const values = glossaryTermValues({ route, glossary, elements });

    for (const href of [...hrefsIn(values.related), ...hrefsIn(values.pager)]) {
      assert.ok(declared.has(href), `${route.path} links to ${href}, which is not a declared route`);

      if (href.startsWith("/glossary/")) {
        related += 1;
      } else {
        assert.match(href, /^\/elements\/[a-z-]+\/$/, `${route.path} links somewhere unexpected`);
        element += 1;
      }
    }
  }

  assert.ok(related > 100, `only ${related} term-to-term links were written`);
  assert.ok(element > 50, `only ${element} term-to-element links were written`);
});

test("the templates and their modules ask for the same blocks, in the same order", async () => {
  const families = [
    ["glossary-index", () => glossaryIndexValues({ glossary })],
    ["glossary-term", () => valuesFor("absolute-zero")],
  ];

  for (const [name, values] of families) {
    const template = await readFile(new URL(`../../pages/${name}.html`, import.meta.url), "utf8");
    const filled = fillTemplate(template, values(), { name: `pages/${name}.html` });

    assert.deepEqual(placeholderKeys(template), Object.keys(values()), `${name} asks for other blocks`);
    assert.deepEqual(placeholderKeys(filled), [], `${name} kept a placeholder`);
    assert.ok(filled.trim().length > 0, `${name} filled to nothing`);
    assert.doesNotMatch(filled, /<script/, `${name} would boot a script of its own`);
  }
});
