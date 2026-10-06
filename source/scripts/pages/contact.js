/**
 * Contact.
 *
 * There is no form on this page, and that is the honest shape of the answer rather than a phase
 * still to come: the site is a static build with no server to post to, and a form that posted
 * nowhere would be a lie with a submit button. What the page can do is say what a useful correction
 * contains and where to send it, which is the whole of what a reader arrives here for.
 *
 * The address is the author's own, already on every commit in the project's history. It is written
 * here once, as data, so that changing it is a one-line change rather than a search.
 */

import { escapeHtml } from "../lib/html.js";

/** The page's lede, in our own words. */
export const CONTACT_LEDE =
  "ChemiPedia is a static site: there is no server behind it, no form to fill in, and nothing kept " +
  "about who reads it. Corrections are welcome all the same — a reference that cannot be corrected " +
  "is just a confident one — so here is what to send and where to send it.";

/** Where a correction goes. */
export const CONTACT_EMAIL = "dhbhensdadia@gmail.com";

/**
 * What makes a correction usable.
 *
 * Four things, in the order that saves the most work: which page, which value, what it should say,
 * and how the sender knows. A correction without the fourth is a claim, and the project's rule for
 * every value is that it is either measured by a named source or printed as unknown.
 */
export const REPORT_PARTS = [
  {
    name: "Which element or term",
    note: "Its name, or the address of the page you were reading — both are enough.",
  },
  {
    name: "Which value",
    note: "The field that looks wrong: a melting point, a density, a discovery year, a definition.",
  },
  {
    name: "What it should say",
    note: "The value you believe is right, written the way the page writes it, with its unit.",
  },
  {
    name: "Where that comes from",
    note:
      "A source — a textbook, a paper, a dataset. The site's own rule is that a value is either " +
      "measured by a named source or printed as Unknown, so an unsourced correction has nowhere " +
      "to go.",
  },
];

/**
 * The three things a reader might be writing about, and where each one belongs.
 *
 * Two of them are not ours to fix. Saying so is more use than a form, because it sends the reader
 * to the place that can actually change the number.
 */
export const WHERE_IT_GOES = [
  {
    name: "A number in the element data",
    note:
      "Send it here, and mention the source. If the correction belongs upstream as well, PubChem " +
      "and Wikidata both accept reports — the about page names both datasets.",
    link: { href: "/about/#data-sources", label: "The datasets behind the data" },
  },
  {
    name: "A definition or an explainer",
    note: "That prose is written for this site, so it comes here, and unclear wording is as much a correction as a wrong number.",
  },
  {
    name: "A page that does not work",
    note: "The address you were on, and what happened. A browser and a screen size help but are rarely the cause.",
  },
];

/**
 * A paragraph, or a link out to the page that has more to say.
 *
 * @returns {string}
 */
function partsBlock() {
  return `<ol class="con-parts">
${REPORT_PARTS.map(
  (part) =>
    `  <li class="con-part">
    <h3 class="con-part__name">${escapeHtml(part.name)}</h3>
    <p class="con-part__note">${escapeHtml(part.note)}</p>
  </li>`,
).join("\n")}
</ol>`;
}

/**
 * @returns {string}
 */
function goesBlock() {
  return `<div class="con-where">
${WHERE_IT_GOES.map(
  (entry) => `  <div class="con-goes">
    <h3 class="con-goes__name">${escapeHtml(entry.name)}</h3>
    <p class="con-goes__note">${escapeHtml(entry.note)}${
      entry.link
        ? ` <a class="con-goes__link" href="${escapeHtml(entry.link.href)}">${escapeHtml(entry.link.label)}</a>`
        : ""
    }</p>
  </div>`,
).join("\n")}
</div>`;
}

/**
 * Every block the contact template asks for, in the order the page reads them.
 *
 * @returns {{ lede: string, parts: string, where: string, address: string }}
 */
export function contactPageValues() {
  return {
    lede: CONTACT_LEDE,
    parts: partsBlock(),
    where: goesBlock(),
    address: `<a class="con-address__link" href="mailto:${escapeHtml(CONTACT_EMAIL)}">${escapeHtml(CONTACT_EMAIL)}</a>`,
  };
}
