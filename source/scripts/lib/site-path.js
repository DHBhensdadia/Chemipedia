/**
 * Where the site is served from, and the one way a link written in the browser finds it again.
 *
 * Every path the build writes is a path from the site's own root — `/elements/hydrogen/` — and the
 * build rewrites those paths to wherever the site is actually published. That rewriting happens in
 * the HTML, so it reaches markup and nothing else. A link the browser writes *after* the page has
 * loaded would still point at the domain root, and a site published under a path — a project page
 * is served from a folder named after its repository — would send the reader somewhere that is not
 * the site. The search field's list of matches is the one such link the site has.
 *
 * So the browser works the answer out for itself, from this module's own address, which is the one
 * address guaranteed to be inside the site: two folders up from `scripts/lib/` is the site's root,
 * whatever path that root happens to be. At a domain root the answer is the empty string and every
 * path is written exactly as it always was.
 *
 * The rule is a function of a module's address rather than a constant read straight off this file,
 * so that it can be checked against the several places a site can be published from — where this
 * deployment lives is a fact, not a licence to have no test. And where there is no site to speak
 * of — in the build, a module is a file rather than an address — the base is empty, so markup
 * rendered by the build means the same thing it always did.
 */

/**
 * A module reached by address rather than by path.
 *
 * The build imports these modules from disk, and a file's path says nothing about where the site
 * will be served from: there, the base is empty and paths are left as the build writes them.
 */
const ADDRESSED = /^https?:$/;

/**
 * Where a site is served from, read off the address of a module inside it.
 *
 * @param {string} moduleHref the address of a module two folders below the site's root
 * @returns {string} the site's path with no trailing separator, or `""` at a domain root
 */
export function siteBaseOf(moduleHref) {
  let url;

  try {
    url = new URL(String(moduleHref));
  } catch {
    return "";
  }

  if (!ADDRESSED.test(url.protocol)) {
    return "";
  }

  return new URL("../../", url).pathname.replace(/\/+$/, "");
}

/** The site's path, as this module's own address gives it. Empty locally and at a domain root. */
export const SITE_BASE = siteBaseOf(import.meta.url);

/**
 * A path from the site's root, written for the site as it is being served.
 *
 * @param {string} path a path from the site's root, beginning with `/`
 * @param {string} [base] the site's path, injected so a deployment can be tested without one
 * @returns {string}
 * @throws {TypeError} when the path is not from the site's root, which is the mistake this exists
 *   to make impossible: a relative path would resolve against whatever page happened to write it
 */
export function sitePath(path, base = SITE_BASE) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new TypeError(`A path from the site's root starts with a separator: ${path}`);
  }

  return `${base}${path}`;
}
