import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { bandFor } from "../../scripts/lib/colour-scale.js";
import { eraCounts, yearOf } from "../../scripts/lib/discovery.js";
import { electronegativitySummary } from "../../scripts/lib/electronegativity.js";
import { MODES } from "../../scripts/components/periodic-table.js";
import {
  MELT_BAND,
  VIEWS,
  blockNote,
  drawnBlock,
  evolutionNote,
  meltingNear,
  missingNote,
  outsideTheirBlock,
  startTableViews,
  stateNote,
  tableViewPageValues,
  trendSection,
  viewNote,
} from "../../scripts/pages/table-views.js";
import { routes } from "../../scripts/router/routes.js";
import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";

const TEMPLATES = ["properties-and-states", "orbitals", "electronegativity", "evolution"];
const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);
const routeFor = (template) => routes.find((route) => route.template === template);
const valuesFor = (template) =>
  tableViewPageValues({
    route: routeFor(template),
    elements,
    categories: context.categories,
    units: context.units,
  });

const markup = Object.fromEntries(
  TEMPLATES.map((template) => [template, valuesFor(template).table]),
);

/** Every tile in a rendered table, with its attributes parsed out. */
function tiles(html) {
  return [...html.matchAll(/<a class="tile[^>]*>/g)].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value])),
  );
}

/** The legend's chips, as key to count. */
function chipCounts(html) {
  const found = {};

  for (const [, key, count] of html.matchAll(
    /data-pt-highlight="([^"]+)"[\s\S]*?<span class="chip__n">(\d+)<\/span>/g,
  )) {
    found[key] = Number(count);
  }

  return found;
}

test("the four views are declared routes in the table-views section", () => {
  for (const template of TEMPLATES) {
    const route = routeFor(template);

    assert.ok(route, `${template} is not declared`);
    assert.equal(route.section, "table-views");
    assert.match(route.path, /^\/periodic-table\/[a-z-]+\/$/);
    assert.ok(route.title.length > 0 && route.description.length > 0);
  }
});

test("every view declares the sheet that turns a key into a colour", () => {
  for (const template of TEMPLATES) {
    const styles = routeFor(template).styles ?? [];

    for (const sheet of [
      "styles/components/element-tile.css",
      "styles/components/legend-chips.css",
      "styles/components/periodic-table.css",
      "styles/pages/table-views.css",
    ]) {
      assert.ok(styles.includes(sheet), `${template} does not declare ${sheet}`);
    }
  }

  assert.ok(
    (routeFor("evolution").styles ?? []).includes("styles/components/era-timeline.css"),
    "the evolution view's timeline has no sheet",
  );
  assert.equal(
    (routeFor("orbitals").styles ?? []).includes("styles/components/era-timeline.css"),
    false,
    "a view links a sheet it does not use",
  );
});

test("each view names one of the engine's modes, and no two views share one", () => {
  const modes = TEMPLATES.map((template) => VIEWS[template].mode);

  for (const mode of modes) {
    assert.ok(MODES.includes(mode), `${mode} is not a mode the table can draw`);
  }

  assert.deepEqual(modes, ["state", "block", "electronegativity", "discovery"]);
  assert.equal(new Set(modes).size, modes.length, "two views share a mode");
});

test("each view renders the table in its own mode, with all 118 tiles", () => {
  for (const template of TEMPLATES) {
    const mode = VIEWS[template].mode;

    assert.match(markup[template], new RegExp(`class="pt" data-mode="${mode}"`), template);
    assert.equal(tiles(markup[template]).length, 118, template);
    assert.doesNotMatch(
      markup[template],
      /pt__hint/,
      `${template} puts its note between the legend and the tiles`,
    );
    assert.match(valuesFor(template).note, /^<p class="tv-note">/, `${template} has no note`);
  }
});

test("a view's note is escaped and follows the table in the template", async () => {
  for (const template of TEMPLATES) {
    const source = await readFile(new URL(`../../pages/${template}.html`, import.meta.url), "utf8");

    assert.ok(
      source.indexOf("{{note}}") > source.indexOf("{{table}}"),
      `${template} puts its note above its table`,
    );
  }

  const escaped = viewNote(
    [{ name: "Rock & Roll", symbol: "Rr", atomicNumber: 1, state: "solid", meltingPoint: 10 }],
    "state",
    context.units,
  );

  assert.match(escaped, /rock &amp; roll at 10\u00a0°C/);
  assert.doesNotMatch(escaped, /&(?!amp;)/, "an ampersand reached the markup unescaped");
});

test("the state legend counts the states the records hold", () => {
  const counts = chipCounts(markup["properties-and-states"]);

  assert.deepEqual(counts, { solid: 104, liquid: 2, gas: 12 });
  assert.equal(
    Object.values(counts).reduce((sum, count) => sum + count, 0),
    elements.length,
  );
});

test("the block legend counts the blocks the records hold", () => {
  const counts = chipCounts(markup.orbitals);

  assert.deepEqual(counts, { s: 14, p: 36, d: 38, f: 30 });
  assert.equal(
    Object.values(counts).reduce((sum, count) => sum + count, 0),
    elements.length,
  );
});

test("the discovery legend counts the eras the records hold", () => {
  const counts = chipCounts(markup.evolution);
  const declared = Object.fromEntries(eraCounts(elements).map((era) => [era.key, era.count]));

  assert.deepEqual(counts, declared);
  assert.equal(
    Object.values(counts).reduce((sum, count) => sum + count, 0),
    elements.length,
  );
});

test("the electronegativity view prints the scale instead of chips", () => {
  const html = markup.electronegativity;

  assert.equal(Object.keys(chipCounts(html)).length, 0, "a numeric view has no keyed chips");
  assert.match(html, /class="scale" role="group"/);
  assert.match(html, /<span class="scale__k">0\.7<\/span>/);
  assert.match(html, /<span class="scale__k">3\.98<\/span>/);
  assert.match(html, /<span class="scale__k">Unknown<\/span>/);
  assert.equal((html.match(/background: var\(--scale-[1-6]\)/g) ?? []).length, 6);
});

test("the continuous scale is right at both ends, past them, and for no value at all", () => {
  const { low, high } = electronegativitySummary(elements);
  const domain = [low.electronegativity, high.electronegativity];

  assert.deepEqual(domain, [0.7, 3.98]);
  assert.equal(bandFor(domain[0], { domain, bands: 6 }), 0, "the weakest pull is the first band");
  assert.equal(bandFor(domain[1], { domain, bands: 6 }), 5, "the strongest is the last band");
  assert.equal(bandFor(domain[1] + 5, { domain, bands: 6 }), 5, "past the top clamps to the top");
  assert.equal(bandFor(domain[0] - 5, { domain, bands: 6 }), 0, "below the bottom clamps down");
  assert.equal(bandFor(null, { domain, bands: 6 }), null, "no value is not a band");

  const byLabel = new Map(tiles(markup.electronegativity).map((tile) => [tile["aria-label"], tile]));

  assert.equal(byLabel.get("Francium, symbol Fr, atomic number 87")["data-band"], "0");
  assert.equal(byLabel.get("Fluorine, symbol F, atomic number 9")["data-band"], "5");
  assert.equal(byLabel.get("Helium, symbol He, atomic number 2")["data-band"], "none");
});

test("an element past the top of a scale keeps the last band rather than inventing a colour", () => {
  const fixture = [
    { ...bySymbol("H") },
    {
      ...bySymbol("F"),
      slug: "fixture-high",
      symbol: "Xx",
      name: "Fixture",
      atomicNumber: 199,
      electronegativity: 9.9,
      position: { row: 1, column: 2 },
    },
  ];
  const html = tableViewPageValues({
    route: routeFor("electronegativity"),
    elements: fixture,
    units: context.units,
  }).table;
  const bands = tiles(html).map((tile) => tile["data-band"]);

  assert.deepEqual(bands.sort(), ["0", "5"], "an outlier must clamp to an end of the ramp");
});

test("the states note counts the liquids and the solids a warm room would melt", () => {
  const note = stateNote(elements, context.units);
  const near = meltingNear(elements);

  assert.deepEqual(
    near.map((element) => element.symbol),
    ["Fr", "Cs", "Ga", "Rb"],
  );
  assert.equal(MELT_BAND.from, 0);
  assert.equal(MELT_BAND.to, 40);
  assert.match(note, /Only 2 elements are liquid at 20 °C \(bromine and mercury\)/);
  assert.match(note, /4 more are solid only in a cold room: francium at 26\.85\u00a0°C/);
  assert.match(note, /and rubidium at 39\.31\u00a0°C\./);
  assert.match(note, /Point at a state to pick its elements out of the table\./);
});

test("no element filed as a solid melts below 0 °C, so the two readings agree", () => {
  for (const element of elements.filter((candidate) => candidate.state === "solid")) {
    if (typeof element.meltingPoint !== "number") {
      continue;
    }

    assert.ok(
      element.meltingPoint >= 0,
      `${element.symbol} is filed as a solid and melts at ${element.meltingPoint} °C`,
    );
  }
});

test("the orbitals note names the one element drawn outside its own block", () => {
  const outside = outsideTheirBlock(elements);
  const note = blockNote(elements);

  assert.deepEqual(outside.map((element) => element.symbol), ["He"]);
  assert.equal(drawnBlock(bySymbol("He")), "p");
  assert.equal(drawnBlock(bySymbol("La")), "f");
  assert.equal(drawnBlock(bySymbol("Fe")), "d");
  assert.equal(drawnBlock(bySymbol("Cs")), "s");
  assert.match(note, /Every one of the 118 configurations ends in a subshell of the block it is filed under/);
  assert.match(note, /Helium is the one exception: it is drawn in the p-block's column, and its own configuration files it under s\./);
});

test("the electronegativity note counts the values the records do not have", () => {
  const note = missingNote(elements);

  assert.match(note, /23 of the 118 elements carry no Pauling value/);
  assert.match(note, /8 below rutherfordium — helium, neon, argon, promethium, europium, terbium, ytterbium and radon —/);
  assert.match(note, /every element from rutherfordium to oganesson\./);
  assert.equal(note.includes("Rutherfordium"), false, "a name mid-sentence is not capitalised");
});

test("the trend names the ends, the rising periods and the groups that never rise", () => {
  const trend = trendSection({ elements, units: context.units });

  assert.match(trend, /The scale runs from 0\.7 at francium to 3\.98 at fluorine/);
  assert.match(trend, /95 of the 118 elements carry a value\./);
  assert.match(trend, /period 2 from 0\.98 at lithium to 3\.98 at fluorine and period 3 from 0\.93 at sodium to 3\.16 at chlorine/);
  assert.match(trend, /6 of the 16 groups with three or more measured values never rise/);
  assert.match(trend, /The 23 elements with no value are 8 below rutherfordium/);

  const ends = [...trend.matchAll(/<span class="end__rank">([^<]+)<\/span>[\s\S]*?href="\/elements\/([a-z-]+)\/"[\s\S]*?<span class="end__value">([\d.]+)<\/span>/g)];

  assert.deepEqual(
    ends.map(([, rank, slug, value]) => [rank, slug, value]),
    [
      ["Highest", "fluorine", "3.98"],
      ["Next highest", "oxygen", "3.44"],
      ["Next lowest", "caesium", "0.79"],
      ["Lowest", "francium", "0.7"],
    ],
  );
});

test("the trend is empty rather than wrong when nothing is measured", () => {
  assert.equal(trendSection({ elements: [{ electronegativity: null }] }), "");
});

test("the evolution note counts the undated records and those without a discoverer", () => {
  const note = evolutionNote(elements);
  const undated = elements.filter((element) => yearOf(element) === null);

  assert.equal(undated.length, 13);
  assert.match(note, /13 elements carry no recorded year and keep the legend's grey; 8 of them have no discoverer in the record either\./);
});

test("the evolution view's timeline holds every element once", () => {
  const timeline = valuesFor("evolution").eras;
  const slugs = [...timeline.matchAll(/href="\/elements\/([a-z-]+)\/"/g)].map(([, slug]) => slug);

  assert.equal((timeline.match(/class="era"/g) ?? []).length, 6);
  assert.equal(slugs.length, elements.length);
  assert.deepEqual([...new Set(slugs)].sort(), elements.map((element) => element.slug).sort());
  assert.match(timeline, /<p class="era__range">1801\u20131899 · 47 elements<\/p>/);
});

test("each template asks for exactly the blocks its view computes", async () => {
  for (const template of TEMPLATES) {
    const source = await readFile(new URL(`../../pages/${template}.html`, import.meta.url), "utf8");
    const values = valuesFor(template);

    assert.deepEqual(placeholderKeys(source), Object.keys(values), template);

    const filled = fillTemplate(source, values, { name: `pages/${template}.html` });

    assert.deepEqual(placeholderKeys(filled), [], `${template} kept a placeholder`);
    assert.equal((filled.match(/<h1>/g) ?? []).length, 1, `${template} has more than one heading`);
  }
});

test("each filled page carries its hero, its table and only the section it promised", async () => {
  for (const template of TEMPLATES) {
    const source = await readFile(new URL(`../../pages/${template}.html`, import.meta.url), "utf8");
    const filled = fillTemplate(source, valuesFor(template), { name: template });

    assert.match(filled, /<section class="tv-hero[ "]/);
    assert.match(filled, /<section class="tv-body" data-table-view>/);
    assert.equal(
      filled.includes("tv-hero--tall"),
      template === "evolution",
      `${template}'s hero height`,
    );
    assert.equal(
      filled.includes('class="tv-trend"'),
      template === "electronegativity",
      `${template}'s trend section`,
    );
    assert.equal(filled.includes('class="tv-eras"'), template === "evolution", `${template}'s timeline`);
    assert.doesNotMatch(filled, /<script/, "a page script would boot beside the app module");
  }
});

test("the pages write their tables at build time, and the browser only attaches to them", () => {
  for (const template of TEMPLATES) {
    const filled = valuesFor(template).table;

    assert.equal(tiles(filled).length, 118, `${template} left the table to the browser`);
    assert.match(filled, /href="\/elements\/hydrogen\/"/, `${template} has no links to click`);
  }
});

test("a route that is not one of the four views is refused", () => {
  assert.throws(
    () => tableViewPageValues({ route: { path: "/", template: "home" }, elements }),
    /is not one of the four views/,
  );
  assert.throws(() => tableViewPageValues({ elements }), TypeError);
  assert.throws(() => viewNote(elements, "group"), /No note is written for the group view/);
});

test("a document with no table host gets a teardown and nothing else", async () => {
  const empty = { querySelector: () => null };
  const release = await startTableViews(empty);

  assert.equal(typeof release, "function");
  assert.equal(release(), undefined, "the teardown is callable");
});

test("the electronegativity description names the two ends of the scale the data holds", () => {
  const { low, high } = electronegativitySummary(elements);
  const description = routeFor("electronegativity").description;

  assert.equal(low.name, "Francium");
  assert.equal(high.name, "Fluorine");
  assert.match(description, /francium/i, "the description promises the wrong weakest pull");
  assert.match(description, /fluorine/i, "the description promises the wrong strongest pull");
  assert.equal(description.includes("caesium"), false, "caesium is not the weakest pull");
});
