import { test } from "node:test";
import assert from "node:assert/strict";

import { PLACEHOLDER_ORIGIN, absoluteUrl, isPlaceholderOrigin, siteBase, siteOrigin } from "../../tools/site-origin.js";

test("the default origin is a reserved address that cannot resolve", () => {
  // RFC 2606 reserves `.example` so that documentation can carry a URL that is unmistakably not
  // real. A canonical link to a domain we do not own would be worse than none.
  assert.match(PLACEHOLDER_ORIGIN, /^https:\/\/[a-z]+\.example$/);
});

test("the origin carries no trailing slash, so a path cannot double it", () => {
  assert.equal(siteOrigin.endsWith("/"), false);
  assert.equal(absoluteUrl("/about/"), `${siteOrigin}/about/`);
  assert.equal(absoluteUrl("/"), `${siteOrigin}/`);
  assert.equal(absoluteUrl("/").includes("//about"), false);
});

test("a path that is not a published path is refused", () => {
  assert.throws(() => absoluteUrl("about/"), TypeError);
  assert.throws(() => absoluteUrl(""), TypeError);
  assert.throws(() => absoluteUrl(undefined), TypeError);
});

test("whether the build is still on the placeholder is stated rather than left to be noticed", () => {
  assert.equal(isPlaceholderOrigin, siteOrigin === PLACEHOLDER_ORIGIN);
});

test("the path the site is published under is read from the origin it claims", () => {
  // A root deployment has no path to publish under, and neither does this one: the placeholder is
  // a bare origin, so a local build writes the same URLs it always has.
  assert.equal(siteBase, "");
  assert.equal(new URL(siteOrigin).pathname.replace(/\/+$/, ""), siteBase);
});
