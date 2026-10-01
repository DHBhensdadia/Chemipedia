/**
 * The route manifest.
 *
 * Every URL this site publishes is declared here. Nothing discovers routes by walking the file
 * system: the build renders this list and nothing else, so the manifest is the single place that
 * answers "which pages exist?". That matters most for the generated families — all 118 element
 * pages, all 418 glossary terms — where an explicit list turns "every element page was built" into
 * an assertion a test can make rather than a hope.
 *
 * The manifest holds plain data, not functions, so the same list can be read by the Node build,
 * by the test suite, and by the browser router without any of them depending on the others.
 *
 * Routes are added family by family as the phases that implement them land. The static pages use
 * literal paths; the generated families append entries derived from the data layer.
 *
 * Fields
 *   path         The published URL. Always begins with `/`, and is either the bare root or ends
 *                with `/`: the site serves directory-style URLs, so `/elements/hydrogen/` is
 *                canonical and `/elements/hydrogen` redirects to it.
 *   template     The name of the authored template in `source/pages/`, without its extension.
 *   title        The document title, written by us.
 *   description  The meta description, written by us.
 */

export const routes = [
  {
    path: "/",
    template: "home",
    title: "ChemiPedia — an interactive periodic table",
    description:
      "An interactive periodic table of all 118 elements, with element properties, group " +
      "overviews and a chemistry glossary.",
  },
];

/**
 * The authored template for a route, as a path relative to `source/`.
 *
 * The build reads this file and wraps its markup in the document skeleton; tests use it to prove
 * that every declared route has a template on disk.
 *
 * @param {{ template: string }} route
 * @returns {string}
 */
export function templatePathFor(route) {
  return `pages/${route.template}.html`;
}
