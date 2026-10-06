import { test } from "node:test";
import assert from "node:assert/strict";

import { stylesheetsFor } from "../../tools/build.js";
import { renderDocument, robotsFor, rootedAt, sitemapFor } from "../../tools/document.js";

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

test("a published page says where it lives, what it is, and where the data about it comes from", () => {
  const document = renderDocument({ ...page, path: "/about/" });

  assert.match(document, /<link rel="canonical" href="https:\/\/[^/"]+\/about\/">/);
  assert.match(document, /<meta property="og:title" content="ChemiPedia — a title">/);
  assert.match(document, /<meta property="og:url" content="https:\/\/[^/"]+\/about\/">/);
  assert.match(document, /<meta property="og:type" content="website">/);
  assert.match(document, /<script type="application\/ld\+json">/);
});

test("the not-found document claims no address, because it has none", () => {
  const document = renderDocument(page);

  assert.equal(document.includes("canonical"), false, "a canonical link to a 404 is a lie");
  assert.equal(document.includes("og:"), false);
  assert.equal(document.includes("ld+json"), false);
});

test("a deployment at a path keeps the site's own links inside it", () => {
  // The failure this prevents is silent and total: a project site on GitHub Pages is served from a
  // path named after its repository, and a stylesheet asked for at `/styles/base.css` would be
  // asked for at the domain root, where nothing is.
  const markup = [
    '<link rel="stylesheet" href="/styles/base.css">',
    '<script type="module" src="/scripts/app.js"></script>',
    '<a class="nav__link" href="/elements/hydrogen/">Hydrogen</a>',
  ].join("\n");

  const under = rootedAt(markup, "/Chemipedia");

  assert.ok(under.includes('href="/Chemipedia/styles/base.css"'));
  assert.ok(under.includes('src="/Chemipedia/scripts/app.js"'));
  assert.ok(under.includes('href="/Chemipedia/elements/hydrogen/"'));
});

test("a deployment at a root, and a local build, are left exactly as they are", () => {
  const markup = '<a href="/elements/">Elements</a>';

  assert.equal(rootedAt(markup, ""), markup);
});

test("only the site's own URLs are rewritten", () => {
  const markup = [
    '<a href="#main">Skip</a>',
    '<a href="//example.com/x">Elsewhere</a>',
    '<a href="https://example.com/x">Elsewhere</a>',
    '<a href="mailto:devansh@example.com">Mail</a>',
  ].join("\n");

  assert.equal(rootedAt(markup, "/Chemipedia"), markup);
});

test("a document built at a root keeps the paths the development server serves", () => {
  // The base is empty here, which is both a local build and a site published at a domain root, so
  // the skeleton's own icon and module stay exactly where they were written.
  const document = renderDocument({ ...page, stylesheets: ["/styles/base.css"] });

  assert.ok(document.includes('href="/assets/brand/favicon.svg"'), "the icon is not at a path");
  assert.ok(document.includes('href="/styles/base.css"'));
});

test("the sitemap lists the addresses the build wrote, in order", () => {
  const xml = sitemapFor(["/", "/about/", "/elements/hydrogen/"]);

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.ok(xml.trimEnd().endsWith("</urlset>"));

  const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);

  assert.equal(locations.length, 3);
  assert.match(locations[0], /^https:\/\/[^/"]+\/$/);
  assert.match(locations[1], /\/about\/$/);
  assert.match(locations[2], /\/elements\/hydrogen\/$/);
  assert.equal(new Set(locations).size, 3, "an address is listed twice");
});

test("robots.txt allows everything and points at the sitemap", () => {
  const robots = robotsFor();

  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.match(robots, /Sitemap: https:\/\/[^\s]+\/sitemap\.xml\n$/);
});

test("authored markup is placed inside the main landmark and left alone", () => {
  const document = renderDocument(page);

  assert.ok(document.includes('<main id="main">\n<article class="intro">'), "the landmark wraps the page");
  assert.ok(document.includes('<h1>ChemiPedia</h1>'), "authored markup is not escaped");
});
