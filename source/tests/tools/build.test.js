import { test } from "node:test";
import assert from "node:assert/strict";

import { renderDocument, stylesheetsFor } from "../../tools/build.js";

const page = {
  title: "ChemiPedia — a title",
  description: "A description of the page.",
  body: '<article class="intro"><h1>ChemiPedia</h1></article>',
};

test("the skeleton is a complete HTML document", () => {
  const document = renderDocument(page);

  assert.ok(document.startsWith("<!doctype html>"), "the doctype comes first");
  assert.match(document, /<html lang="en">/);
  assert.match(document, /<meta charset="utf-8">/);
  assert.match(document, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.ok(document.trimEnd().endsWith("</html>"), "the document is closed");
});

test("the skeleton carries the page's own title and description", () => {
  const document = renderDocument(page);

  assert.ok(document.includes("<title>ChemiPedia — a title</title>"));
  assert.ok(
    document.includes('<meta name="description" content="A description of the page.">'),
  );
});

test("the skeleton declares an icon, so no page load makes a request that fails", () => {
  const document = renderDocument(page);

  assert.ok(
    document.includes('<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">'),
    "a document with no icon makes the browser ask for one anyway and fail",
  );
});

test("metadata is escaped before it reaches the markup", () => {
  const document = renderDocument({
    ...page,
    title: 'A <title> & a "quote"',
    description: "An <em>emphasis</em> & an ampersand",
  });

  assert.ok(document.includes("<title>A &lt;title&gt; &amp; a &quot;quote&quot;</title>"));
  assert.ok(document.includes('content="An &lt;em&gt;emphasis&lt;/em&gt; &amp; an ampersand"'));
  assert.equal(document.includes("<em>emphasis</em>"), false);
});

test("a page links its declared component sheets, and its own sheet last", () => {
  const sheets = stylesheetsFor({
    template: "home",
    styles: ["styles/components/periodic-table.css"],
  });

  assert.ok(sheets.includes("/styles/components/periodic-table.css"), "the declared sheet is missing");
  assert.equal(sheets.indexOf("/styles/components/periodic-table.css"), sheets.length - 2);
  assert.equal(sheets.at(-1), "/styles/pages/home.css", "the page's own sheet comes last");
});

test("a page that declares no component sheets links none", () => {
  const sheets = stylesheetsFor({ template: "home" });

  assert.equal(sheets.some((sheet) => sheet.includes("periodic-table")), false);
});

test("a declared sheet that does not exist is skipped rather than linked and 404ing", () => {
  const sheets = stylesheetsFor({ template: "home", styles: ["styles/components/not-a-component.css"] });

  assert.equal(sheets.some((sheet) => sheet.includes("not-a-component")), false);
});

test("every document links the one app module, once, and names its page", () => {
  const document = renderDocument({ ...page, page: "element-detail" });

  assert.equal([...document.matchAll(/<script/g)].length, 1, "one script per document");
  assert.ok(
    document.includes('<script type="module" src="/scripts/app.js"></script>'),
    "the app is what survives a client-side navigation and runs the new page's behaviour",
  );
  assert.ok(document.includes('<body data-page="element-detail">'), "the body names the page");
});

test("authored markup is placed inside the main landmark and left alone", () => {
  const document = renderDocument(page);

  assert.ok(document.includes('<main id="main">\n<article class="intro">'), "the landmark wraps the page");
  assert.ok(document.includes('<h1>ChemiPedia</h1>'), "authored markup is not escaped");
});
