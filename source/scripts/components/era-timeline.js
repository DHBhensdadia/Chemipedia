/**
 * The evolution view's timeline: one card per era, with the elements it holds.
 *
 * The table above it answers "when was each element found?" tile by tile. This answers "what
 * happened in each stretch of that time, and which elements arrived in it?" as a list a reader can
 * follow from top to bottom, which is the other half of the page's question — the plan asked for a
 * timeline beside the narrative, and a narrative with nothing to point at is a paragraph.
 *
 * The grouping is not this file's to decide. It arrives from `lib/discovery`, the same module the
 * table's tiles are keyed by, so a card's count and the legend chip of the same name are two
 * readings of one fact rather than two counts that could drift apart.
 *
 * A card carries four things: the era, the years its members actually span, a sentence of our own
 * about it, and the members themselves. The span is derived from the members — `1735–1798`, not the
 * frame the century names — and a chip's year is the record's own, so an era card cannot claim a
 * date the data does not hold.
 *
 * The chip is painted the way every other chip on the site is: it carries the era as `data-key` and
 * the discovery mode's slice of `periodic-table.css` turns that key into `--fill` and `--on-fill`.
 * Nothing here names a colour.
 */

import { eraSpan, yearOf } from "../lib/discovery.js";
import { formatNumber } from "../lib/format.js";
import { attributes, escapeHtml } from "../lib/html.js";

/** What a card says instead of a year when its members have none. */
export const UNRECORDED = "no recorded year";

/**
 * The line under an era's heading: the years it spans, then how many elements are in it.
 *
 * @param {{ elements: object[], span?: { from: number, to: number } | null }} options
 * @returns {string}
 */
export function eraRangeLine({ elements, span = eraSpan(elements) }) {
  const count = `${elements.length} ${elements.length === 1 ? "element" : "elements"}`;
  const years = span
    ? span.from === span.to
      ? formatNumber(span.from, { decimals: 0 })
      : `${formatNumber(span.from, { decimals: 0 })}\u2013${formatNumber(span.to, { decimals: 0 })}`
    : UNRECORDED;

  return `${years} · ${count}`;
}

/**
 * One member of an era: its symbol in the era's colour, and the year it was recorded in.
 *
 * A record with no year keeps its chip and says nothing about a date rather than printing a zero —
 * the same rule the rest of the site follows for a value it does not have. The link's own name
 * carries both facts, so the two letters the reader sees are decoration.
 *
 * @param {object} element
 * @param {string} eraKey
 * @returns {string}
 */
export function eraElementChip(element, eraKey) {
  const year = yearOf(element);
  const when = year === null ? UNRECORDED : `discovered in ${formatNumber(year, { decimals: 0 })}`;
  const shown = year === null ? "" : `\n<span class="era__year">${escapeHtml(formatNumber(year, { decimals: 0 }))}</span>`;

  return `<li><a${attributes({
    class: "era__element",
    href: `/elements/${element.slug}/`,
    "data-key": eraKey,
    "aria-label": `${element.name}, ${when}`,
  })}><span class="era__sym" aria-hidden="true">${escapeHtml(element.symbol)}</span>${shown}</a></li>`;
}

/**
 * One era: its heading, its span, our sentence about it, and its members.
 *
 * @param {{ era: { key: string, label: string }, elements: object[], blurb: string }} options
 * @returns {string}
 */
export function eraCard({ era, elements, blurb }) {
  return `<li class="era">
<h3 class="era__title">${escapeHtml(era.label)}</h3>
<p class="era__range">${escapeHtml(eraRangeLine({ elements }))}</p>
<p class="era__note">${escapeHtml(blurb)}</p>
<ul class="era__elements">
${elements.map((element) => eraElementChip(element, era.key)).join("\n")}
</ul>
</li>`;
}

/**
 * The whole timeline, in the order the eras were given in.
 *
 * An era nothing falls in gets no card: a heading, a count of none and a sentence about it is three
 * lines telling a reader nothing, which is the same judgement the legend makes when it leaves out a
 * key with no elements behind it.
 *
 * @param {{ groups: { key: string, label: string, elements: object[] }[], blurbs?: Record<string, string> }} options
 * @returns {string}
 * @throws {TypeError} when an era with members has no sentence of its own
 */
export function eraTimeline({ groups, blurbs = {} }) {
  const cards = groups
    .filter((group) => group.elements.length > 0)
    .map((group) => {
      const blurb = blurbs[group.key];

      if (typeof blurb !== "string" || blurb === "") {
        throw new TypeError(`The ${group.key} era has members but no sentence describing them`);
      }

      return eraCard({ era: group, elements: group.elements, blurb });
    });

  if (cards.length === 0) {
    return "";
  }

  return `<ol class="eras" data-mode="discovery">
${cards.join("\n")}
</ol>`;
}
