/**
 * The footer.
 *
 * Five columns of links, a restatement of the wordmark, a line saying what the site is, and the
 * copyright. The columns are re-cut for a site without the design reference's learning and games
 * sections: two of its columns had no subject matter left, so ours hold fewer entries rather than
 * being padded out, and no column is empty or stubbed.
 *
 * The note is where the site states its provenance, because it is the one piece of writing that
 * appears on every page.
 *
 * Column headings are real headings, so the footer is navigable by heading as well as by landmark,
 * and the column list is a list of links.
 */

import { attributes, escapeHtml } from "../lib/html.js";
import { wordmark } from "./wordmark.js";

const NOTE =
  "Element facts come from an openly licensed dataset, transformed by a script in this " +
  "repository. The explanations are written for this site.";

const TAGLINE = "Every element, the table that arranges them, and the words for what they do.";

/**
 * @param {{ columns: { id: string, heading: string, entries: { label: string, path: string }[] }[], year?: number }} options
 * @returns {string}
 */
export function siteFooter({ columns, year = new Date().getFullYear() }) {
  const rendered = columns
    .map((column) => {
      const entries = column.entries
        .map(
          (entry) =>
            `<li><a${attributes({ href: entry.path })}>${escapeHtml(entry.label)}</a></li>`,
        )
        .join("\n");

      return `<div class="footer__col">
<h2 class="footer__heading">${escapeHtml(column.heading)}</h2>
<ul class="footer__list">
${entries}
</ul>
</div>`;
    })
    .join("\n");

  return `<footer class="footer">
<div class="shell footer__inner">
<div class="footer__brand">
${wordmark({ link: false, small: true })}
<p class="footer__tagline">${escapeHtml(TAGLINE)}</p>
<p class="footer__note">${escapeHtml(NOTE)}</p>
</div>
<nav class="footer__cols" aria-label="Footer">
${rendered}
</nav>
</div>
<div class="shell footer__base">
<p class="footer__copyright">&copy; ${escapeHtml(year)} ChemiPedia</p>
</div>
</footer>`;
}
