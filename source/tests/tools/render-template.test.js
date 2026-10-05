import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";
import { elementPageValues } from "../../scripts/pages/element-detail.js";
import { elementsIndexPageValues } from "../../scripts/pages/elements-index.js";
import { configurationPageValues } from "../../scripts/pages/orbital-configuration.js";
import { rankingPageValues } from "../../scripts/pages/ranking.js";
import { buildContext } from "../../tools/build-context.js";
import { routes } from "../../scripts/router/routes.js";

const template = await readFile(new URL("../../pages/element-detail.html", import.meta.url), "utf8");
const notFound = await readFile(new URL("../../pages/404.html", import.meta.url), "utf8");
const context = await buildContext();
const hydrogen = context.elements[0];
const elementValues = elementPageValues({
  element: hydrogen,
  elements: context.elements,
  categories: context.categories,
  units: context.units,
});

test("the placeholders a template asks for are read in order, once each", () => {
  assert.deepEqual(placeholderKeys("<p>{{one}}</p><p>{{two}} and {{ one }}</p>"), ["one", "two"]);
  assert.deepEqual(placeholderKeys("<p>no placeholders here</p>"), []);
});

test("filling replaces every placeholder with its block", () => {
  const filled = fillTemplate("<h1>{{title}}</h1>\n{{body}}", {
    title: "Hydrogen",
    body: "<p>One proton.</p>",
  });

  assert.equal(filled, "<h1>Hydrogen</h1>\n<p>One proton.</p>");
});

test("a placeholder the page module does not provide is refused, not rendered blank", () => {
  assert.throws(
    () => fillTemplate("<p>{{missing}}</p>", {}, { name: "pages/example.html" }),
    /pages\/example\.html asks for \{\{missing\}\}/,
  );
});

test("a placeholder that survives inside a value is refused too", () => {
  assert.throws(
    () => fillTemplate("<p>{{outer}}</p>", { outer: "a {{nested}} block" }),
    /still holds nested after filling/,
  );
});

test("the element template and the element module ask for the same blocks, in the same order", () => {
  assert.deepEqual(placeholderKeys(template), Object.keys(elementValues));
});

test("a record with something to say in every section fills every block", () => {
  // Hydrogen is the case with data for all five questions, every property and both neighbours;
  // the blocks a sparser record leaves empty are the page test's contract, not this one's.
  for (const [name, block] of Object.entries(elementValues)) {
    assert.equal(typeof block, "string", `${name} is not a string`);
    assert.ok(block.length > 0, `${name} is empty`);
  }
});

test("a filled element page holds no placeholder and carries its blocks", () => {
  const page = fillTemplate(template, elementValues, { name: "pages/element-detail.html" });

  assert.equal(placeholderKeys(page).length, 0, "a placeholder survived the fill");
  assert.match(page, /<section class="el-hero" data-key="non-metals">/);
  assert.match(page, /<h1 class="el-name" id="element-name">Hydrogen<\/h1>/);
  assert.match(page, /<nav class="shell el-pager"/);
});

test("every page family fills its template, block for block", async () => {
  const families = [
    ["elements-index", elementsIndexPageValues, () => ({ elements: context.elements, categories: context.categories, units: context.units })],
    ["melting-point", rankingPageValues, () => ({ route: routes.find((r) => r.template === "melting-point"), elements: context.elements, units: context.units })],
    ["boiling-point", rankingPageValues, () => ({ route: routes.find((r) => r.template === "boiling-point"), elements: context.elements, units: context.units })],
    ["orbital-configuration", configurationPageValues, () => ({ elements: context.elements })],
  ];

  for (const [name, renderer, options] of families) {
    const source = await readFile(new URL(`../../pages/${name}.html`, import.meta.url), "utf8");
    const filled = fillTemplate(source, renderer(options()), { name: `pages/${name}.html` });

    assert.deepEqual(placeholderKeys(filled), [], `${name} kept a placeholder`);
    assert.ok(filled.trim().length > 0, `${name} filled to nothing`);
  }
});

test("the not-found page is a document rather than a template, and fills to itself", () => {
  assert.deepEqual(placeholderKeys(notFound), [], "the 404 document asks for blocks no module provides");
  assert.equal(fillTemplate(notFound, {}), notFound);
});
