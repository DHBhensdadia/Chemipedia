/**
 * The document: how a page of `body` markup becomes an HTML file, and the two files a crawler reads.
 *
 * This is the half of the build that knows about the outside world — the `<head>`, the metadata a
 * crawler indexes, and the address a page claims. It was split out of `build.js` when the home
 * page's build-time rendering pushed that file past the project's 400-line limit, and the seam it
 * was split along is the natural one: `build.js` answers *what is on the site* (routes, templates,
 * families, files), this answers *what a document looks like*.
 *
 * The favicon is the one asset linked from here on its own account. A browser asks for an icon on
 * every page load, so a document that declares none produces a failed request on every page;
 * declaring ours is what keeps the console and network log clean.
 *
 * The body carries the name of the page's template as `data-page`, and every document links the one
 * site-wide behaviour module. Both exist for the router: a client-side navigation replaces the body,
 * and the module that survives it needs to know which page's behaviour to run — one lookup by name
 * rather than a second set of rules about which URL means which page.
 *
 * The sitemap is written from the routes the build actually wrote rather than from the manifest,
 * because the manifest declares the whole inventory including routes still waiting on a template,
 * and a sitemap that lists a page the site does not serve is a sitemap that lies to a crawler. The
 * not-found document is in neither file for the same reason it has no canonical link.
 */

import { escapeHtml } from "../scripts/lib/html.js";
import { attributes } from "../scripts/lib/html.js";
import { absoluteUrl } from "./site-origin.js";
import { structuredDataScript } from "./structured-data.js";

/**
 * Wrap authored markup in the document skeleton every page shares.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   body: string,
 *   path?: string,
 *   element?: object,
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
  path: publishedPath = "",
  element,
  page = "",
  stylesheets = [],
  header = "",
  submenu = "",
  footer = "",
}) {
  const links = stylesheets
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("\n");
  // The not-found document is not a published address, so it claims none: a canonical link to a URL
  // that 404s by design is exactly the thing canonical is meant to prevent. Every other document
  // says where it lives, what it is, and — for an element page — the record it is about.
  const provenance =
    publishedPath === ""
      ? ""
      : `
<link rel="canonical" href="${escapeHtml(absoluteUrl(publishedPath))}">
<meta property="og:site_name" content="ChemiPedia">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(absoluteUrl(publishedPath))}">
<meta name="twitter:card" content="summary">
${structuredDataScript({ path: publishedPath, title, description, element })}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">${provenance}
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
 * The sitemap: every address the build actually wrote, in the manifest's order.
 *
 * @param {string[]} paths the routes that were built
 * @returns {string}
 */
export function sitemapFor(paths) {
  const urls = paths
    .map((published) => `  <url>\n    <loc>${escapeHtml(absoluteUrl(published))}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * The crawler instructions: everything is public, and here is where the sitemap is.
 *
 * @returns {string}
 */
export function robotsFor() {
  return `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`;
}
