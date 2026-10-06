import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  CONTACT_EMAIL,
  CONTACT_LEDE,
  REPORT_PARTS,
  WHERE_IT_GOES,
  contactPageValues,
} from "../../scripts/pages/contact.js";
import { aboutPageValues } from "../../scripts/pages/about.js";
import { allRoutes, routes } from "../../scripts/router/routes.js";
import { buildContext } from "../../tools/build-context.js";
import { fillTemplate, placeholderKeys } from "../../tools/render-template.js";

const context = await buildContext();
const manifest = allRoutes(context.elements, context.categories, context.glossary.all());
const declared = new Set(manifest.map((route) => route.path));
const values = contactPageValues();
const template = await readFile(new URL("../../pages/contact.html", import.meta.url), "utf8");
const route = routes.find((candidate) => candidate.template === "contact");

/** Every destination in a block of markup, as it was written. */
const hrefsIn = (markup) => [...markup.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);

/** The ids a block of markup offers as anchor targets. */
const idsIn = (markup) => [...markup.matchAll(/id="([^"]+)"/g)].map(([, id]) => id);

test("the route is declared, and it takes the sheet it shares with the about page", () => {
  assert.ok(route, "the contact route is missing from the manifest");
  assert.equal(route.path, "/contact/");
  assert.equal(route.section, "about", "contact sits outside the section it belongs to");
  assert.deepEqual(
    route.styles,
    ["styles/pages/about.css"],
    "the contact page does not declare the sheet it shares with about",
  );
});

test("the page says what it can do before it says where to write", () => {
  assert.equal(values.lede, CONTACT_LEDE);
  assert.match(CONTACT_LEDE, /static|no server/i, "the page does not say why there is no form");
  assert.doesNotMatch(template, /<form/, "a form with nowhere to post is a lie with a submit button");
});

test("the address is one well-formed address, written once and linked once", () => {
  assert.match(CONTACT_EMAIL, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "the address is not an address");

  const written = [...values.address.matchAll(/href="mailto:([^"]+)"/g)].map(([, address]) => address);

  assert.deepEqual(written, [CONTACT_EMAIL], "the page's one link is not the address it names");
  assert.match(values.address, /<a class="con-address__link" href="mailto:/);
  assert.equal(
    values.address.split(CONTACT_EMAIL).length - 1,
    2,
    "the address is written a number of times other than link plus label",
  );
});

test("a correction is asked for in the four parts that make it usable", () => {
  assert.equal(REPORT_PARTS.length, 4, "the page promises four parts and asks for another number");
  assert.deepEqual(
    REPORT_PARTS.map((part) => part.name),
    ["Which element or term", "Which value", "What it should say", "Where that comes from"],
  );

  for (const part of REPORT_PARTS) {
    assert.ok(part.note.length > 0, `${part.name} is asked for and not explained`);
  }

  // The fourth is the one the project's own rule is built on: a value is measured by a named source
  // or printed as unknown, so a correction without one has nowhere to go.
  assert.match(REPORT_PARTS.at(-1).note, /source/i, "the last part does not ask where the value comes from");
  assert.match(values.parts, /<ol class="con-parts">/, "the parts are not an ordered list");
  assert.equal([...values.parts.matchAll(/<li class="con-part">/g)].length, REPORT_PARTS.length);
});

test("each kind of mistake is sent to a place that can change it", () => {
  assert.equal(WHERE_IT_GOES.length, 3, "the page lists a different number of destinations than it says");

  for (const entry of WHERE_IT_GOES) {
    assert.ok(entry.name.length > 0, "a destination has no name");
    assert.ok(entry.note.length > 0, `${entry.name} says nothing`);
    assert.equal(values.where.includes(entry.name), true, `${entry.name} did not reach the page`);
  }

  const linked = WHERE_IT_GOES.filter((entry) => entry.link !== undefined);

  assert.equal(linked.length, 1, "a destination other than the data has an address to send to");
  assert.equal(linked[0].link.href, "/about/#data-sources");
});

test("the one link out lands on a heading the about page writes", () => {
  const link = WHERE_IT_GOES.find((entry) => entry.link !== undefined).link;
  const [page, fragment] = [link.href.split("#")[0], link.href.split("#")[1]];

  assert.ok(declared.has(page), `${link.href} points at a page this site does not publish`);
  assert.ok(
    idsIn(aboutPageValues().sections).includes(fragment),
    `#${fragment} is not a heading on the about page`,
  );
  assert.ok(values.where.includes(`${link.label}</a>`), "the link label did not reach the page");
});

test("the template and the module ask for the same blocks, in the same order", () => {
  const filled = fillTemplate(template, values, { name: "pages/contact.html" });

  assert.deepEqual(placeholderKeys(template), Object.keys(values));
  assert.deepEqual(placeholderKeys(filled), []);
  assert.ok(filled.trim().length > 0);
  assert.doesNotMatch(filled, /<script/, "the page would boot a script of its own");
});

test("every link the page writes is a declared route", () => {
  for (const href of hrefsIn(values.parts + values.where)) {
    if (href.startsWith("mailto:")) {
      continue;
    }

    assert.ok(declared.has(href.split("#")[0]), `${href} is not a declared route`);
  }
});
