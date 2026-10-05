/**
 * One tile: the atomic number, the symbol, and — at most widths — the name.
 *
 * A tile is a link to the element's page before it is anything else, so the whole square is
 * clickable and its accessible name says the three facts a reader needs without reading the
 * three lines: "Hydrogen, symbol H, atomic number 1".
 *
 * Where the tile sits is not this module's to decide. The position arrives on the record,
 * computed by the build from the atomic number alone, and is written into `grid-column` and
 * `grid-row`: a stylesheet that re-derived the layout would be a second answer to a question that
 * already has one. What the tile does decide is its shape, and what the page decides through
 * `key` or `band` is its colour. Neither colour is named here: the tile emits the key it should
 * be painted by, and `periodic-table.css` maps that key to a token.
 *
 * Two variants exist because two tables exist: the full table, where the name is the third line,
 * and a compact one — an overview, a legend, a preview — where the symbol is enough.
 *
 * A tile can also arrive already picked out: `match` marks the tile a table is isolating, so a page
 * whose whole subject is one group can be written with that group at full colour and the rest of
 * the table dimmed, without a script having to run to get there. The mark is a class, and the
 * stylesheet that reads it is the table's — a tile that decides its own dimming would be a second
 * answer to what an isolation looks like.
 */

import { attributes, classNames, escapeHtml } from "../lib/html.js";

/**
 * @param {{
 *   element: object,
 *   href?: string,            defaults to the element's own page
 *   key?: string | null,      the colour key in the active mode
 *   band?: number | null,     the colour band in a numeric mode
 *   tabbable?: boolean,       whether this is the tile the tab key lands on
 *   compact?: boolean,        symbol and number only
 *   current?: boolean,        whether this is the page's own element
 *   match?: boolean           whether the table is isolating this tile's key
 * }} options
 * @returns {string}
 * @throws {TypeError} when the element has no position, caught in one place rather than silently
 *   rendering a tile at the origin
 */
export function elementTile({
  element,
  href = `/elements/${element.slug}/`,
  key = null,
  band = null,
  tabbable = false,
  compact = false,
  current = false,
  match = false,
}) {
  const { row, column } = element.position ?? {};

  if (!Number.isInteger(row) || !Number.isInteger(column)) {
    throw new TypeError(`${element.symbol ?? "An element"} has no cell on the table`);
  }

  const name = compact
    ? ""
    : `\n<span class="tile__name">${escapeHtml(element.name)}</span>`;

  return `<a${attributes({
    class: classNames("tile", compact && "tile--compact", match && "is-match"),
    href,
    "data-key": key,
    "data-band": band === null ? null : String(band),
    "data-row": row,
    "data-column": column,
    style: `grid-column:${column};grid-row:${row}`,
    role: "listitem",
    tabindex: tabbable ? 0 : -1,
    "aria-current": current ? "page" : null,
    title: `${element.name} · ${element.symbol} · ${element.atomicNumber}`,
    "aria-label": `${element.name}, symbol ${element.symbol}, atomic number ${element.atomicNumber}`,
  })}>
<span class="tile__z">${escapeHtml(element.atomicNumber)}</span>
<span class="tile__sym">${escapeHtml(element.symbol)}</span>${name}
</a>`;
}
