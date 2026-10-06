import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  DOWNLOADS_LEDE,
  DOWNLOAD_TARGETS,
  PRINT_STEPS,
  downloadCard,
  downloadsPageValues,
} from "../../scripts/pages/downloads.js";
import { aboutPageValues } from "../../scripts/pages/about.js";
import { escapeHtml } from "../../scripts/lib/html.js";
import { allRoutes, routes } from "../../scripts/router/routes.js";
import { buildContext } from "../../tools/build-context.js";
import { sourceDir } from "../../tools/site-paths.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";

const context = await buildContext();
const manifest = allRoutes(context.elements, context.categories, context.glossary.all());
const declared = new Set(manifest.map((route) => route.path));
const values = downloadsPageValues();
const template = await readFile(new URL("../../pages/downloads.html", import.meta.url), "utf8");
const route = routes.find((candidate) => candidate.template === "downloads");

/** The template file a declared route renders, relative to `source/`. */
function routeFileFor(href) {
  const found = manifest.find((candidate) => candidate.path === href);

  return `pages/${found.template}.html`;
}

/** Every destination in a block of markup, as it was written. */
const hrefsIn = (markup) => [...markup.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);

/** The path part of a link, with any fragment removed. */
const pageOf = (href) => href.split("#")[0];

/** The ids a block of markup offers as anchor targets. */
const idsIn = (markup) => [...markup.matchAll(/id="([^"]+)"/g)].map(([, id]) => id);

test("the route is declared, and it is the one the build renders this module for", () => {
  assert.ok(route, "the downloads route is missing from the manifest");
  assert.equal(route.section, "tools");
  assert.equal(route.path, "/downloads/");
});

test("every target is either a route this site publishes or a file it ships", () => {
  assert.ok(DOWNLOAD_TARGETS.length >= 3, "the page offers less than the three things it promises");

  for (const target of DOWNLOAD_TARGETS) {
    assert.match(target.kind, /^(route|file)$/, `${target.name} is neither a route nor a file`);

    if (target.kind === "route") {
      assert.ok(declared.has(target.href), `${target.name} offers ${target.href}, which is not declared`);
      assert.equal(
        existsSync(path.join(sourceDir, routeFileFor(target.href))),
        true,
        `${target.name} offers a route whose template the build cannot render`,
      );
    } else {
      assert.equal(target.download, true, `${target.name} is a file the browser would open, not save`);
      assert.equal(
        existsSync(path.join(sourceDir, target.href.replace(/^\//, ""))),
        true,
        `${target.name} offers ${target.href}, which is not on disk`,
      );
    }
  }
});

test("the file the page offers is the one the build copies into the site", () => {
  const file = DOWNLOAD_TARGETS.filter((target) => target.kind === "file");

  assert.equal(file.length, 1, "the data file is offered twice, or not at all");
  assert.equal(file[0].href, "/data/elements.json");
  // `data` is one of the directories the build copies and the file is copied from the source tree,
  // so the same path holds the same bytes on both sides of the build.
  assert.deepEqual(JSON.parse(readFileSync(path.join(sourceDir, "data/elements.json"), "utf8")).length, 118);
});

test("a card names the target, says what the reader gets and opens it", () => {
  for (const target of DOWNLOAD_TARGETS) {
    const card = downloadCard(target);

    assert.match(card, /<article class="dl-card"/);
    assert.match(card, new RegExp(`data-download-kind="${target.kind}"`));
    assert.ok(card.includes(target.name), `${target.name} is not on its card`);
    assert.ok(card.includes(escapeHtml(target.note)), `${target.name}'s card does not say what it is`);
    assert.match(card, new RegExp(`href="${target.href.replace(/[/.]/g, "\\$&")}"`));

    if (target.kind === "file") {
      assert.match(card, / download>/, "the file is not offered as a download");
      assert.ok(card.includes(target.link.href), `${target.name} does not link to its provenance`);
    } else {
      assert.equal(card.includes(" download"), false, `${target.name} is offered as a download`);
    }
  }
});

test("the link on the data card lands on the heading the about page writes", () => {
  const link = DOWNLOAD_TARGETS.find((target) => target.kind === "file").link;
  const [page, fragment] = [pageOf(link.href), link.href.split("#")[1]];

  assert.ok(declared.has(page), `${link.href} points at a page this site does not publish`);
  assert.ok(idsIn(aboutPageValues().sections).includes(fragment), `#${fragment} is not a heading on the about page`);
});

test("the four steps read in the order a reader has to do them", () => {
  assert.equal(PRINT_STEPS.length, 4, "the page prints a different number of steps than it tells");

  const order = PRINT_STEPS.map((step) => step.name);
  const at = (needle) => order.findIndex((name) => name.toLowerCase().includes(needle));

  assert.equal(at("open") < at("print"), true, "the steps print before opening the page");
  assert.equal(at("print") >= 0 && at("colour") > at("print"), true, "the colours are not asked for at print time");
  assert.equal(at("100") > at("colour"), true, "the scale is not the last thing asked for");

  for (const step of PRINT_STEPS) {
    assert.ok(step.note.length > 0, `${step.name} says nothing`);
  }

  assert.match(values.steps, /<ol class="dl-steps">/, "the steps are not an ordered list");
  assert.equal(
    [...values.steps.matchAll(/<li class="dl-step">/g)].length,
    PRINT_STEPS.length,
    "a step did not reach the list",
  );
});

test("the page carries its lede and all three cards", () => {
  assert.equal(values.lede, DOWNLOADS_LEDE);
  assert.equal(
    [...values.cards.matchAll(/<article class="dl-card"/g)].length,
    DOWNLOAD_TARGETS.length,
    "a card did not reach the page",
  );
  assert.equal(/\{\{[a-z]+\}\}/.test(values.cards + values.steps), false, "a placeholder survived the fill");
});

test("the template and the module ask for the same blocks, in the same order", () => {
  const filled = fillTemplate(template, values, { name: "pages/downloads.html" });

  assert.deepEqual(placeholderKeys(template), Object.keys(values));
  assert.deepEqual(placeholderKeys(filled), []);
  assert.ok(filled.trim().length > 0);
  assert.doesNotMatch(filled, /<script/, "the page would boot a script of its own");
});

test("every link the page writes is a declared route or a file the site ships", () => {
  for (const href of hrefsIn(values.cards + values.steps)) {
    if (href.startsWith("mailto:")) {
      continue;
    }

    const page = pageOf(href);

    assert.ok(
      declared.has(page) || existsSync(path.join(sourceDir, page.replace(/^\//, ""))),
      `${href} goes nowhere this site publishes`,
    );
  }
});
