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
 *   ranking      Optional. The field a ranking page orders its elements by, and the direction —
 *                plain data, so a second ranking of another field is one line here and no code.
 *   section      Optional. Which contextual submenu the page carries, if any. The submenus
 *                themselves live in `navigation.js`, because they are an arrangement rather than a
 *                set of URLs.
 *   styles       Optional. The component stylesheets this page uses, beyond the global layer, the
 *                shell and the page's own file. Named rather than discovered, because the build
 *                has no bundler to find them with, and listed here so a page's dependencies sit
 *                beside its template instead of in a list inside the build.
 *
 * A page family shares one template when the difference between its pages is data — the 118
 * element pages are one template, and so are the eleven group pages. Where the difference is
 * written copy, each page has its own template; the four table views share a component rather than
 * a file.
 *
 * The generated families — element detail pages, group pages and glossary terms — are appended by
 * the phases that introduce their data, each route carrying the values its template needs.
 */

/**
 * The stylesheets every one of the four table views needs, in cascade order.
 *
 * The tile sheet draws a tile and the legend sheet draws a chip, but neither decides a colour: they
 * consume `--fill` and `--on-fill`, and the periodic table's sheet is the one map that turns an
 * element's key into that pair. A view of 118 tiles that did not declare it is a view of 118 grey
 * tiles — which is exactly what the elements index shipped before Phase 6's browser pass caught it.
 *
 * The four views are one arrangement rather than four, so the list is written once and the
 * evolution view appends the timeline's own sheet to it.
 */
const TABLE_VIEW_STYLES = [
  "styles/components/element-tile.css",
  "styles/components/legend-chips.css",
  "styles/components/periodic-table.css",
  "styles/pages/table-views.css",
];

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
    styles: [
      "styles/components/element-tile.css",
      "styles/components/legend-chips.css",
      "styles/components/periodic-table.css",
      "styles/components/element-search.css",
    ],
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
    // The periodic table's sheet carries the key-to-colour map every surface that shows a category
    // is painted by, so a page of cards names the same key the table does and gets the same colour.
    styles: ["styles/components/periodic-table.css", "styles/components/element-card.css"],
  },
  {
    path: "/periodic-table/properties-and-states/",
    template: "properties-and-states",
    title: "Properties and states of the elements",
    description:
      "The periodic table coloured by state at room temperature, with the counts of solids, " +
      "liquids and gases and the elements that change state near it.",
    section: "table-views",
    styles: TABLE_VIEW_STYLES,
  },
  {
    path: "/periodic-table/orbitals/",
    template: "orbitals",
    title: "Orbitals and electron configurations",
    description:
      "The periodic table coloured by orbital block, showing how the s, p, d and f blocks give " +
      "the table its shape.",
    section: "table-views",
    styles: TABLE_VIEW_STYLES,
  },
  {
    path: "/periodic-table/electronegativity/",
    template: "electronegativity",
    title: "Electronegativity across the periodic table",
    description:
      "The periodic table coloured by electronegativity, from francium at the weakest pull to " +
      "fluorine at the strongest, with the trend across periods and down groups explained.",
    section: "table-views",
    styles: TABLE_VIEW_STYLES,
  },
  {
    path: "/periodic-table/evolution/",
    template: "evolution",
    title: "The evolution of the periodic table",
    description:
      "How the periodic table took its present shape, from the metals worked before there was a " +
      "chemistry to name them to the synthetic elements made one atom at a time.",
    section: "table-views",
    styles: [...TABLE_VIEW_STYLES, "styles/components/era-timeline.css"],
  },
  {
    path: "/properties/melting-point/",
    template: "melting-point",
    title: "Melting points of the elements",
    description:
      "Every element ranked by melting point, from helium at the bottom of the scale to carbon " +
      "at the top, with the values that make the extremes worth knowing.",
    section: "elements",
    ranking: { field: "meltingPoint", direction: "ascending" },
    styles: [
      "styles/components/periodic-table.css",
      "styles/components/bar-ranking.css",
      "styles/pages/ranking.css",
    ],
  },
  {
    path: "/properties/boiling-point/",
    template: "boiling-point",
    title: "Boiling points of the elements",
    description:
      "Every element ranked by boiling point, with the elements that are gases, the metals that " +
      "refuse to boil, and the values that need qualifying.",
    section: "elements",
    ranking: { field: "boilingPoint", direction: "ascending" },
    styles: [
      "styles/components/periodic-table.css",
      "styles/components/bar-ranking.css",
      "styles/pages/ranking.css",
    ],
  },
  {
    path: "/properties/orbital-configuration/",
    template: "orbital-configuration",
    title: "Orbital configurations of the elements",
    description:
      "The electron configuration of every element, grouped by block, with the notation " +
      "explained and the irregularities named.",
    section: "elements",
    styles: ["styles/components/periodic-table.css"],
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
    nav: { label: "Calculators", order: 4 },
    section: "tools",
  },
  {
    path: "/glossary/",
    template: "glossary-index",
    title: "Chemistry glossary",
    description:
      "A glossary of the vocabulary of the periodic table and chemistry, from absolute zero to " +
      "the terms that only make sense once two elements sit next to each other.",
    nav: { label: "Glossary", order: 3 },
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

/**
 * The element detail family: one route per element record.
 *
 * A hundred and eighteen pages, and not one of them is authored. Each route carries the record it
 * is about, so the build has everything it needs to fill the family's template without looking
 * anything up a second time: the URL, the title, the description and the data all come from the
 * same place, which is the record.
 *
 * The path is the element's own slug, not its atomic number or its symbol. A reader who has the
 * element's name has the URL, and a renamed element — aluminium, caesium, sulfur — keeps a slug
 * that a person would spell rather than one a formula would.
 *
 * @param {object[]} elements every element record, as `elements.json` holds them
 * @returns {object[]}
 */
export function elementRoutes(elements) {
  return elements.map((element) => ({
    path: `/elements/${element.slug}/`,
    template: "element-detail",
    title: `${element.name} (${element.symbol}) — atomic number ${element.atomicNumber}`,
    description: element.summary,
    styles: [
      "styles/components/element-tile.css",
      "styles/components/periodic-table.css",
      "styles/components/property-list.css",
      "styles/components/shell-diagram.css",
      "styles/components/faq-block.css",
    ],
    element,
  }));
}

/**
 * Everything the site publishes: the authored routes and the generated families.
 *
 * One function rather than a spread at each call site, because the build and the tests must agree
 * about what the site contains, and two spreads in two files is how they come to disagree.
 *
 * @param {object[]} elements
 * @returns {object[]}
 */
export function allRoutes(elements) {
  return [...routes, ...elementRoutes(elements)];
}
