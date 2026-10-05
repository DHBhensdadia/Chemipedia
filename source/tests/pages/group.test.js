import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  GROUP_NOTES,
  INDEX_LEDE,
  groupFacts,
  groupFactList,
  groupIndexValues,
  groupMemberList,
  groupNote,
  groupValues,
} from "../../scripts/pages/group.js";
import { plural } from "../../scripts/lib/plural.js";
import { submenus } from "../../scripts/router/navigation.js";
import { allRoutes, groupRoutes, routes } from "../../scripts/router/routes.js";
import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";

const context = await buildContext();
const { elements, categories, units } = context;
const groupPages = groupRoutes(categories);
const routeBySlug = new Map(groupPages.map((route) => [route.category.slug, route]));
const manifest = allRoutes(elements, categories);
const declared = new Set(manifest.map((route) => route.path));
const valuesFor = (slug) =>
  groupValues({ route: routeBySlug.get(slug), elements, categories, units });
const membersOf = (slug) =>
  elements
    .filter((element) => element.category === slug)
    .sort((one, other) => one.atomicNumber - other.atomicNumber);
/** The tile anchors in markup, matched on a word boundary so `tile__sym` is not a tile. */
const tiles = (markup) => [...markup.matchAll(/class="tile(?: [^"]*)?"/g)].map(([match]) => match);

test("the site publishes one route per group, and every route is its own URL", () => {
  const paths = groupPages.map((route) => route.path);

  assert.equal(groupPages.length, 11);
  assert.equal(new Set(paths).size, 11, "two groups share a URL");
  assert.equal(manifest.length, routes.length + 118 + 11);
  assert.equal(routeBySlug.size, categories.length, "a category has no page");

  for (const route of groupPages) {
    const { category } = route;

    assert.equal(route.template, "group");
    assert.equal(route.path, `/element-groups/${category.slug}/`);
    assert.equal(route.section, "element-groups");
    assert.equal(route.path, `${route.path.replace(/\/$/, "")}/`, "the URL is not canonical");
    assert.ok(route.title.includes(category.name), `${route.path} does not name its group`);
    assert.ok(
      route.title.includes(String(category.count)),
      `${route.path} does not say how many members it has`,
    );
    assert.ok(
      route.description.includes(String(category.count)),
      `${route.path} has a description that disagrees with its count`,
    );
  }
});

test("every group page declares the sheets the table and its own cards need", () => {
  const sheets = [
    "styles/components/element-tile.css",
    "styles/components/legend-chips.css",
    "styles/components/periodic-table.css",
  ];

  for (const route of groupPages) {
    for (const sheet of sheets) {
      assert.ok((route.styles ?? []).includes(sheet), `${route.path} does not declare ${sheet}`);
    }
  }

  // The family's own sheet is appended by the build for the group template, so a group page must
  // not name it — a sheet listed twice is linked twice. The index has a template of its own and
  // has to ask for it, which the two assertions below hold in opposite directions.
  assert.equal(
    groupPages[0].styles.includes("styles/pages/group.css"),
    false,
    "a group route names the sheet the build already appends",
  );
  assert.ok(
    (routes.find((route) => route.template === "element-groups-index").styles ?? []).includes(
      "styles/pages/group.css",
    ),
    "the index page does not declare the family's sheet",
  );
});

test("the eleven groups' memberships partition the records, and match their declared counts", () => {
  const seen = new Map();

  for (const category of categories) {
    const members = membersOf(category.slug);

    assert.equal(members.length, category.count, `${category.slug} has ${members.length} members`);
    assert.deepEqual(
      groupFacts(members).count,
      category.count,
      `${category.slug} is counted two ways`,
    );

    for (const element of members) {
      assert.equal(seen.has(element.slug), false, `${element.slug} is filed twice`);
      seen.set(element.slug, category.slug);
    }
  }

  assert.equal(seen.size, elements.length, "an element is filed in no group");
});

test("a group's facts are read off its members, and the block is stated only when shared", () => {
  assert.deepEqual(groupFacts(membersOf("halogens")), {
    count: 5,
    range: "9\u201385",
    block: "p-block",
    states: ["gas", "liquid", "solid"],
  });

  // The eight unknowns span two blocks, so naming one of them would be the page inventing a fact.
  assert.equal(groupFacts(membersOf("unknown")).block, null);
  assert.equal(groupFacts(membersOf("transition-metals")).block, "d-block");

  for (const category of categories) {
    const members = membersOf(category.slug);
    const facts = groupFacts(members);
    const numbers = members.map((element) => element.atomicNumber);

    assert.equal(facts.range, `${numbers[0]}\u2013${numbers.at(-1)}`, `${category.slug} range`);
    assert.ok(facts.states.length > 0, `${category.slug} lists no state`);
    assert.equal(new Set(facts.states).size, facts.states.length, `${category.slug} repeats a state`);
  }
});

test("the facts list prints the facts, and drops the row a group cannot state", () => {
  const halogens = groupFactList(membersOf("halogens"));

  assert.match(halogens, /<dt class="grp-fact__k">Elements<\/dt><dd class="grp-fact__v">5<\/dd>/);
  assert.match(halogens, /<dt class="grp-fact__k">Atomic numbers<\/dt><dd class="grp-fact__v">9\u201385<\/dd>/);
  assert.match(halogens, /<dt class="grp-fact__k">Block<\/dt><dd class="grp-fact__v">p-block<\/dd>/);
  assert.match(halogens, /<dd class="grp-fact__v">Gas, Liquid, Solid<\/dd>/);
  assert.doesNotMatch(groupFactList(membersOf("unknown")), /Block<\/dt>/);
});

test("every group page renders the table isolated to it, with its legend as links", () => {
  for (const category of categories) {
    const values = valuesFor(category.slug);
    const allTiles = tiles(values.table);
    const matched = allTiles.filter((tile) => tile.includes("is-match"));

    assert.equal(allTiles.length, 118, `${category.slug} drew ${allTiles.length} tiles`);
    assert.equal(matched.length, category.count, `${category.slug} matched the wrong tiles`);
    assert.match(values.table, new RegExp(`data-isolated="${category.slug}"`));
    assert.equal(Object.keys(chipHrefs(values.table)).length, 11, `${category.slug} legend`);
    assert.doesNotMatch(values.table, /data-pt-highlight="[^"]*"[^>]*aria-pressed/, `${category.slug} has a legend button`);
  }

  // A group page's chips are navigation, so every one of them must lead to a page that exists.
  for (const href of Object.values(chipHrefs(valuesFor("halogens").table))) {
    assert.ok(declared.has(href), `${href} is not a declared route`);
  }
});

test("the note counts the group and the rest of the table from the records", () => {
  const members = membersOf("halogens");
  const note = groupNote({ members, category: routeBySlug.get("halogens").category, total: elements.length });

  assert.match(note, /The 5 at full colour are the halogens/);
  assert.match(note, /the other 113 are dimmed/);

  const unknown = groupNote({
    members: membersOf("unknown"),
    category: routeBySlug.get("unknown").category,
    total: elements.length,
  });

  assert.match(unknown, /are the unknowns;/, "the plural of a group is not derived");
});

test("every group carries a sentence for its hero and paragraphs for its explainer", () => {
  assert.deepEqual(
    Object.keys(GROUP_NOTES).sort(),
    categories.map((category) => category.slug).sort(),
    "the copy and the categories disagree about which groups exist",
  );

  for (const [slug, notes] of Object.entries(GROUP_NOTES)) {
    assert.ok(notes.lede.length > 20, `${slug} has no lede`);
    assert.ok(notes.about.length >= 2, `${slug} has too little written about it`);

    // The copy may not state a count: every number a reader is given is derived from the records,
    // so a sentence that carried one could go stale while the page around it stayed right.
    for (const text of [notes.lede, ...notes.about]) {
      assert.doesNotMatch(text, /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|thirty-five)\b\s+(elements|metals|non-metals|halogens|gases)/i, `${slug} states a count in its copy`);
      assert.doesNotMatch(text, /\b\d+\b\s+elements/, `${slug} states a count in its copy`);
    }
  }

  assert.ok(INDEX_LEDE.length > 40, "the index has no lede");
});

test("every member link resolves, and every member is a card on its own group's page", () => {
  for (const category of categories) {
    const members = membersOf(category.slug);
    const markup = groupMemberList({ members, units });
    const links = [...markup.matchAll(/href="(\/elements\/[^"]*)"/g)].map(([, href]) => href);

    assert.equal(links.length, members.length, `${category.slug} listed the wrong members`);

    for (const [index, href] of links.entries()) {
      assert.ok(declared.has(href), `${href} is not a declared route`);
      assert.equal(href, `/elements/${members[index].slug}/`);
    }
  }
});

test("the index lists all eleven groups, each with its own count and sentence", () => {
  const values = groupIndexValues({ elements, categories });
  const links = [...values.cards.matchAll(/href="(\/element-groups\/[^"]*)"/g)].map(([, href]) => href);
  const counts = [...values.cards.matchAll(/class="grp-card__n">(\d+)</g)].map(([, count]) => Number(count));

  assert.equal(values.lede, INDEX_LEDE);
  assert.equal(links.length, 11);
  assert.deepEqual(counts, categories.map((category) => category.count));
  assert.equal(new Set(links).size, 11, "the index repeats a group");

  for (const href of links) {
    assert.ok(declared.has(href), `${href} is not a declared route`);
  }
});

test("the group pages' band lists the eleven groups and the index, and nothing twice", () => {
  const items = submenus["element-groups"].items;

  assert.equal(submenus["element-groups"].label, "Element groups:");
  assert.equal(items.length, 12);
  assert.equal(items.at(-1).path, "/element-groups/");

  for (const item of items) {
    assert.ok(declared.has(item.path), `the band links to ${item.path}, which is not declared`);
  }

  assert.equal(new Set(items.map((item) => item.path)).size, items.length, "the band repeats a link");
});

test("the templates and their modules ask for the same blocks, in the same order", async () => {
  const families = [
    [
      "group",
      () => valuesFor("halogens"),
    ],
    ["element-groups-index", () => groupIndexValues({ elements, categories })],
  ];

  for (const [name, values] of families) {
    const template = await readFile(new URL(`../../pages/${name}.html`, import.meta.url), "utf8");
    const filled = fillTemplate(template, values(), { name: `pages/${name}.html` });

    assert.deepEqual(placeholderKeys(template), Object.keys(values()), `${name} asks for other blocks`);
    assert.deepEqual(placeholderKeys(filled), [], `${name} kept a placeholder`);
    assert.ok(filled.trim().length > 0, `${name} filled to nothing`);
  }

  const group = await readFile(new URL("../../pages/group.html", import.meta.url), "utf8");

  assert.ok(
    group.indexOf("{{note}}") > group.indexOf("{{table}}"),
    "the group page puts its note above its table",
  );
});

test("a route with no category, and a category with no copy, are refused rather than half-drawn", () => {
  assert.throws(
    () => groupValues({ route: { path: "/element-groups/x/" }, elements, categories, units }),
    /carries no category/,
  );
  assert.throws(
    () =>
      groupValues({
        route: { path: "/element-groups/gases/", category: { slug: "gases", name: "Gas" } },
        elements,
        categories,
        units,
      }),
    /No copy is written for the gases group/,
  );
});

test("a category's plural is derived, so one name is never stored twice", () => {
  assert.equal(plural("Halogen"), "halogens");
  assert.equal(plural("Noble gas"), "noble gases");
  assert.equal(plural("Unknown"), "unknowns");
  assert.equal(plural("Transition metal"), "transition metals");
  assert.equal(plural(""), "");
  assert.equal(plural(undefined), "");
});

/**
 * The href each legend chip carries, keyed by the key the chip stands for.
 *
 * A chip renders its attributes in the order the component lists them — class, href, data-key,
 * data-pt-highlight — so the pair can be read straight out of the markup rather than through a
 * parser the test suite does not have.
 */
function chipHrefs(html) {
  const found = {};

  for (const [, href, key] of html.matchAll(
    /class="chip" href="([^"]*)" data-key="([^"]*)"/g,
  )) {
    found[key] = href;
  }

  return found;
}
