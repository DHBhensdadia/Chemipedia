/**
 * The site's origin — the one place its absolute address is written.
 *
 * Three things need it and none of them can be relative: a canonical link, an Open Graph URL, and
 * the sitemap. Until the site is deployed there is no origin to write, and inventing one would put
 * a confident, wrong address in every page's head. So the default is a reserved `.example` address
 * that cannot resolve, the build says so on every run, and deployment sets `SITE_ORIGIN` once.
 *
 * The value is read at build time from the environment rather than kept in a data file: it is a
 * property of the deployment, not of the site's content, and a `SITE_ORIGIN=… node source/tools/build.js`
 * is one variable to set in a deploy script rather than one file to remember to edit.
 */

/** Reserved by RFC 2606 for exactly this purpose: documentation, never resolvable. */
export const PLACEHOLDER_ORIGIN = "https://chemipedia.example";

/** The origin this build publishes to, without a trailing slash. */
export const siteOrigin = (process.env.SITE_ORIGIN ?? PLACEHOLDER_ORIGIN).replace(/\/+$/, "");

/** Whether the build is still using the placeholder, which is worth saying out loud. */
export const isPlaceholderOrigin = siteOrigin === PLACEHOLDER_ORIGIN;

/**
 * The path the site is published under, where it is not published at the domain root.
 *
 * A project site is served from a path named after its repository — `https://<owner>.github.io/<repo>/`
 * — so an address written from the site's own root, `/elements/hydrogen/`, would leave that path and
 * 404. The deployment states where it lives once, in `SITE_ORIGIN`, and this is the path of that
 * address: `/Chemipedia` for the repository above, and empty at a root deployment or in a local
 * build. One value, so the addresses a document writes and the address it claims cannot drift.
 *
 * An origin that is not a URL yields no path rather than an exception: a canonical link built from
 * one is already wrong, and a build should say so rather than fail to start.
 */
export const siteBase = pathOf(siteOrigin);

/**
 * @param {string} origin
 * @returns {string} the origin's path, with no trailing slash
 */
function pathOf(origin) {
  try {
    return new URL(origin).pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

/**
 * A site path as the absolute URL the metadata needs.
 *
 * @param {string} pathname a published path, with a leading slash
 * @returns {string}
 */
export function absoluteUrl(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    throw new TypeError(`A published path starts with a slash: received ${typeof pathname}`);
  }

  return pathname === "/" ? `${siteOrigin}/` : `${siteOrigin}${pathname}`;
}
