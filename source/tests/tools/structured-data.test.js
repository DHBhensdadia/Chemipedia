import { test } from "node:test";
import assert from "node:assert/strict";

import { structuredDataFor, structuredDataScript } from "../../tools/structured-data.js";
import { buildContext } from "../../tools/build-context.js";

const context = await buildContext();
const hydrogen = context.elements.find((element) => element.symbol === "H");
const page = {
  path: "/about/",
  title: "About ChemiPedia",
  description: "What ChemiPedia is and where its data comes from.",
};

test("a page is a WebPage belonging to one WebSite", () => {
  const data = structuredDataFor(page);

  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "WebPage");
  assert.equal(data.name, page.title);
  assert.equal(data.description, page.description);
  assert.equal(data.url.endsWith("/about/"), true);
  assert.equal(data.isPartOf["@type"], "WebSite");
  assert.equal(data.isPartOf.name, "ChemiPedia");
  assert.equal(data.about, undefined, "a page that is not about an element claims no subject");
});

test("an element page carries the record it is about", () => {
  const data = structuredDataFor({ path: "/elements/hydrogen/", title: "Hydrogen (H)", description: "…", element: hydrogen });

  assert.equal(data.about["@type"], "Thing");
  assert.equal(data.about.name, "Hydrogen");
  assert.equal(data.about.alternateName, "H");
  assert.equal(data.about.url, data.url, "the subject and the page are the same address here");

  const properties = Object.fromEntries(data.about.additionalProperty.map((entry) => [entry.name, entry.value]));

  assert.deepEqual(properties, { "Atomic number": 1, "Atomic weight": hydrogen.atomicWeight });
});

test("a value cannot end the script element early", () => {
  const script = structuredDataScript({
    path: "/glossary/x/",
    title: 'A </script><img src=x> title',
    description: "…",
  });

  assert.equal(script.includes("</script><img"), false, "a tag inside a value broke the script open");
  assert.match(script, /^<script type="application\/ld\+json">/);
  assert.match(script, /<\/script>$/);
});

test("the script's payload parses back to the object it was made from", () => {
  const json = structuredDataScript(page).replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");

  assert.deepEqual(JSON.parse(json), structuredDataFor(page));
});
