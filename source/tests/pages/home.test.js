import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createElementsRepository } from "../../scripts/data/elements-repository.js";
import { TABLE_HINT, tableDiagram } from "../../scripts/pages/home.js";

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

const template = await readFile(new URL("../../pages/home.html", import.meta.url), "utf8");
const elements = await createElementsRepository({ fetchImpl: fromDisk });
const all = elements.all();

test("the home template's sections are in the order the page is read", () => {
  const order = [...template.matchAll(/<section class="shell section ([a-z-]+)"/g)].map(
    ([, name]) => name,
  );

  assert.deepEqual(order, [
    "home-hero",
    "home-table",
    "home-understand",
    "home-explain",
    "home-explain",
    "home-teasers",
    "home-find",
  ]);
});

test("the page opens with its one heading and closes with its question", () => {
  assert.match(template, /<h1>The periodic table of the elements<\/h1>/);
  assert.match(template, /<h2 class="home-find__title">Looking for an element\?<\/h2>/);
});

test("the template carries the hosts the page module fills", () => {
  assert.match(template, /id="home-table" data-home-table/);
  assert.match(template, /id="home-search" data-home-search/);
  assert.match(template, /id="periods-diagram" data-periods-diagram/);
  assert.match(template, /id="groups-diagram" data-groups-diagram/);
  assert.match(template, /<script type="module" src="\/scripts\/pages\/home\.js"><\/script>/);
});

test("the explainer links each panel to a page this site publishes", () => {
  assert.match(template, /<a href="\/periodic-table\/evolution\/">Read how the periods filled<\/a>/);
  assert.match(template, /<a href="\/element-groups\/">Meet the groups<\/a>/);
});

test("the teasers replace the reference's article list with three in-scope pages", () => {
  const links = [...template.matchAll(/<li class="home-teaser">[\s\S]*?<a href="([^"]+)"/g)].map(
    ([, href]) => href,
  );

  assert.deepEqual(links, [
    "/glossary/",
    "/calculators/temperature/",
    "/periodic-table/properties-and-states/",
  ]);
});

test("the search sits inside the section that asks the question", () => {
  const find = template.slice(template.indexOf("home-find"));

  assert.ok(find.indexOf("Looking for an element?") < find.indexOf("data-home-search"));
});

test("the table hint is a sentence about what the table does", () => {
  assert.ok(TABLE_HINT.length >= 80, "the hint is too short to say anything");
  assert.match(TABLE_HINT, /group/);
});

test("the period diagram labels the seven rows and draws every element one column over", () => {
  const markup = tableDiagram(all, "period");
  const labels = [...markup.matchAll(/<span class="dia__label" style="grid-column:1;grid-row:(\d+)">(\d+)<\/span>/g)];
  const cells = [...markup.matchAll(/<span class="dia__cell" style="grid-column:(\d+);grid-row:(\d+)"><\/span>/g)];

  assert.equal(labels.length, 7, "seven periods are labelled");
  labels.forEach(([, row, value], index) => {
    assert.equal(Number(row), index + 1);
    assert.equal(Number(value), index + 1);
  });
  assert.equal(cells.length, 118);

  const drawn = new Set(cells.map(([, column, row]) => `${column}:${row}`));

  for (const element of all) {
    const cell = `${element.position.column + 1}:${element.position.row}`;

    assert.ok(drawn.has(cell), `${element.symbol} is missing from the period diagram`);
  }
});

test("the group diagram labels the eighteen columns and draws every element one row down", () => {
  const markup = tableDiagram(all, "group");
  const labels = [...markup.matchAll(/<span class="dia__label" style="grid-column:(\d+);grid-row:1">(\d+)<\/span>/g)];
  const cells = [...markup.matchAll(/<span class="dia__cell" style="grid-column:(\d+);grid-row:(\d+)"><\/span>/g)];

  assert.equal(labels.length, 18, "eighteen groups are labelled");
  labels.forEach(([, column, value], index) => {
    assert.equal(Number(column), index + 1);
    assert.equal(Number(value), index + 1);
  });
  assert.equal(cells.length, 118);

  const drawn = new Set(cells.map(([, column, row]) => `${column}:${row}`));

  for (const element of all) {
    const cell = `${element.position.column}:${element.position.row + 1}`;

    assert.ok(drawn.has(cell), `${element.symbol} is missing from the group diagram`);
  }
});

test("a diagram is decoration, and says so", () => {
  assert.match(tableDiagram(all, "period"), /<div class="dia dia--period" aria-hidden="true">/);
  assert.match(tableDiagram(all, "group"), /<div class="dia dia--group" aria-hidden="true">/);
});

test("an axis that is neither a period nor a group is refused", () => {
  assert.throws(() => tableDiagram(all, "diagonal"), TypeError);
});
