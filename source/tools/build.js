/**
 * The build.
 *
 * Renders every route in the manifest to a static HTML file under `dist/`, and copies the static
 * directories across unchanged. It runs on plain Node with no packages: the whole site is produced
 * by reading an authored template, wrapping it in the document skeleton below, and writing it to
 * the file its URL owns.
 *
 * Two consequences worth stating, because they shape how the rest of the project is written:
 *
 *   - The document skeleton is the only place a `<head>` is written. No template carries its own
 *     `<html>`, `<head>` or `<body>`, so a metadata change is one edit rather than one per family.
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

import { routes, templatePathFor } from "../scripts/router/routes.js";
import { NOT_FOUND_FILE, distDir, outputFileForPath, projectRoot, sourceDir } from "./site-paths.js";

/**
 * Directories copied into the build untouched: the scripts, stylesheets, data and artwork the
 * browser loads. A directory that does not exist yet is skipped, so this list may name folders that
 * later phases create.
 */
const STATIC_DIRECTORIES = ["scripts", "styles", "data", "assets"];

/**
 * The document served for a URL that matches no route. It is not a route — it has no URL of its own
 * — so it is declared here rather than in the manifest, but it is rendered through the same path.
 */
const NOT_FOUND_PAGE = {
  template: "404",
  title: "Page not found — ChemiPedia",
  description: "The address you followed does not match a page on ChemiPedia.",
};

/**
 * Escape text for insertion into markup. Route metadata is written by us, so this is a guard against
 * an accidental angle bracket rather than a defence against hostile input — but metadata will later
 * come from the data layer, and it must be safe then too.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap authored markup in the document skeleton every page shares.
 *
 * The favicon is the one asset linked from here. A browser asks for an icon on every page load, so
 * a document that declares none produces a failed request on every page; declaring ours is what
 * keeps the console and network log clean.
 *
 * No stylesheet or script is linked yet. The design system and the entry point do not exist in the
 * foundation build, and linking a file that is not there would be a failed request — which the
 * verification standard counts as a failure.
 *
 * @param {{ title: string, description: string, body: string }} page
 * @returns {string}
 */
export function renderDocument({ title, description, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
</head>
<body>
<main id="main">
${body.trim()}
</main>
</body>
</html>
`;
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
 * @returns {Promise<{ routes: string[], copied: string[], distDir: string }>}
 */
export async function build() {
  if (distDir === projectRoot || distDir === sourceDir) {
    throw new Error(`Refusing to build into ${distDir}: that is not a build directory.`);
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const copied = await copyStaticDirectories();
  const built = [];

  for (const route of routes) {
    const body = await readTemplate(route);
    const file = outputFileForPath(route.path);

    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, renderDocument({ ...route, body }), "utf8");
    built.push(route.path);
  }

  const notFound = renderDocument({ ...NOT_FOUND_PAGE, body: await readTemplate(NOT_FOUND_PAGE) });
  await writeFile(path.join(distDir, NOT_FOUND_FILE), notFound, "utf8");

  return { routes: built, copied, distDir };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const { routes: built, copied, distDir: output } = await build();
  const where = path.relative(process.cwd(), output) || ".";

  console.log(
    `Built ${built.length} ${built.length === 1 ? "route" : "routes"} and the not-found page into ${where}/`,
  );

  for (const name of copied) {
    console.log(`Copied ${name}/ into ${where}/${name}/`);
  }
}
