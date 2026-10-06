/**
 * Downloads and printables.
 *
 * The reference's downloads page is four links into a section of printable images, a fifth of the
 * site this project leaves out of scope; every one of its targets is another page of its own site
 * and none of them is a file. So this page is not a copy of anything. It answers the question the
 * family was kept for: what can I put on paper, and where is it?
 *
 * The answer is three things, and only one of them is a download in the sense of a file. The other
 * two are pages of this site that have been taught to print: the table, which prints as one sheet,
 * and an element, which prints as a card. That is deliberate rather than cheaper — the plan asks
 * for both to print "from the stylesheet rules introduced here and shared with Phase 11, rather
 * than from a separate rendering path" — so there is no second rendering of the table to fall out
 * of step with the first, and the sheet a reader prints is the page they were already reading.
 *
 * Every target is written down once, here, and `tests/pages/downloads.test.js` holds each one to
 * the built output: a route must be in the manifest and a file must exist on disk, so this page
 * cannot offer a download the build does not produce.
 */

import { attributes, escapeHtml } from "../lib/html.js";

/** The page's lede, in our own words. */
export const DOWNLOADS_LEDE =
  "The periodic table and the element pages are built to be printed as well as read: the table " +
  "fits one sheet, and an element prints as a card. The records the site is built from are here " +
  "too, as a file.";

/**
 * What the page offers.
 *
 * `kind` is what the target is rather than how it is written: a route is a page of this site the
 * reader prints from their browser, and a file is something the browser can save. The test reads
 * it to know which of the two checks applies.
 */
export const DOWNLOAD_TARGETS = [
  {
    kind: "route",
    name: "The periodic table",
    href: "/",
    action: "Open the table",
    note:
      "All 118 elements, every group in its own colour, on one sheet of A4 or Letter. The table " +
      "prints sideways, and the rules turn the rest of the page off for you.",
  },
  {
    kind: "route",
    name: "Element cards",
    href: "/elements/",
    action: "Browse the elements",
    note:
      "Print any element's page and you get a card: its symbol, its summary, its properties and " +
      "its electron shells, with the article left behind.",
  },
  {
    kind: "file",
    name: "The data",
    href: "/data/elements.json",
    action: "Save the element data",
    download: true,
    note:
      "Every record the site is built from, as JSON. The element facts come from PubChem and " +
      "Wikidata, public domain and CC0 — the about page names both.",
    link: { href: "/about/#data-sources", label: "Where the data comes from" },
  },
];

/**
 * How to get a good sheet out of a browser.
 *
 * These are written as instructions rather than as advice because printing from the web is full of
 * small decisions a reader should not have to make: which orientation, whether the colours are
 * printed, and whether the browser is about to tile the table across four pages at its own scale.
 */
export const PRINT_STEPS = [
  {
    name: "Open the page you want",
    note: "The table, or any element's page. The sheet is made by the page's own stylesheet.",
  },
  {
    name: "Choose Print",
    note: "Ctrl + P, or Cmd + P on a Mac. There is nothing to render first.",
  },
  {
    name: "Keep the colours on",
    note:
      "Printers leave backgrounds off by default. The table's stylesheet asks for them, but the " +
      "browser needs \"Background graphics\" switched on for the group colours to reach the paper.",
  },
  {
    name: "Print at 100%",
    note:
      "\"Actual size\" or 100% keeps the table on one sheet. A scale below about 80% makes the " +
      "symbols too small to read, and \"Fit to page\" can shrink the sheet away.",
  },
];

/**
 * One card of the page: what it is, where to open it, and what the reader gets.
 *
 * @param {object} target
 * @returns {string}
 */
export function downloadCard(target) {
  const file = target.kind === "file";
  const link = `<a class="dl-card__action" href="${escapeHtml(target.href)}"${
    target.download ? attributes({ download: true }) : ""
  }>${escapeHtml(target.action)}</a>`;

  return `<article class="dl-card"${attributes({ "data-download-kind": target.kind })}>
  <h3 class="dl-card__name">${escapeHtml(target.name)}</h3>
  <p class="dl-card__note">${escapeHtml(target.note)}</p>
  <p class="dl-card__links">${link}${
    file
      ? ` <a class="dl-card__more" href="${escapeHtml(target.link.href)}">${escapeHtml(target.link.label)}</a>`
      : ""
  }</p>
</article>`;
}

/**
 * The four steps, as an ordered list: the order is the point of them.
 *
 * @returns {string}
 */
function stepsBlock() {
  return `<ol class="dl-steps">
${PRINT_STEPS.map(
  (step) =>
    `  <li class="dl-step">
    <h3 class="dl-step__name">${escapeHtml(step.name)}</h3>
    <p class="dl-step__note">${escapeHtml(step.note)}</p>
  </li>`,
).join("\n")}
</ol>`;
}

/**
 * Every block the downloads template asks for.
 *
 * @returns {{ lede: string, cards: string, steps: string }}
 */
export function downloadsPageValues() {
  return {
    lede: DOWNLOADS_LEDE,
    cards: DOWNLOAD_TARGETS.map(downloadCard).join("\n"),
    steps: stepsBlock(),
  };
}
