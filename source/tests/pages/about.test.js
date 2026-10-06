import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { ABOUT_LEDE, ABOUT_SECTIONS, AUTHORED, DATA_SOURCES, aboutPageValues, sourceTable } from "../../scripts/pages/about.js";
import { allRoutes, routes } from "../../scripts/router/routes.js";
import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";

const context = await buildContext();
const manifest = allRoutes(context.elements, context.categories, context.glossary.all());
const declared = new Set(manifest.map((route) => route.path));
const values = aboutPageValues();
const template = await readFile(new URL("../../pages/about.html", import.meta.url), "utf8");
const route = routes.find((candidate) => candidate.template === "about");

/**
 * The record ADR-005 requires: `docs/DATA_SOURCES.md`, which is the canonical place a dataset is
 * added and the page that names it is derived from. Holding the two against each other is the
 * whole point of the section — a licence that changed in one place and not the other would be a
 * licence claim the site could not support.
 */
const record = await readFile(new URL("../../../workspace/docs/DATA_SOURCES.md", import.meta.url), "utf8");

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** A written date — `1 October 2026` — as the ISO date the record uses. */
function asIso(human) {
  const [day, month, year] = human.split(" ");

  return `${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Every destination in a block of markup, as it was written. */
const hrefsIn = (markup) => [...markup.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);

test("the route is declared, and it is the one the build renders this module for", () => {
  assert.ok(route, "the about route is missing from the manifest");
  assert.equal(route.path, "/about/");
  assert.equal(route.section, "about");
});

test("the page answers the four questions in the order it introduces them", () => {
  assert.deepEqual(
    ABOUT_SECTIONS.map((section) => section.id),
    ["what", "how", "data-sources", "reuse"],
    "a section was renamed, reordered or dropped",
  );

  for (const section of ABOUT_SECTIONS) {
    assert.ok(section.title.length > 0, `${section.id} has no heading`);
    assert.ok(section.paragraphs.length > 0, `${section.id} says nothing`);

    for (const paragraph of section.paragraphs) {
      assert.ok(paragraph.length > 40, `${section.id} carries a paragraph too short to be one`);
    }
  }

  assert.equal(values.lede, ABOUT_LEDE);
});

test("every dataset the page names is in the record, with the same licence and transform", () => {
  assert.ok(DATA_SOURCES.length >= 2, "the page names fewer datasets than the site is built from");

  for (const source of DATA_SOURCES) {
    assert.ok(record.includes(source.name), `${source.name} is not in docs/DATA_SOURCES.md`);
    assert.ok(
      record.includes(source.transform),
      `${source.name}'s transform (${source.transform}) is not in the record`,
    );
    assert.ok(
      record.includes(new URL(source.url).host),
      `${source.name}'s host is not the one the record names`,
    );
    assert.ok(
      record.includes(asIso(source.retrieved)),
      `${source.name} was retrieved on ${source.retrieved}, which the record does not say`,
    );

    // The licence is written in full in both places and drafted differently, so the check is on the
    // phrase that names it rather than on the sentence around it.
    assert.ok(
      record.includes(source.licence.split(" ").slice(0, 2).join(" ")),
      `${source.name}'s licence is not the one the record names`,
    );
    assert.match(source.licence, /public domain|CC0/i, `${source.name} claims no reuse terms`);
  }
});

test("the prose is named as ours rather than left to look like a third dataset", () => {
  assert.ok(AUTHORED.name.length > 0);
  assert.match(AUTHORED.covers, /written|ours|author/i, "the authored block does not say who wrote it");
  assert.ok(
    /glossary|element summar/i.test(AUTHORED.covers),
    "the authored block does not say what it covers",
  );
});

test("the source table is one block per dataset, plus the prose", () => {
  const table = sourceTable();

  assert.match(table, /<div class="abt-sources">/);
  assert.equal(
    [...table.matchAll(/<div class="abt-source">/g)].length,
    DATA_SOURCES.length + 1,
    "a dataset or the authored block is missing from the table",
  );

  for (const source of DATA_SOURCES) {
    assert.ok(table.includes(`href="${source.url}"`), `${source.name} is not linked`);
    assert.ok(table.includes(`>${source.licence}<`), `${source.name}'s licence is not on the page`);
    assert.match(table, new RegExp(`<code class="abt-source__code">${source.transform}</code>`));
    assert.ok(table.includes(`>${source.retrieved}<`), `${source.name}'s retrieval date is not on the page`);
  }

  assert.ok(table.includes(AUTHORED.name), "the authored block is not labelled");
});

test("the provenance table sits inside the section that introduces it", () => {
  const sources = values.sections
    .split("<section")
    .find((part) => part.includes('id="data-sources"'));

  assert.ok(sources, "the data sources section did not reach the page");
  assert.ok(sources.includes('class="abt-sources"'), "the table is outside the section that explains it");
});

test("a heading the page writes is a target another page can link to", () => {
  for (const section of ABOUT_SECTIONS) {
    assert.match(values.sections, new RegExp(`id="${section.id}"`), `#${section.id} is not on the page`);
    assert.ok(values.sections.includes(section.title), `${section.id}'s heading is not written`);
  }
});

test("the template and the module ask for the same blocks, in the same order", () => {
  const filled = fillTemplate(template, values, { name: "pages/about.html" });

  assert.deepEqual(placeholderKeys(template), Object.keys(values));
  assert.deepEqual(placeholderKeys(filled), []);
  assert.ok(filled.trim().length > 0);
  assert.doesNotMatch(filled, /<script/, "the page would boot a script of its own");
  assert.doesNotMatch(filled, /<form/, "an about page has nothing to submit");
});

test("every link the page writes is a page this site publishes", () => {
  assert.ok(hrefsIn(values.sections).length >= DATA_SOURCES.length, "a dataset is linked nowhere");

  for (const href of hrefsIn(values.sections)) {
    if (!href.startsWith("/")) {
      assert.match(href, /^https:\/\//, `${href} is neither a site path nor a secure address`);
      continue;
    }

    assert.ok(declared.has(href.split("#")[0]), `${href} is not a declared route`);
  }
});
