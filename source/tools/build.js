/**
 * The build.
 *
 * Renders every ready route in the manifest to a static HTML file under `dist/`, and copies the
 * static directories across unchanged. It runs on plain Node with no packages: the whole site is
 * produced by reading an authored template, wrapping it in the document skeleton and the global
 * shell, and writing it to the file its URL owns.
 *
 * Three consequences worth stating, because they shape the rest of the project:
 *
 *   - The document skeleton and the shell are written once, here. No template carries its own
 *     `<html>`, `<head>`, `<body>`, header, submenu or footer, so a change to the chrome or to the
 *     metadata is one edit rather than one per page family.
 *   - A route whose template is not written yet is skipped and counted, not rendered as a stub.
 *     That is what lets the manifest declare the site's whole inventory before the pages exist.
 *   - Only what the browser loads is copied. `pages/` holds fragments rather than documents, and
 *     `tools/` and `tests/` are development-only, so none of them reach the built output.
 *
 * Run it directly with `node source/tools/build.js`, or import `build()` — the development server
 * does the latter so that a fresh clone needs only one command.
 */

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { siteFooter } from "../scripts/components/site-footer.js";
import { siteHeader } from "../scripts/components/site-header.js";
import { submenu as submenuBand } from "../scripts/components/submenu.js";
import { escapeHtml } from "../scripts/lib/html.js";
import { footerColumns, isCurrent, primaryNavigation, submenuForSection } from "../scripts/router/navigation.js";
import { routes, templatePathFor } from "../scripts/router/routes.js";
import { NOT_FOUND_FILE, distDir, outputFileForPath, projectRoot, sourceDir } from "./site-paths.js";

/**
 * Directories copied into the build untouched: the scripts, stylesheets, data and artwork the
 * browser loads. A directory that does not exist yet is skipped, so this list may name folders that
 * later phases create.
 */
const STATIC_DIRECTORIES = ["scripts", "styles", "data", "assets"];

/**
 * The stylesheets every page needs, in cascade order: the tokens first, then the layers that read
 * them, then the shell's components. A page's own stylesheet is appended after these, and only when
 * it exists, so a page family that has not been styled yet still links a working set.
 */
const GLOBAL_STYLESHEETS = ["styles/tokens.css", "styles/base.css", "styles/layout.css"];

const SHELL_STYLESHEETS = [
  "styles/components/wordmark.css",
  "styles/components/search-field.css",
  "styles/components/site-header.css",
  "styles/components/submenu.css",
  "styles/components/site-footer.css",
];

/**
 * The document served for a URL that matches no route. It is not a route — it has no URL of its own
 * — so it is declared here rather than in the manifest, but it is rendered through the same path.
 *
 * Its chrome is rendered for a path that no route matches, so no navigation item claims to be the
 * current page on a page that does not exist.
 */
const NOT_FOUND_PAGE = {
  template: "404",
  title: "Page not found — ChemiPedia",
  description: "The address you followed does not match a page on ChemiPedia.",
  currentPath: "/not-found/",
};

/**
 * Wrap authored markup in the document skeleton every page shares.
 *
 * The favicon is the one asset linked from here on its own account. A browser asks for an icon on
 * every page load, so a document that declares none produces a failed request on every page;
 * declaring ours is what keeps the console and network log clean.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   body: string,
 *   stylesheets?: string[],
 *   header?: string,
 *   submenu?: string,
 *   footer?: string
 * }} page
 * @returns {string}
 */
export function renderDocument({
  title,
  description,
  body,
  stylesheets = [],
  header = "",
  submenu = "",
  footer = "",
}) {
  const links = stylesheets
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
${links}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header}
${submenu}
<main id="main">
${body.trim()}
</main>
${footer}
</body>
</html>
`;
}

/**
 * The stylesheets a page links: the global layer, the shell, and the page's own if it has one.
 *
 * @param {{ template: string }} page
 * @returns {string[]} URLs, in cascade order
 */
export function stylesheetsFor(page) {
  const candidates = [
    ...GLOBAL_STYLESHEETS,
    ...SHELL_STYLESHEETS,
    `styles/pages/${page.template}.css`,
  ];

  return candidates
    .filter((relative) => existsSync(path.join(sourceDir, relative)))
    .map((relative) => `/${relative}`);
}

/**
 * The chrome for a page: the masthead, the contextual submenu band, and the footer.
 *
 * @param {{ section?: string }} page
 * @param {string} currentPath
 * @returns {{ header: string, submenu: string, footer: string }}
 */
export function shellFor(page, currentPath) {
  return {
    header: siteHeader({ navigation: primaryNavigation(routes), currentPath, isCurrent }),
    submenu: submenuBand({ submenu: submenuForSection(page.section), currentPath, isCurrent }),
    footer: siteFooter({ columns: footerColumns }),
  };
}

/**
 * Read a route's authored template from `source/`.
 *
 * @param {{ template: string }} page
 * @returns {Promise<string>}
 */
async function readTemplate(page) {
  return readFile(path.join(sourceDir, templatePathFor(page)), "utf8");
}

/**
 * @param {{ template: string }} page
 * @returns {boolean} whether the page's authored template exists yet
 */
export function isReady(page) {
  return existsSync(path.join(sourceDir, templatePathFor(page)));
}

/**
 * Copy the browser-facing directories into the build.
 *
 * @returns {Promise<string[]>} the names of the directories that were copied
 */
async function copyStaticDirectories() {
  const copied = [];

  for (const name of STATIC_DIRECTORIES) {
    const from = path.join(sourceDir, name);

    if (!existsSync(from)) {
      continue;
    }

    await cp(from, path.join(distDir, name), { recursive: true });
    copied.push(name);
  }

  return copied;
}

/**
 * Rebuild the whole site into `dist/`.
 *
 * The directory is emptied first, so the output never accumulates a page whose route has been
 * removed. That deletion is the one destructive thing in the project, so it is guarded: the build
 * refuses to run if its output directory has drifted onto the source tree or the repository root.
 *
 * @returns {Promise<{ routes: string[], skipped: string[], copied: string[], distDir: string }>}
 */
export async function build() {
  if (distDir === projectRoot || distDir === sourceDir) {
    throw new Error(`Refusing to build into ${distDir}: that is not a build directory.`);
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const copied = await copyStaticDirectories();
  const built = [];
  const skipped = [];

  for (const route of routes) {
    if (!isReady(route)) {
      skipped.push(route.path);
      continue;
    }

    const body = await readTemplate(route);
    const file = outputFileForPath(route.path);
    const document = renderDocument({
      ...route,
      body,
      stylesheets: stylesheetsFor(route),
      ...shellFor(route, route.path),
    });

    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, document, "utf8");
    built.push(route.path);
  }

  const notFound = renderDocument({
    ...NOT_FOUND_PAGE,
    body: await readTemplate(NOT_FOUND_PAGE),
    stylesheets: stylesheetsFor(NOT_FOUND_PAGE),
    ...shellFor(NOT_FOUND_PAGE, NOT_FOUND_PAGE.currentPath),
  });

  await writeFile(path.join(distDir, NOT_FOUND_FILE), notFound, "utf8");

  return { routes: built, skipped, copied, distDir };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const { routes: built, skipped, copied, distDir: output } = await build();
  const where = path.relative(process.cwd(), output) || ".";

  console.log(
    `Built ${built.length} ${built.length === 1 ? "route" : "routes"} and the not-found page into ${where}/`,
  );

  if (skipped.length > 0) {
    console.log(`${skipped.length} declared routes are waiting on their templates: ${skipped.join(", ")}`);
  }

  for (const name of copied) {
    console.log(`Copied ${name}/ into ${where}/${name}/`);
  }
}
