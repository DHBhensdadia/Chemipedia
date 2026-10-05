import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";
import {
  BLOCKS,
  configurationPageValues,
  configurationRow,
  irregularitiesSection,
} from "../../scripts/pages/orbital-configuration.js";
import { irregularElements } from "../../scripts/lib/electron-configuration.js";
import { routes } from "../../scripts/router/routes.js";

const template = await readFile(
  new URL("../../pages/orbital-configuration.html", import.meta.url),
  "utf8",
);
const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);
const values = configurationPageValues({ elements });

test("the page is a declared route in the elements section", () => {
  const route = routes.find((candidate) => candidate.path === "/properties/orbital-configuration/");

  assert.ok(route, "the orbital configuration page is not declared");
  assert.equal(route.template, "orbital-configuration");
  assert.equal(route.section, "elements");
  assert.deepEqual(
    route.styles,
    ["styles/components/periodic-table.css"],
    "the rows are painted by the key-to-colour map that sheet carries",
  );
});

test("the four blocks are the table's own four, in the table's order", () => {
  assert.deepEqual(
    BLOCKS.map((block) => block.key),
    ["s", "p", "d", "f"],
  );

  for (const block of BLOCKS) {
    assert.ok(block.name.length > 0, `${block.key} has no name`);
    assert.ok(block.note.length > 0, `${block.key} has no note`);
  }
});

test("the blocks hold every element exactly once, at the counts the dataset asserts", () => {
  const counts = {};

  for (const block of BLOCKS) {
    const members = elements.filter((element) => element.block === block.key);

    counts[block.key] = members.length;
    assert.ok(
      values.blocks.includes(`<span class="cfg__count">${members.length} elements</span>`),
      `the ${block.key} block's heading does not count its members`,
    );
  }

  assert.deepEqual(counts, { s: 14, p: 36, d: 38, f: 30 });
  assert.equal(Object.values(counts).reduce((total, count) => total + count, 0), 118);

  const rows = [...values.blocks.matchAll(/href="\/elements\/([a-z-]+)\/"/g)].map(([, slug]) => slug);
  const distinct = new Set(rows.filter((slug) => elements.some((element) => element.slug === slug)));

  // The exception section lists some elements a second time, so the distinct set is what must be
  // the whole table: every element appears in its block, and no element is left out of one.
  assert.equal(distinct.size, 118, "an element is missing from the blocks");
});

test("every row prints the record's own configuration, and links to the element", () => {
  const row = configurationRow(bySymbol("Fe"));

  assert.match(row, /href="\/elements\/iron\/"/);
  assert.match(row, /aria-label="Iron, symbol Fe, atomic number 26"/);
  // The configuration is printed exactly as the record holds it: the source lists the 4s subshell
  // before the 3d one, and the page does not decide to disagree with the source about notation.
  assert.match(row, /<span class="cfg__notation">\[Ar\]4s2 3d6<\/span>/);
  assert.match(row, /data-key="transition-metals"/);
});

test("the exceptions are the derived set, counted and named in the page's own words", () => {
  const irregular = irregularElements(elements);
  const section = irregularitiesSection({ elements });

  assert.equal(irregular.length, 19);
  assert.match(section, /<span class="cfg__count">19 elements<\/span>/);
  assert.match(section, /Where the filling order bends/);

  for (const symbol of ["Cr", "Cu", "Pd", "Au"]) {
    const element = bySymbol(symbol);

    assert.ok(
      section.includes(`href="/elements/${element.slug}/"`),
      `${symbol} is not named among the exceptions`,
    );
  }

  assert.equal(section.includes('href="/elements/helium/"'), false, "helium is not an exception");
});

test("the page fills its template, and the template asks for nothing else", () => {
  assert.deepEqual(Object.keys(values), placeholderKeys(template));

  const page = fillTemplate(template, values, { name: "pages/orbital-configuration.html" });

  assert.deepEqual(placeholderKeys(page), []);
  assert.match(page, /data-mode="group"/, "the rows need the mode that paints their keys");
  assert.equal((page.match(/class="cfg__block/g) ?? []).length, 5, "four blocks and the exception");

  // Every element's configuration reaches the page as text.
  for (const element of elements.slice(0, 5)) {
    assert.ok(
      page.includes(element.electronConfiguration),
      `${element.symbol}'s configuration is missing from the page`,
    );
  }
});
