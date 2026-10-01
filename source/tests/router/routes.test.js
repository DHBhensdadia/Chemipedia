import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";

import { routes, templatePathFor } from "../../scripts/router/routes.js";
import { sourceDir } from "../../tools/site-paths.js";

test("every route declares a path", () => {
  assert.ok(routes.length > 0, "the manifest declares no routes at all");

  for (const route of routes) {
    assert.equal(typeof route.path, "string", `route ${route.path} has no path`);
    assert.ok(route.path.length > 0, "a route declares an empty path");
  }
});

test("no two routes claim the same path", () => {
  const paths = routes.map((route) => route.path);
  const unique = new Set(paths);

  assert.equal(unique.size, paths.length, `duplicate paths: ${paths.join(", ")}`);
});

test("every path is absolute and published in directory style", () => {
  for (const route of routes) {
    assert.ok(route.path.startsWith("/"), `${route.path} is not absolute`);
    assert.ok(
      route.path === "/" || route.path.endsWith("/"),
      `${route.path} must end with a trailing slash to match how the site is served`,
    );
    assert.equal(route.path.includes("//"), false, `${route.path} repeats a separator`);
  }
});

test("every route declares its own title and description", () => {
  for (const route of routes) {
    assert.equal(typeof route.title, "string", `${route.path} has no title`);
    assert.ok(route.title.trim().length > 0, `${route.path} has an empty title`);
    assert.equal(typeof route.description, "string", `${route.path} has no description`);
    assert.ok(route.description.trim().length > 0, `${route.path} has an empty description`);
  }
});

test("the manifest is plain data, so the browser can read it without the build", () => {
  for (const route of routes) {
    for (const [field, value] of Object.entries(route)) {
      assert.equal(
        typeof value,
        "string",
        `${route.path} declares ${field} as a ${typeof value}; the manifest holds data only`,
      );
    }
  }
});

test("every route names a template that exists under source/pages", async () => {
  for (const route of routes) {
    assert.equal(typeof route.template, "string", `${route.path} names no template`);
    await assert.doesNotReject(
      access(path.join(sourceDir, templatePathFor(route))),
      `${route.path} points at a template that does not exist`,
    );
  }
});

test("the home page is declared at the root path", () => {
  const home = routes.filter((route) => route.path === "/");

  assert.equal(home.length, 1, "the root path must be declared exactly once");
  assert.equal(home[0].template, "home");
});

test("a template path is relative to source and keeps the family name", () => {
  assert.equal(templatePathFor({ template: "home" }), "pages/home.html");
  assert.equal(templatePathFor({ template: "element-detail" }), "pages/element-detail.html");
});
