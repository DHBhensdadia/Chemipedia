import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { termsForElement } from "../../scripts/lib/glossary-links.js";
import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";
import {
  SIMILAR_LIMIT,
  elementPageValues,
  elementPager,
  elementSimilar,
  elementStrip,
  neighbouringElements,
  similarElements,
} from "../../scripts/pages/element-detail.js";
import { allRoutes, elementRoutes, routes } from "../../scripts/router/routes.js";
import { faqEntries } from "../../scripts/components/faq-block.js";
import { escapeHtml } from "../../scripts/lib/html.js";

const template = await readFile(new URL("../../pages/element-detail.html", import.meta.url), "utf8");
const context = await buildContext();
const elements = context.elements;
const byNumber = (atomicNumber) =>
  elements.find((element) => element.atomicNumber === atomicNumber);
const rendered = new Map(
  elements.map((element) => [
    element.atomicNumber,
    elementPageValues({
      element,
      elements,
      categories: context.categories,
      units: context.units,
      glossary: context.glossary,
    }),
  ]),
);
const valuesFor = (element) => rendered.get(element.atomicNumber);

/** The answers the FAQ block renders, in page order. */
function answersIn(markup) {
  return [...markup.matchAll(/<p class="faq__a">([^<]*)<\/p>/g)].map(([, answer]) => answer);
}

/** The values the property panel renders, as a set, so a quoted answer can be looked up in it. */
function panelValuesIn(markup) {
  return new Set(
    [...markup.matchAll(/<dd class="properties__v"[^>]*>([^<]*)<\/dd>/g)].map(([, value]) => value),
  );
}

test("the site publishes one route per element, and every route is its own URL", () => {
  const elementPages = elementRoutes(elements);
  const paths = elementPages.map((route) => route.path);

  assert.equal(elementPages.length, 118);
  assert.equal(new Set(paths).size, 118, "two elements share a URL");
  assert.equal(
    allRoutes(elements, context.categories, context.glossary.all()).length,
    routes.length + 118 + 11 + 418,
  );

  for (const [index, route] of elementPages.entries()) {
    const element = elements[index];

    assert.equal(route.template, "element-detail");
    assert.equal(route.path, `/elements/${element.slug}/`);
    assert.ok(route.title.includes(element.name), `${route.path} does not name its element`);
    assert.ok(route.title.includes(element.symbol), `${route.path} does not name its symbol`);
    assert.ok(route.title.includes(String(element.atomicNumber)), `${route.path} misses its atomic number`);
    assert.equal(route.description, element.summary);
  }
});

test("every element's page carries every block the template asks for", () => {
  for (const element of elements) {
    const values = valuesFor(element);

    assert.deepEqual(Object.keys(values), placeholderKeys(template), element.symbol);
    assert.deepEqual(placeholderKeys(fillTemplate(template, values)), [], element.symbol);

    for (const [name, block] of Object.entries(values)) {
      assert.equal(typeof block, "string", `${element.symbol}'s ${name} block is not a string`);
      assert.equal(block.includes("{{"), false, `${element.symbol}'s ${name} block holds a placeholder`);
    }

    // Four blocks may be empty, and only when the record has nothing to put in them: a page
    // never carries a section with nothing to say, and never leaves out one it could fill.
    assert.equal(values.orbital === "", element.shells.length === 0, `${element.symbol}'s orbital`);
    assert.equal(values.similar === "", similarElements(element, elements).length === 0, `${element.symbol}'s siblings`);
    assert.equal(values.faq === "", faqEntries(element, { units: context.units }).length === 0, `${element.symbol}'s FAQ`);
    assert.equal(
      values.glossary === "",
      termsForElement(element, context.glossary).length === 0,
      `${element.symbol}'s terms`,
    );

    for (const name of ["strip", "hero", "headline", "lede", "sections", "counts", "properties", "pager"]) {
      assert.ok(values[name].length > 0, `${element.symbol}'s ${name} block is empty`);
    }

    assert.match(values.headline, new RegExp(`<h1 class="el-name" id="element-name">${element.name}</h1>`));
    assert.ok(values.lede.includes(escapeHtml(element.summary)), `${element.symbol}'s lede is not its summary`);
    assert.ok(values.strip.includes(`aria-current="page"`), `${element.symbol}'s strip does not mark it`);
  }
});

test("the terms an element's entry mentions are links to their definitions", () => {
  const hydrogenTerms = termsForElement(byNumber(1), context.glossary);
  const markup = valuesFor(byNumber(1)).glossary;
  const links = [...markup.matchAll(/href="(\/glossary\/[^"]+)"/g)].map(([, href]) => href);

  assert.equal(hydrogenTerms.length, 7);
  assert.deepEqual(
    hydrogenTerms.map((entry) => entry.slug),
    ["atom", "electron", "element", "fuel-cell", "gas", "hydrocarbon", "proton"],
    "the entry's terms are not the glossary's reading order",
  );
  assert.equal(links.length, hydrogenTerms.length, "a term was not linked");
  assert.deepEqual(
    links,
    hydrogenTerms.map((entry) => `/glossary/${entry.slug}/`),
    "a term does not link to its own page",
  );
  assert.match(markup, /<h2 class="el-section__title" id="terms-title">Terms in this entry<\/h2>/);

  // An element whose entry mentions none carries no section at all, rather than a heading over an
  // empty list — seventeen of the 118 are in that position.
  assert.equal(valuesFor(byNumber(4)).glossary, "");
  assert.equal(termsForElement(byNumber(4), context.glossary).length, 0);
});

test("the strip and the pager walk the table, wrapping at both ends", () => {
  const hydrogen = byNumber(1);
  const oganesson = byNumber(118);

  assert.deepEqual(neighbouringElements(elements, 1), { previous: oganesson, next: byNumber(2) });
  assert.deepEqual(neighbouringElements(elements, 118), { previous: byNumber(117), next: hydrogen });
  assert.deepEqual(neighbouringElements(elements, 999), { previous: null, next: null });

  const first = valuesFor(hydrogen);
  const last = valuesFor(oganesson);

  assert.ok(first.strip.includes('href="/elements/oganesson/" rel="prev"'), "hydrogen has no element before it");
  assert.ok(first.pager.includes('href="/elements/oganesson/" rel="prev"'));
  assert.ok(last.strip.includes('href="/elements/hydrogen/" rel="next"'), "oganesson has no element after it");
  assert.ok(last.pager.includes('href="/elements/hydrogen/" rel="next"'));
});

test("no page is a dead end: every element has both neighbours, in the strip and the pager", () => {
  for (const element of elements) {
    const values = valuesFor(element);
    const stripLinks = [...values.strip.matchAll(/class="el-strip__item" href="\/elements\/([^"]+)\/" rel="(prev|next)"/g)];
    const pagerLinks = [...values.pager.matchAll(/href="\/elements\/([^"]+)\/" rel="(prev|next)"/g)];

    assert.equal(stripLinks.length, 2, `${element.symbol}'s strip is not a cycle`);
    assert.equal(pagerLinks.length, 2, `${element.symbol}'s pager does not offer both directions`);
    assert.deepEqual(
      stripLinks.map(([, slug, rel]) => `${rel}:${slug}`),
      pagerLinks.map(([, slug, rel]) => `${rel}:${slug}`),
      `${element.symbol}'s strip and pager disagree about its neighbours`,
    );
  }
});

test("the sibling row is the element's own category, in atomic order, and stops at the limit", () => {
  for (const element of elements) {
    const siblings = similarElements(element, elements);

    assert.ok(siblings.length > 0, `${element.symbol} has no siblings at all`);
    assert.ok(siblings.length <= SIMILAR_LIMIT, `${element.symbol} shows ${siblings.length} siblings`);

    for (const sibling of siblings) {
      assert.equal(sibling.category, element.category);
      assert.notEqual(sibling.atomicNumber, element.atomicNumber);
    }

    const numbers = siblings.map((sibling) => sibling.atomicNumber);
    assert.deepEqual(numbers, [...numbers].sort((one, other) => one - other));
  }

  const iron = byNumber(26);
  const ironSiblings = similarElements(iron, elements);

  assert.equal(ironSiblings.length, SIMILAR_LIMIT, "the transition metals are the case the limit exists for");

  const markup = valuesFor(iron).similar;

  assert.equal([...markup.matchAll(/class="el-similar__tile"/g)].length, SIMILAR_LIMIT);
  assert.match(markup, /Explore other transition metal elements/);
});

test("an element with no siblings renders no row rather than an empty one", () => {
  const lonely = byNumber(1);

  assert.equal(elementSimilar({ element: lonely, siblings: [], category: null }), "");
  assert.equal(elementPager({ previous: null, next: null }).includes("el-pager__link"), false);
  assert.equal(
    [...elementStrip({ element: lonely, previous: null, next: null }).matchAll(/class="el-strip__item/g)].length,
    1,
    "a strip with nowhere to go should still say where the reader is",
  );
});

test("the mini table draws all 118 elements, none tabbable, and marks this one", () => {
  for (const element of [byNumber(1), byNumber(26), byNumber(79)]) {
    const hero = valuesFor(element).hero;

    assert.equal([...hero.matchAll(/class="tile tile--compact/g)].length, 118, `${element.symbol}'s mini table`);
    assert.equal([...hero.matchAll(/tabindex="-1"/g)].length, 118, "a diagram is not a place to tab through the table");
    assert.equal([...hero.matchAll(/aria-current="page"/g)].length, 1, `${element.symbol} is not marked`);
    assert.ok(hero.includes(`href="/elements/${element.slug}/"`), `${element.symbol}'s own cell does not link to it`);
  }
});

test("the shell diagram is right for hydrogen, carbon, iron, gold and uranium", () => {
  for (const atomicNumber of [1, 6, 26, 79, 92]) {
    const element = byNumber(atomicNumber);
    const orbital = valuesFor(element).orbital;
    const dots = [...orbital.matchAll(/class="shells__dot"/g)].length;
    const rings = [...orbital.matchAll(/class="shells__ring"/g)].length;

    assert.equal(dots, atomicNumber, `${element.symbol}'s diagram does not draw every electron`);
    assert.equal(rings, element.shells.length, `${element.symbol}'s diagram does not draw every shell`);
    assert.ok(
      orbital.includes(`Electron configuration — ${element.electronConfiguration}`),
      `${element.symbol}'s diagram is captioned with a configuration it does not draw`,
    );
  }
});

test("the FAQ's answers are the property panel's own values, on every page", () => {
  for (const element of elements) {
    const values = valuesFor(element);
    const answers = answersIn(values.faq);
    const panel = panelValuesIn(values.properties);

    assert.equal(
      answers.length,
      faqEntries(element, { units: context.units }).length,
      `${element.symbol}'s FAQ does not answer every question its record can`,
    );
    assert.ok(answers.length <= 5);

    for (const answer of answers) {
      assert.ok(panel.has(answer), `${element.symbol} answers ${answer} where the panel says otherwise`);
    }

    for (const [, question] of values.faq.matchAll(/<h3 class="faq__q">([^<]*)<\/h3>/g)) {
      assert.ok(question.includes(element.name), `${element.symbol}'s question is about another element`);
    }
  }
});
