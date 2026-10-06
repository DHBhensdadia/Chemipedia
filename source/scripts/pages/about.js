/**
 * About ChemiPedia, and where every number on it came from.
 *
 * ADR-005 requires a page that lists each dataset and its licence, and this is it — the record is
 * `docs/DATA_SOURCES.md`, and the section here is its public face. The two must agree, so the
 * sources are written once as data and read by both the page and its test: a licence that changed
 * in one place and not the other would be a licence claim the site could not support.
 *
 * The rest of the page is the two questions an About page is actually asked: what is this, and how
 * was it made. Both answers are short because the honest answer to the second is short — a build
 * script and a browser, nothing else — and padding it would be the one thing this project has been
 * telling readers not to do.
 */

import { escapeHtml } from "../lib/html.js";

/** The page's lede, in our own words. */
export const ABOUT_LEDE =
  "ChemiPedia is a periodic table you can read: the 118 elements, the table in five arrangements, " +
  "the eleven groups, a glossary of 418 terms, and a calculator. Everything on it is written to be " +
  "understood, and a value the data does not have is printed as Unknown rather than guessed at.";

/**
 * Every dataset the site is built from, with the licence each one carries.
 *
 * The retrieval date and the transform script are part of the record rather than decoration: a
 * reader who wants to check a number needs to know which snapshot it came from and which script
 * turned it into the file this site ships.
 */
export const DATA_SOURCES = [
  {
    name: "PubChem Periodic Table (PUG REST)",
    publisher: "U.S. National Library of Medicine, National Center for Biotechnology Information",
    url: "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON",
    licence: "Public domain — a work of the U.S. government",
    covers:
      "The element facts: symbol, name, atomic number, atomic weight, melting and boiling point, " +
      "density, electron configuration, block, period and group.",
    transform: "source/tools/build-data.js",
    retrieved: "1 October 2026",
  },
  {
    name: "Wikidata",
    publisher: "Wikimedia Foundation",
    url: "https://query.wikidata.org/",
    licence: "CC0 1.0 Universal — a public-domain dedication with no conditions",
    covers:
      "The second tier of physical properties, which the PubChem table does not carry: heat of " +
      "fusion, specific heat, thermal conductivity, crystal system, discovery year, place and " +
      "discoverer. Where an element has no value, the field is empty rather than filled in.",
    transform: "source/tools/data-sources/wikidata.js",
    retrieved: "1 October 2026",
  },
];

/** What this site wrote itself, said once because it is the other half of the provenance. */
export const AUTHORED = {
  name: "Written for ChemiPedia",
  covers:
    "The 118 element summaries, their uses and sources, the 418 glossary definitions, the " +
    "eleven group explainers and every word of the pages around them. None of it is copied from " +
    "another site: the facts are shared, the sentences about them are ours.",
};

/**
 * The page, as sections. A section is a heading, its paragraphs, and optionally the source table —
 * built here rather than in the template so that the record and the page are one list.
 */
export const ABOUT_SECTIONS = [
  {
    id: "what",
    title: "What ChemiPedia is",
    paragraphs: [
      "It is a reference to the periodic table, of the kind a reader arrives at with a question " +
        "about one element and leaves with the answer. Each element has a page of its own: what it " +
        "is, what it is used for, where it was discovered, and about thirty measured properties, " +
        "with the ones the data does not have marked as unknown.",
      "The table can be read five ways — by group and period, by state, by orbital block, by " +
        "electronegativity, and by the century each element was discovered in — and the eleven " +
        "groups of the table have pages of their own. The glossary defines the vocabulary the rest " +
        "of the site assumes, from absolute zero to the terms that only make sense once two " +
        "elements sit next to each other.",
    ],
  },
  {
    id: "how",
    title: "How it is built",
    paragraphs: [
      "It is a static site: plain HTML, CSS and JavaScript modules, with no framework and nothing " +
        "installed at runtime. A small Node build reads the data files, renders every page to HTML " +
        "and writes the site out, which means a page is a page before any script runs — to a " +
        "crawler, to a reader on a slow connection, and to anyone who has turned JavaScript off. " +
        "The script is what adds: the table's keyboard navigation, the filters, the calculator.",
      "It is built this way deliberately. There is no package to go stale, no build step whose " +
        "version has to be guessed in a year, and every line that reaches a browser is readable. " +
        "The cost is that the conveniences a framework gives away — routing, templating, reactivity " +
        "— are written out here, and tested: the repository holds more test than page.",
    ],
  },
  {
    id: "data-sources",
    title: "Data sources",
    paragraphs: [
      "The element data comes from two openly licensed datasets, transformed by committed scripts " +
        "so that the files the site ships can be rebuilt from their sources. Facts are not " +
        "copyrightable — a melting point belongs to nobody — but the work of collecting them does, " +
        "so both are named here with the licence each one carries.",
      "Two sources rather than one because no single openly licensed dataset supplies the whole " +
        "schema: PubChem's table covers the periodic facts, and Wikidata fills in the thermal and " +
        "atomic-scale properties. Every record says which source produced which field.",
    ],
  },
  {
    id: "reuse",
    title: "Reusing the data",
    paragraphs: [
      "The two files the site is built from are published with it, and they can be taken and used " +
        "under the terms their sources carry: the element records under the public-domain and CC0 " +
        "terms above, and the glossary under the same conditions as the prose.",
      "If a number here disagrees with a source, the source is right and this site is wrong: " +
        "every value is a snapshot of the datasets named above, retrieved on the dates given.",
    ],
  },
];

/**
 * One source, as a row of the table.
 *
 * @param {object} source
 * @returns {string}
 */
function sourceRow(source) {
  return `<div class="abt-source">
  <p class="abt-source__name"><a class="abt-source__link" href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a></p>
  <p class="abt-source__part">${escapeHtml(source.publisher)}</p>
  <dl class="abt-source__facts">
    <dt class="abt-source__k">Licence</dt>
    <dd class="abt-source__v">${escapeHtml(source.licence)}</dd>
    <dt class="abt-source__k">Covers</dt>
    <dd class="abt-source__v">${escapeHtml(source.covers)}</dd>
    <dt class="abt-source__k">Transform</dt>
    <dd class="abt-source__v"><code class="abt-source__code">${escapeHtml(source.transform)}</code></dd>
    <dt class="abt-source__k">Retrieved</dt>
    <dd class="abt-source__v">${escapeHtml(source.retrieved)}</dd>
  </dl>
</div>`;
}

/**
 * The provenance table: the two datasets and the prose this site wrote itself.
 *
 * @returns {string}
 */
export function sourceTable() {
  return `<div class="abt-sources">
${DATA_SOURCES.map(sourceRow).join("\n")}
  <div class="abt-source">
    <p class="abt-source__name">${escapeHtml(AUTHORED.name)}</p>
    <p class="abt-source__covers">${escapeHtml(AUTHORED.covers)}</p>
  </div>
</div>`;
}

/**
 * The sections as markup: the heading, the paragraphs, and the table under the one section that
 * holds the record.
 *
 * @returns {string}
 */
function sectionsBlock() {
  return ABOUT_SECTIONS.map(
    (section) => `<section class="abt-section" id="${escapeHtml(section.id)}">
  <h2 class="abt-section__title">${escapeHtml(section.title)}</h2>
${section.paragraphs.map((text) => `  <p class="abt-section__text">${escapeHtml(text)}</p>`).join("\n")}
${section.id === "data-sources" ? `  ${sourceTable()}\n` : ""}</section>`,
  ).join("\n");
}

/**
 * Every block the about template asks for.
 *
 * @returns {{ lede: string, sections: string }}
 */
export function aboutPageValues() {
  return {
    lede: ABOUT_LEDE,
    sections: sectionsBlock(),
  };
}
