import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createCategoriesRepository } from "../../scripts/data/categories-repository.js";
import { createElementsRepository } from "../../scripts/data/elements-repository.js";
import { MODES, createPeriodicTable, renderPeriodicTable } from "../../scripts/components/periodic-table.js";
import { eraCounts } from "../../scripts/lib/discovery.js";
import { contrastRatio, meetsAA, readableForeground } from "../../scripts/lib/contrast.js";

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
const categories = await createCategoriesRepository({ fetchImpl: fromDisk });
const all = elements.all();
const tokens = await readFile(new URL("../../styles/tokens.css", import.meta.url), "utf8");
const tableStyles = await readFile(
  new URL("../../styles/components/periodic-table.css", import.meta.url),
  "utf8",
);

const labelOf = (element) =>
  `${element.name}, symbol ${element.symbol}, atomic number ${element.atomicNumber}`;

/** Every tile in a rendered table, with its attributes parsed out. */
function tiles(markup) {
  return [...markup.matchAll(/<a class="tile[^>]*>/g)].map(([tag]) => ({
    tag,
    attributes: Object.fromEntries(
      [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
    ),
  }));
}

/** The legend's chips, as key to count. */
function chipCounts(markup) {
  const found = {};

  for (const [, key, count] of markup.matchAll(
    /data-pt-highlight="([^"]+)"[\s\S]*?<span class="chip__n">(\d+)<\/span>/g,
  )) {
    found[key] = Number(count);
  }

  return found;
}

/** Every custom property tokens.css declares, as written. */
function tokenMap() {
  const found = new Map();

  for (const [, property, value] of tokens.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    found.set(property, value.trim());
  }

  return found;
}

/** A custom property's value with any var() chain followed to its end. */
function resolveColour(value, map) {
  let current = value.trim();

  for (let hop = 0; current.startsWith("var(") && hop < 8; hop += 1) {
    current = (map.get(current.slice(4, -1).trim().replace(/^--/, "")) ?? "").trim();
  }

  return current;
}

test("the table holds all 118 tiles, one per cell", () => {
  const rendered = tiles(renderPeriodicTable({ elements: all, categories: categories.all() }));
  const cells = new Set(rendered.map(({ attributes }) => `${attributes["data-row"]}:${attributes["data-column"]}`));

  assert.equal(rendered.length, 118);
  assert.equal(cells.size, 118, "two tiles share a cell");
});

test("the table is a named list, and every tile is one of its items", () => {
  const markup = renderPeriodicTable({ elements: all, categories: categories.all() });
  const rendered = tiles(markup);

  assert.match(markup, /class="pt" data-mode="group"/);
  assert.match(markup, /role="list" aria-label="Periodic table of the elements" data-pt-grid/);
  assert.ok(rendered.every(({ attributes }) => attributes.role === "listitem"));

  assert.equal(rendered.at(0).attributes["aria-label"], labelOf(elements.bySymbol("H")));
  assert.equal(rendered.at(-1).attributes["aria-label"], labelOf(elements.bySymbol("Og")));
});

test("every element sits in its own cell, with its own link", () => {
  const byLabel = new Map(
    tiles(renderPeriodicTable({ elements: all, categories: categories.all() })).map(({ attributes }) => [
      attributes["aria-label"],
      attributes,
    ]),
  );

  for (const element of all) {
    const attributes = byLabel.get(labelOf(element));

    assert.ok(attributes, `${element.symbol} has no tile`);
    assert.equal(attributes["data-row"], String(element.position.row), `${element.symbol} row`);
    assert.equal(attributes["data-column"], String(element.position.column), `${element.symbol} column`);
    assert.equal(attributes.href, `/elements/${element.slug}/`, `${element.symbol} link`);
  }
});

test("every f-block element is drawn in its detached row", () => {
  const byLabel = new Map(
    tiles(renderPeriodicTable({ elements: all, categories: categories.all() })).map(({ attributes }) => [
      attributes["aria-label"],
      attributes,
    ]),
  );
  const detached = all.filter((element) => element.block === "f");

  assert.equal(detached.length, 30, "fifteen lanthanides and fifteen actinides");

  for (const element of detached) {
    const attributes = byLabel.get(labelOf(element));
    const { row, column } = element.position;

    assert.ok(row === 9 || row === 10, `${element.symbol} is in row ${row}`);
    assert.ok(column >= 3 && column <= 17, `${element.symbol} is in column ${column}`);
    assert.equal(attributes.style, `grid-column:${column};grid-row:${row}`, `${element.symbol} placement`);
  }
});

test("the detached rows hold the lanthanides and actinides and nothing else", () => {
  const rendered = tiles(renderPeriodicTable({ elements: all, categories: categories.all() }));
  const detached = rendered.filter(({ attributes }) => ["9", "10"].includes(attributes["data-row"]));

  assert.equal(detached.length, 30);
  assert.ok(detached.every(({ attributes }) => Number(attributes["data-column"]) >= 3));
});

test("one tile is in the tab order, and it is the first", () => {
  const rendered = tiles(renderPeriodicTable({ elements: all, categories: categories.all() }));
  const tabbable = rendered.filter(({ attributes }) => attributes.tabindex === "0");

  assert.equal(tabbable.length, 1);
  assert.equal(tabbable[0].attributes["aria-label"], labelOf(elements.bySymbol("H")));
});

test("the page's own element is marked, and only it", () => {
  const rendered = tiles(renderPeriodicTable({ elements: all, categories: categories.all(), current: 6 }));
  const current = rendered.filter(({ attributes }) => attributes["aria-current"] === "page");

  assert.equal(current.length, 1);
  assert.equal(current[0].attributes["aria-label"], labelOf(elements.bySymbol("C")));
});

test("each keyed mode paints every tile with the key of its own data", () => {
  // The discovery key is re-derived here from the year rather than asked of the module that
  // assigns it, so the test would notice the two disagreeing about which century a year is in.
  const centuries = [
    [2000, "21st-century"],
    [1900, "20th-century"],
    [1800, "19th-century"],
    [1700, "18th-century"],
  ];
  const keys = {
    group: (element) => element.category,
    block: (element) => element.block,
    state: (element) => element.state ?? "unknown",
    discovery: (element) => {
      const year = element.discovery?.year;

      if (typeof year !== "number") {
        return "undated";
      }

      return centuries.find(([from]) => year >= from)?.[1] ?? "before-1700";
    },
  };

  for (const [mode, keyOf] of Object.entries(keys)) {
    const byLabel = new Map(
      tiles(renderPeriodicTable({ elements: all, categories: categories.all(), mode })).map(({ attributes }) => [
        attributes["aria-label"],
        attributes,
      ]),
    );

    for (const element of all) {
      assert.equal(byLabel.get(labelOf(element))["data-key"], keyOf(element), `${element.symbol} in ${mode}`);
    }
  }
});

test("the group legend counts the data and agrees with the declared taxonomy", () => {
  const counts = chipCounts(renderPeriodicTable({ elements: all, categories: categories.all() }));
  const declared = categories.counts();

  assert.deepEqual(
    Object.keys(counts),
    categories.all().map((category) => category.slug),
    "the legend prints the taxonomy in its declared order",
  );

  for (const [slug, count] of Object.entries(counts)) {
    assert.equal(count, declared[slug], `${slug} disagrees with categories.json`);
    assert.equal(
      count,
      all.filter((element) => element.category === slug).length,
      `${slug} disagrees with the tiles`,
    );
  }
});

test("the block legend counts the four blocks", () => {
  const counts = chipCounts(
    renderPeriodicTable({ elements: all, categories: categories.all(), mode: "block" }),
  );

  assert.deepEqual(counts, { s: 14, p: 36, d: 38, f: 30 });
  assert.equal(
    Object.values(counts).reduce((sum, count) => sum + count, 0),
    all.length,
  );
});

test("the state legend counts the states, and leaves out one no element is in", () => {
  const counts = chipCounts(
    renderPeriodicTable({ elements: all, categories: categories.all(), mode: "state" }),
  );

  assert.deepEqual(counts, { solid: 104, liquid: 2, gas: 12 });
  assert.ok(!("unknown" in counts), "a chip with nothing behind it is noise");
});

test("the discovery legend counts the eras, and they add up to the table", () => {
  const counts = chipCounts(
    renderPeriodicTable({ elements: all, categories: categories.all(), mode: "discovery" }),
  );
  const declared = Object.fromEntries(eraCounts(all).map((era) => [era.key, era.count]));

  assert.deepEqual(counts, declared, "the legend and the era model disagree");
  assert.equal(
    Object.values(counts).reduce((sum, count) => sum + count, 0),
    all.length,
    "an element belongs to no era",
  );
  assert.deepEqual(
    Object.keys(counts),
    eraCounts(all)
      .filter((era) => era.count > 0)
      .map((era) => era.key),
    "the legend prints the eras in the order they are read",
  );
});

test("every legend chip's key is a key some tile carries", () => {
  for (const mode of ["group", "block", "state", "discovery"]) {
    const markup = renderPeriodicTable({ elements: all, categories: categories.all(), mode });
    const keysOnTiles = new Set(tiles(markup).map(({ attributes }) => attributes["data-key"]));

    for (const key of Object.keys(chipCounts(markup))) {
      assert.ok(keysOnTiles.has(key), `${mode}: ${key} has a chip but no tile`);
    }
  }
});

test("the numeric view bands every measurement and marks the missing ones", () => {
  const markup = renderPeriodicTable({
    elements: all,
    categories: categories.all(),
    mode: "electronegativity",
  });
  const byLabel = new Map(tiles(markup).map(({ attributes }) => [attributes["aria-label"], attributes]));
  const known = all.filter((element) => element.electronegativity !== null);
  const values = known.map((element) => element.electronegativity);
  const low = Math.min(...values);
  const high = Math.max(...values);

  for (const element of all) {
    const band = byLabel.get(labelOf(element))["data-band"];

    if (element.electronegativity === null) {
      assert.equal(band, "none", `${element.symbol} has no measurement but a band`);
      continue;
    }

    const expected = Math.min(5, Math.floor(((element.electronegativity - low) / (high - low)) * 6));

    assert.equal(band, String(expected), `${element.symbol}`);
  }
});

test("the numeric legend prints the domain's ends, the six bands and the unknown colour", () => {
  const markup = renderPeriodicTable({
    elements: all,
    categories: categories.all(),
    mode: "electronegativity",
  });
  const bands = new Set(
    tiles(markup).map(({ attributes }) => attributes["data-band"]),
  );

  assert.match(markup, /class="scale" role="group" aria-label="Electronegativity from 0\.7 to 3\.98/);
  assert.match(markup, /<span class="scale__k">0\.7<\/span>/);
  assert.match(markup, /<span class="scale__k">3\.98<\/span>/);
  assert.match(markup, /<span class="scale__k">Unknown<\/span>/);
  assert.match(markup, /class="scale__nd" style="background: var\(--scale-none\)"/);
  assert.equal((markup.match(/background: var\(--scale-[1-6]\)/g) ?? []).length, 6);
  assert.deepEqual([...bands].sort(), ["0", "1", "2", "3", "4", "5", "none"]);
});

test("a hint is printed between the legend and the table, and only when one is asked for", () => {
  const withHint = renderPeriodicTable({
    elements: all,
    categories: categories.all(),
    hint: "Point at a group to pick it out of the table.",
  });

  assert.match(
    withHint,
    /<\/ul>\n<p class="pt__hint">Point at a group to pick it out of the table\.<\/p>\n<div class="pt__scroller">/,
  );
  assert.doesNotMatch(renderPeriodicTable({ elements: all, categories: categories.all() }), /pt__hint/);
});

test("the hint is escaped like every other string", () => {
  const markup = renderPeriodicTable({
    elements: all,
    categories: categories.all(),
    hint: 'Pick a group & <scroll> "sideways"',
  });

  assert.match(markup, /Pick a group &amp; &lt;scroll&gt; &quot;sideways&quot;/);
});

test("a mode that is not one of the declared five is refused", () => {
  assert.deepEqual(MODES, ["group", "block", "state", "electronegativity", "discovery"]);
  assert.throws(
    () => renderPeriodicTable({ elements: all, categories: categories.all(), mode: "colour" }),
    TypeError,
  );
});

test("the created table and its rendered markup are the same table", () => {
  const table = createPeriodicTable({ elements: all, categories: categories.all() });

  assert.equal(table.html, renderPeriodicTable({ elements: all, categories: categories.all() }));
  assert.equal(table.model.cells.length, 118);
  assert.equal(typeof table.attach, "function");
});

test("no mode writes a colour into the markup", () => {
  for (const mode of MODES) {
    const markup = renderPeriodicTable({ elements: all, categories: categories.all(), mode });

    assert.doesNotMatch(markup, /#[0-9a-f]{6}/i, `${mode} painted a literal colour`);
  }
});

test("every fill in every mode takes the foreground the contrast rule chooses", () => {
  const map = tokenMap();
  const rules = [
    ...tableStyles.matchAll(
      /\[data-mode="([\w-]+)"\] \[data-(key|band)="([\w-]+)"\]\s*\{([^}]*)\}/g,
    ),
  ];

  assert.equal(rules.length, 11 + 4 + 4 + 7 + 6, "a mode is missing a colour pairing");

  for (const [, mode, kind, key, body] of rules) {
    const fill = resolveColour(body.match(/--fill:\s*([^;]+);/)[1], map);
    const onFill = resolveColour(body.match(/--on-fill:\s*([^;]+);/)[1], map);

    assert.match(fill, /^#[0-9a-f]{6}$/i, `${mode}/${kind}=${key} does not resolve to a colour`);
    assert.equal(
      onFill.toLowerCase(),
      readableForeground(fill).toLowerCase(),
      `${mode}/${kind}=${key}: ${fill} should take ${readableForeground(fill)}, not ${onFill}`,
    );
  }
});

test("every group's deeper colour is a pairing too, and legible as text on paper", () => {
  const map = tokenMap();
  const rules = [
    ...tableStyles.matchAll(
      /\[data-mode="group"\] \[data-key="([\w-]+)"\]\s*\{([^}]*)\}/g,
    ),
  ];
  const paper = resolveColour("var(--bg)", map);

  assert.equal(rules.length, 11, "a group has no deeper colour");

  for (const [, key, body] of rules) {
    const deep = resolveColour(body.match(/--fill-deep:\s*([^;]+);/)[1], map);
    const onDeep = resolveColour(body.match(/--on-fill-deep:\s*([^;]+);/)[1], map);
    const ratio = contrastRatio(deep, paper);

    assert.match(deep, /^#[0-9a-f]{6}$/i, `group/${key} has no deeper colour`);
    assert.equal(
      onDeep.toLowerCase(),
      readableForeground(deep).toLowerCase(),
      `group/${key}: ${deep} should take ${readableForeground(deep)}, not ${onDeep}`,
    );
    assert.ok(
      meetsAA(ratio),
      `group/${key}: ${deep} is used as text on ${paper} at ${ratio.toFixed(2)}:1, below AA`,
    );
  }
});

test("the stylesheet covers every key the renderer can emit, and no others", () => {
  const keysByMode = new Map();

  for (const [, mode, kind, key] of tableStyles.matchAll(
    /\[data-mode="([\w-]+)"\] \[data-(key|band)="([\w-]+)"\]/g,
  )) {
    if (!keysByMode.has(mode)) {
      keysByMode.set(mode, new Set());
    }

    keysByMode.get(mode).add(key);
  }

  assert.deepEqual(
    [...keysByMode.get("group")].sort(),
    categories.all().map((category) => category.slug).sort(),
  );
  assert.deepEqual([...keysByMode.get("block")].sort(), ["d", "f", "p", "s"]);
  assert.deepEqual([...keysByMode.get("state")].sort(), ["gas", "liquid", "solid", "unknown"]);
  assert.deepEqual([...keysByMode.get("electronegativity")].sort(), ["0", "1", "2", "3", "4", "5", "none"]);
  assert.deepEqual(
    [...keysByMode.get("discovery")].sort(),
    eraCounts(all).map((era) => era.key).sort(),
  );
});
