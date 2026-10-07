import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { ATOM_LEDE, ATOM_OPENING, STAGE_TITLE, atomsPageValues } from "../../scripts/pages/atoms.js";
import { ATOM_CONTROLS } from "../../scripts/components/atom-bar.js";
import { atomSentence, countsFor, countsSentence } from "../../scripts/lib/atom-words.js";
import { allRoutes, routes } from "../../scripts/router/routes.js";
import { primaryNavigation } from "../../scripts/router/navigation.js";
import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";
import { sourceDir } from "../../tools/site-paths.js";

const context = await buildContext();
const manifest = allRoutes(context.elements, context.categories, context.glossary.all());
const declared = new Set(manifest.map((route) => route.path));
const route = routes.find((candidate) => candidate.template === "atoms");
const values = atomsPageValues({ elements: context.elements });
const template = await readFile(new URL("../../pages/atoms.html", import.meta.url), "utf8");
const filled = fillTemplate(template, values, { name: "pages/atoms.html" });
const opening = context.elements.find((element) => element.atomicNumber === ATOM_OPENING);

/** Every destination in a block of markup, as it was written. */
const hrefsIn = (markup) => [...markup.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);

test("the route is declared, is the one the build renders this module for, and is where the navigation says", () => {
  assert.ok(route, "the atoms route is missing from the manifest");
  assert.equal(route.path, "/atoms/");
  assert.equal(route.section, "atoms");
  assert.equal(route.nav.label, "Atoms");
  assert.deepEqual(
    primaryNavigation(routes).map((item) => item.label),
    ["Periodic Table", "Atoms", "Elements", "Glossary", "Calculators"],
    "the navbar order the author asked for",
  );
  assert.ok(declared.has(route.path), "the route is not in the manifest the build renders");
});

test("the page declares the sheets it needs, and every one of them exists", () => {
  for (const sheet of route.styles) {
    assert.equal(existsSync(path.join(sourceDir, sheet)), true, `${sheet} is declared and missing`);
  }

  assert.ok(route.styles.some((sheet) => sheet.includes("atom-bar")), "the bar's sheet is not declared");
  assert.ok(route.styles.some((sheet) => sheet.includes("atom-scene")), "the stage's sheet is not declared");
});

test("the template and the module ask for the same blocks, in the same order", () => {
  assert.deepEqual(placeholderKeys(template), Object.keys(values));
  assert.deepEqual(placeholderKeys(filled), []);
  assert.equal(filled.trim().length > 0, true);
  assert.doesNotMatch(filled, /\{\{[a-z]+\}\}/, "a placeholder survived the fill");
});

test("the page opens on an element, drawn as its own shells and counted in words", () => {
  const counts = countsFor(opening);
  const sentence = atomSentence(opening, counts);

  assert.equal(values.lede, ATOM_LEDE);
  assert.equal(values.title, STAGE_TITLE);
  assert.equal(values.canvasLabel, `${sentence} Drawn in three dimensions.`);
  assert.match(values.counts, new RegExp(`^${sentence}`));
  assert.ok(values.counts.includes("instead of the three-dimensional view"), "the fallback is not explained");

  // The diagram is the element's own shells: one dot per electron, which is the whole point of it.
  const dots = [...values.diagram.matchAll(/class="shells__dot"/g)].length;
  const rings = [...values.diagram.matchAll(/class="shells__rings?"/g)].length;

  assert.equal(dots, opening.atomicNumber, "the diagram draws a different number of electrons");
  assert.equal(rings, opening.shells.length, "the diagram draws a different number of shells");
  assert.match(values.diagram, new RegExp(countsSentence(counts)));
});

test("the bar is in the page, with every control the behaviour will look for", () => {
  for (const id of Object.values(ATOM_CONTROLS)) {
    assert.match(filled, new RegExp(`id="${id}"`), `${id} is not in the page`);
  }

  assert.equal([...filled.matchAll(/<option value="\d+"/g)].length, context.elements.length);
});

test("the page's canvas is named, and named as the atom it is showing", () => {
  assert.match(filled, /<canvas[^>]*role="img"/);
  assert.match(filled, /<canvas[^>]*hidden/);
  assert.match(filled, new RegExp(`aria-label="${values.canvasLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
});

test("every link the page writes is a route this site publishes or a heading on one", () => {
  for (const href of hrefsIn(filled)) {
    if (href.startsWith("mailto:")) {
      continue;
    }

    const page = href.split("#")[0];

    assert.ok(declared.has(page), `${href} goes nowhere this site publishes`);
  }

  assert.ok(filled.includes(`href="/elements/${opening.slug}/"`), "the card does not link to its element");
});

test("the page's headings do not skip a level, and it has one h1", () => {
  const levels = [...filled.matchAll(/<h([1-6])[\s>]/g)].map(([, level]) => Number(level));

  assert.equal(levels.filter((level) => level === 1).length, 1, "the page has more than one h1");
  assert.equal(levels[0], 1, "the page does not open with its h1");
  levels.forEach((level, index) => {
    if (index > 0) {
      assert.ok(
        level <= levels[index - 1] + 1,
        `the heading at position ${index + 1} jumps to h${level} from h${levels[index - 1]}`,
      );
    }
  });
});

test("the live region and the readout are on the page for the behaviour to write into", () => {
  assert.match(filled, /id="atom-announce"[^>]*role="status"/);
  assert.match(filled, /id="atom-announce"[^>]*aria-live="polite"/);
  assert.match(filled, /id="atom-readout"[^>]*hidden/);
});
