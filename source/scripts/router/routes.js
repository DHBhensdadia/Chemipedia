/**
 * The route manifest.
 *
 * Every URL this site publishes is declared here. Nothing discovers routes by walking the file
 * system: the build renders this list and nothing else, so the manifest is the single place that
 * answers "which pages exist?". That matters most for the generated families — all 118 element
 * pages, all 418 glossary terms — where an explicit list turns "every element page was built" into
 * an assertion a test can make rather than a hope.
 *
 * The manifest holds plain data, not functions, so the same list can be read by the Node build, by
 * the test suite and by the browser router without any of them depending on the others.
 *
 * The list declares the whole static inventory, which is more than is built. That is deliberate:
 * the addresses and the metadata are part of the design, the shell links them, and the build
 * renders the ones whose template exists and reports the rest. Nothing needs editing when a later
 * phase adds a page — its template appears, and the page starts being rendered.
 *
 * Fields
 *   path         The published URL. Always begins with `/`, and is either the bare root or ends
 *                with `/`: the site serves directory-style URLs, so `/elements/hydrogen/` is
 *                canonical and `/elements/hydrogen` redirects to it.
 *   template     The name of the authored template in `source/pages/`, without its extension.
 *   title        The document title, written by us.
 *   description  The meta description, written by us.
 *   nav          Optional. The label and order this route takes in the primary navigation.
 *   section      Optional. Which contextual submenu the page carries, if any. The submenus
 *                themselves live in `navigation.js`, because they are an arrangement rather than a
 *                set of URLs.
 *
 * A page family shares one template when the difference between its pages is data — the 118
 * element pages are one template, and so are the eleven group pages. Where the difference is
 * written copy, each page has its own template; the four table views share a component rather than
 * a file.
 *
 * The generated families — element detail pages, group pages and glossary terms — are appended by
 * the phases that introduce their data, each route carrying the values its template needs.
 */

export const routes = [
  {
    path: "/",
    template: "home",
    title: "ChemiPedia — an interactive periodic table",
    description:
      "An interactive periodic table of all 118 elements, with element properties, group " +
      "overviews and a chemistry glossary.",
    nav: { label: "Periodic Table", order: 1 },
    section: "periodic-table",
  },
  {
    path: "/elements/",
    template: "elements-index",
    title: "Elements — all 118, in order of atomic number",
    description:
      "Every element in the periodic table, ordered by atomic number, with its symbol, group, " +
      "atomic weight and state at room temperature.",
    nav: { label: "Elements", order: 2 },
    section: "elements",
  },
  {
    path: "/periodic-table/properties-and-states/",
    template: "properties-and-states",
    title: "Properties and states of the elements",
    description:
      "The periodic table coloured by state at room temperature, with the counts of solids, " +
      "liquids and gases and the elements that change state near it.",
    section: "table-views",
  },
  {
    path: "/periodic-table/orbitals/",
    template: "orbitals",
    title: "Orbitals and electron configurations",
    description:
      "The periodic table coloured by orbital block, showing how the s, p, d and f blocks give " +
      "the table its shape.",
    section: "table-views",
  },
  {
    path: "/periodic-table/electronegativity/",
    template: "electronegativity",
    title: "Electronegativity across the periodic table",
    description:
      "The periodic table coloured by electronegativity, from fluorine to caesium, with the " +
      "trend across periods and down groups explained.",
    section: "table-views",
  },
  {
    path: "/periodic-table/evolution/",
    template: "evolution",
    title: "The evolution of the periodic table",
    description:
      "How the periodic table took its present shape, from the first groupings of the elements " +
      "to the synthetic elements at the end of the last century.",
    section: "table-views",
  },
  {
    path: "/properties/melting-point/",
    template: "melting-point",
    title: "Melting points of the elements",
    description:
      "Every element ranked by melting point, from helium to tungsten, with the values that " +
      "make the extremes worth knowing.",
    section: "elements",
  },
  {
    path: "/properties/boiling-point/",
    template: "boiling-point",
    title: "Boiling points of the elements",
    description:
      "Every element ranked by boiling point, with the elements that are gases, the metals that " +
      "refuse to boil, and the values that need qualifying.",
    section: "elements",
  },
  {
    path: "/properties/orbital-configuration/",
    template: "orbital-configuration",
    title: "Orbital configurations of the elements",
    description:
      "The electron configuration of every element, grouped by block, with the notation " +
      "explained and the irregularities named.",
    section: "elements",
  },
  {
    path: "/downloads/",
    template: "downloads",
    title: "Periodic table downloads and printables",
    description:
      "Printable periodic tables and element cards, ready to print at A4 or Letter, with and " +
      "without the group colours.",
    section: "tools",
  },
  {
    path: "/calculators/temperature/",
    template: "temperature-calculator",
    title: "Temperature calculator",
    description:
      "Convert temperatures between Celsius, Fahrenheit and Kelvin, with the notable reference " +
      "points listed alongside.",
    nav: { label: "Calculators", order: 3 },
    section: "tools",
  },
  {
    path: "/glossary/",
    template: "glossary-index",
    title: "Chemistry glossary",
    description:
      "A glossary of the vocabulary of the periodic table and chemistry, from absolute zero to " +
      "the terms that only make sense once two elements sit next to each other.",
    nav: { label: "Glossary", order: 4 },
    section: "reference",
  },
  {
    path: "/element-groups/",
    template: "element-groups-index",
    title: "Element groups",
    description:
      "The eleven groups of the periodic table, from the alkali metals to the noble gases, and " +
      "what the elements in each one have in common.",
    section: "reference",
  },
  {
    path: "/about/",
    template: "about",
    title: "About ChemiPedia",
    description:
      "What ChemiPedia is, how it is built, where the element data comes from, and how to " +
      "reproduce it.",
    section: "about",
  },
  {
    path: "/contact/",
    template: "contact",
    title: "Contact ChemiPedia",
    description: "How to get in touch about ChemiPedia, including corrections to the data.",
    section: "about",
  },
];

/**
 * The authored template for a route, as a path relative to `source/`.
 *
 * The build reads this file and wraps its markup in the document skeleton; the build also uses it
 * to decide whether a declared route is ready to render; tests use it to prove the declaration is
 * well-formed.
 *
 * @param {{ template: string }} route
 * @returns {string}
 */
export function templatePathFor(route) {
  return `pages/${route.template}.html`;
}
