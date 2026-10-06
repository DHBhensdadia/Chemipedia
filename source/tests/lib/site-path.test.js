import { test } from "node:test";
import assert from "node:assert/strict";

import { SITE_BASE, siteBaseOf, sitePath } from "../../scripts/lib/site-path.js";

test("a site served from a domain root has no path of its own", () => {
  assert.equal(siteBaseOf("https://chemipedia.example/scripts/lib/site-path.js"), "");
  assert.equal(siteBaseOf("https://chemipedia.example"), "");
});

test("a site served from a path says so, which is the case that used to break", () => {
  // A project page is served from a folder named after its repository. Every path written as
  // `/elements/hydrogen/` then belongs to the domain and not to the site, which is why the base is
  // read from the module's own address instead of assumed to be empty.
  assert.equal(
    siteBaseOf("https://dhbhensdadia.github.io/Chemipedia/scripts/lib/site-path.js"),
    "/Chemipedia",
  );
});

test("the path is as deep as the deployment is, not as deep as one example", () => {
  assert.equal(siteBaseOf("http://127.0.0.1:4182/preview/one/scripts/lib/site-path.js"), "/preview/one");
});

test("in the build there is no site to place a path in, so nothing is added", () => {
  // The build imports this module from disk. A file's path is not an address, and a path it
  // returned would be a path on this machine rather than one on the site.
  assert.equal(siteBaseOf(import.meta.url), "");
  assert.equal(SITE_BASE, siteBaseOf(import.meta.url));
  assert.equal(SITE_BASE, "");
});

test("a path from the site's root is written with the site's path in front of it", () => {
  assert.equal(sitePath("/elements/hydrogen/", "/Chemipedia"), "/Chemipedia/elements/hydrogen/");
  assert.equal(sitePath("/data", "/Chemipedia"), "/Chemipedia/data");
  assert.equal(sitePath("/", "/Chemipedia"), "/Chemipedia/");
  assert.equal(sitePath("/elements/hydrogen/"), "/elements/hydrogen/");
});

test("a path that is not from the site's root is refused rather than resolved against a page", () => {
  assert.throws(() => sitePath("elements/hydrogen"), TypeError);
  assert.throws(() => sitePath(""), TypeError);
  assert.throws(() => sitePath(undefined), TypeError);
});
