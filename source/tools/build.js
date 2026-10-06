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
import { attributes, escapeHtml } from "../scripts/lib/html.js";
import { aboutPageValues } from "../scripts/pages/about.js";
import { contactPageValues } from "../scripts/pages/contact.js";
import { downloadsPageValues } from "../scripts/pages/downloads.js";
import { elementPageValues } from "../scripts/pages/element-detail.js";
import { elementsIndexPageValues } from "../scripts/pages/elements-index.js";
import { glossaryIndexValues } from "../scripts/pages/glossary.js";
import { glossaryTermValues } from "../scripts/pages/glossary-term.js";
import { groupIndexValues, groupValues } from "../scripts/pages/group.js";
import { configurationPageValues } from "../scripts/pages/orbital-configuration.js";
import { rankingPageValues } from "../scripts/pages/ranking.js";
import { tableViewPageValues } from "../scripts/pages/table-views.js";
import { calculatorPageValues } from "../scripts/pages/temperature-calculator.js";
import { footerColumns, isCurrent, primaryNavigation, submenuForSection } from "../scripts/router/navigation.js";
import { allRoutes, routes, templatePathFor } from "../scripts/router/routes.js";
import { buildContext } from "./build-context.js";
import { fillTemplate } from "./render-template.js";
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
 * The renderers of the generated page families, keyed by the template they fill.
 *
 * An authored page is its template; a family is a template plus a module that computes the blocks
 * the template asks for. The key is the template's own name, so a route says which family it
 * belongs to by naming a template, and this table says who renders that family. A family whose
 * name is missing here renders as its raw template — which is why
 * `tests/tools/render-template.test.js` holds the table, the templates and the modules to each
 * other.
 *
 * The two rankings share one renderer because they are one page about two fields: the route
 * carries the field it ranks, so a second row here is a second ranking page. The four table views
 * share theirs for the same reason — one table, four questions — and the renderer takes the view's
 * mode from the template it is filling. The eleven group pages share theirs for the last reason
 * again: the route carries the category, so the twelfth row is a group page rather than a
 * different page about groups.
 *
 * The glossary gets two rows rather than one because it is two pages in one arrangement: an index
 * that holds every term and a page for one of them. The 418 term pages share the second row for the
 * reason the 118 element pages share theirs — the route carries the record, and nothing else about
 * them differs.
 */
const FAMILY_RENDERERS = {
  "element-detail": elementPageValues,
  "elements-index": elementsIndexPageValues,
  "melting-point": rankingPageValues,
  "boiling-point": rankingPageValues,
  "orbital-configuration": configurationPageValues,
  "properties-and-states": tableViewPageValues,
  orbitals: tableViewPageValues,
  electronegativity: tableViewPageValues,
  evolution: tableViewPageValues,
  group: groupValues,
  "element-groups-index": groupIndexValues,
  "glossary-index": glossaryIndexValues,
  "glossary-term": glossaryTermValues,
  "temperature-calculator": calculatorPageValues,
  downloads: downloadsPageValues,
  about: aboutPageValues,
  contact: contactPageValues,
};

/**
 * The body of a route: its template, filled when a family renderer claims it.
 *
 * @param {object} route
 * @param {{ elements: object[], categories: object[], units: object, glossary: object }} context
 * @returns {Promise<string>}
 */
async function bodyFor(route, context) {
  const template = await readTemplate(route);
  const renderer = FAMILY_RENDERERS[route.template];

  if (!renderer) {
    return template;
  }

  const values = renderer({
    route,
    element: route.element,
    category: route.category,
    elements: context.elements,
    categories: context.categories,
    units: context.units,
    glossary: context.glossary,
  });

  return fillTemplate(template, values, { name: templatePathFor(route) });
}

/**
 * Wrap authored markup in the document skeleton every page shares.
 *
 * The favicon is the one asset linked from here on its own account. A browser asks for an icon on
 * every page load, so a document that declares none produces a failed request on every page;
 * declaring ours is what keeps the console and network log clean.
 *
 * The body carries the name of the page's template as `data-page`, and every document links the
 * one site-wide behaviour module. Both exist for the router: a client-side navigation replaces the
 * body, and the module that survives it needs to know which page's behaviour to run — one lookup by
 * name rather than a second set of rules about which URL means which page.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   body: string,
 *   page?: string,
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
  page = "",
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
<body${attributes({ "data-page": page })}>
<a class="skip-link" href="#main">Skip to content</a>
${header}
${submenu}
<main id="main">
${body.trim()}
</main>
${footer}
<script type="module" src="/scripts/app.js"></script>
</body>
</html>
`;
}

/**
 * The stylesheets a page links: the global layer, the shell, the component sheets the route
 * declares, and the page's own file — each only if it exists.
 *
 * The route's `styles` list is what keeps a page that uses the periodic table from linking the
 * shell's sheets and nothing else. Without a bundler there is nothing to discover a component's
 * stylesheet, so the page says which ones it uses and this function puts them in cascade order,
 * with the page's own sheet last so it can override them.
 *
 * @param {{ template: string, styles?: string[] }} page
 * @returns {string[]} URLs, in cascade order
 */
export function stylesheetsFor(page) {
  const candidates = [
    ...GLOBAL_STYLESHEETS,
    ...SHELL_STYLESHEETS,
    ...(page.styles ?? []),
    `styles/pages/${page.template}.css`,
  ];

  return candidates
    .filter((relative) => existsSync(path.join(sourceDir, relative)))
    .map((relative) => `/${relative}`);
}

/**
 * The chrome for a page: the masthead, the contextual submenu band, and the footer.
 *
 * The navigation is taken from the whole manifest, generated routes included, because the one rule
 * that decides membership is a route declaring a `nav` label — and a family that never declares one
 * simply never appears.
 *
 * @param {{ section?: string }} page
 * @param {string} currentPath
 * @param {object[]} [manifest] the routes the navigation is read from
 * @returns {{ header: string, submenu: string, footer: string }}
 */
export function shellFor(page, currentPath, manifest = routes) {
  return {
    header: siteHeader({ navigation: primaryNavigation(manifest), currentPath, isCurrent }),
    submenu: submenuBand({ submenu: submenuForSection(page.section), currentPath, isCurrent }),
    footer: siteFooter({ columns: footerColumns }),
  };
}

/**
 * The manifest the build renders: everything the site publishes, in one list.
 *
 * @param {{ elements: object[], categories: object[], glossary: object }} context
 * @returns {object[]}
 */
export function manifestFor(context) {
  return allRoutes(context.elements, context.categories, context.glossary.all());
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
  const context = await buildContext();
  const manifest = manifestFor(context);
  const built = [];
  const skipped = [];

  for (const route of manifest) {
    if (!isReady(route)) {
      skipped.push(route.path);
      continue;
    }

    const body = await bodyFor(route, context);
    const file = outputFileForPath(route.path);
    const document = renderDocument({
      ...route,
      body,
      page: route.template,
      stylesheets: stylesheetsFor(route),
      ...shellFor(route, route.path, manifest),
    });

    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, document, "utf8");
    built.push(route.path);
  }

  const notFound = renderDocument({
    ...NOT_FOUND_PAGE,
    body: await readTemplate(NOT_FOUND_PAGE),
    page: NOT_FOUND_PAGE.template,
    stylesheets: stylesheetsFor(NOT_FOUND_PAGE),
    ...shellFor(NOT_FOUND_PAGE, NOT_FOUND_PAGE.currentPath, manifest),
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
