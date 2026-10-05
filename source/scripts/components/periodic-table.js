/**
 * The periodic table.
 *
 * One component draws the whole table in every context it appears — the home page, the four table
 * views, a group page — and the context chooses only its colour mode. Each mode answers a different
 * question with the same 118 tiles:
 *
 *   group             which family an element belongs to (the default)
 *   block             which orbital block it fills
 *   state             whether it is a solid, a liquid or a gas at room temperature
 *   electronegativity how electronegative it is, banded into the scale in the legend
 *   discovery         which century it was first recognised in, from `lib/discovery`
 *
 * The three keyed modes also carry isolation: pointing at or reaching a legend chip dims every
 * tile except that key's own, which is how a reader checks "where are the halogens" in one move.
 *
 * Colours are not decided here. A tile leaves the renderer carrying the key or the band it should
 * be painted by, and `periodic-table.css` maps each key to a token. That is what keeps the six
 * scale colours and the eleven group colours in `tokens.css` where every other design value lives,
 * instead of in a JavaScript list that could drift from them.
 *
 * Rendering is a string, behaviour is an attachment. `renderPeriodicTable` is what a build-time
 * caller wants; `createPeriodicTable` returns that markup plus the model it was built from and the
 * function that brings it to life in a browser — arrow-key navigation, roving focus and isolation.
 *
 * Two options exist for the page whose subject is a single key rather than the whole table. One is
 * `isolate`: the table is written already isolated to that key, so the group page arrives with its
 * own elements picked out and needs no script to look right. The other is `legendLinks`: the chips
 * become links to a key's own page instead of buttons that isolate, which is how the legend doubles
 * as the way from one group to the next. A table written with an isolation keeps it when a reader
 * points at a chip and moves away again, which is what makes the chips a preview rather than a
 * one-way door.
 */

import { bandFor } from "../lib/colour-scale.js";
import { ERAS, eraKeyFor, yearOf } from "../lib/discovery.js";
import { UNKNOWN, formatNumber } from "../lib/format.js";
import { createGrid } from "../lib/grid.js";
import { attributes, escapeHtml } from "../lib/html.js";
import { destinationFor } from "../lib/keyboard.js";
import { elementTile } from "./element-tile.js";
import { attachLegendChips, legendChips } from "./legend-chips.js";

/** The modes, in the order the table views introduce them. */
export const MODES = ["group", "block", "state", "electronegativity", "discovery"];

/** The numeric view's field, legend label and band count. Six bands, one per `--scale-N`. */
export const ELECTRONEGATIVITY = {
  field: "electronegativity",
  label: "Electronegativity",
  bands: 6,
};

const MODE_LABELS = {
  group: "Element group",
  block: "Orbital block",
  state: "State at room temperature",
  electronegativity: ELECTRONEGATIVITY.label,
  discovery: "Century of discovery",
};

const BLOCKS = [
  { key: "s", label: "s-block" },
  { key: "p", label: "p-block" },
  { key: "d", label: "d-block" },
  { key: "f", label: "f-block" },
];

const STATES = [
  { key: "solid", label: "Solid" },
  { key: "liquid", label: "Liquid" },
  { key: "gas", label: "Gas" },
  { key: "unknown", label: "Unknown" },
];

/**
 * The key a tile is painted and isolated by, in a keyed mode.
 *
 * @param {object} element
 * @param {"group" | "block" | "state" | "discovery"} mode
 * @returns {string}
 */
function keyFor(element, mode) {
  if (mode === "group") {
    return element.category;
  }

  if (mode === "block") {
    return element.block;
  }

  if (mode === "discovery") {
    return eraKeyFor(yearOf(element));
  }

  return element.state ?? "unknown";
}

/**
 * The smallest and largest measured value of a field, which is the numeric view's domain.
 *
 * Readings do not come from the definition: a domain written down would be a second opinion about
 * data the site already holds, and it would stay wrong quietly if the data changed. When nothing is
 * measured — a fixture, a future view over an empty set — the domain is 0 to 1 so that `bandFor`
 * still has a scale to work with rather than a division by zero.
 *
 * @param {object[]} elements
 * @param {string} field
 * @returns {[number, number]}
 */
function domainOf(elements, field) {
  const values = elements
    .map((element) => element[field])
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (values.length === 0) {
    return [0, 1];
  }

  return [Math.min(...values), Math.max(...values)];
}

/**
 * The legend's items for a keyed mode: every key with at least one element behind it.
 *
 * The count is counted from the same array the tiles are drawn from, never from a declared total,
 * so a legend chip and the tiles it dims cannot disagree.
 *
 * @param {string} mode
 * @param {object[]} elements
 * @param {{ slug: string, name: string }[]} categories
 * @returns {{ key: string, label: string, count: number }[]}
 */
function legendItems(mode, elements, categories) {
  let keys;

  if (mode === "group") {
    keys = categories.map((category) => ({ key: category.slug, label: category.name }));
  } else if (mode === "block") {
    keys = BLOCKS;
  } else if (mode === "discovery") {
    keys = ERAS;
  } else {
    keys = STATES;
  }

  return keys
    .map(({ key, label }) => ({
      key,
      label,
      count: elements.filter((element) => keyFor(element, mode) === key).length,
    }))
    .filter((item) => item.count > 0);
}

/**
 * The scale legend: the domain's two ends, the six band colours, and the grey of a missing value.
 *
 * @param {{ domain: [number, number], bands: number, label: string }} scale
 * @returns {string}
 */
function scaleLegend({ domain, bands, label }) {
  const [low, high] = domain;
  const ends = [formatNumber(low, { decimals: 2 }), formatNumber(high, { decimals: 2 })];
  const swatches = Array.from(
    { length: bands },
    (_, band) => `\n<span style="background: var(--scale-${band + 1})"></span>`,
  ).join("");

  return `<div${attributes({
    class: "scale",
    role: "group",
    "aria-label": `${label} from ${ends[0]} to ${ends[1]}. Grey marks an element with no measured value.`,
  })}>
<span class="scale__k">${ends[0]}</span>
<span class="scale__bar" aria-hidden="true">${swatches}
</span>
<span class="scale__k">${ends[1]}</span>
<span class="scale__nd" style="background: var(--scale-none)" aria-hidden="true"></span>
<span class="scale__k">${escapeHtml(UNKNOWN)}</span>
</div>`;
}

/**
 * The table's markup, from a grid that has already been laid out.
 *
 * @param {{
 *   model: ReturnType<typeof createGrid>,
 *   elements: object[],
 *   categories: { slug: string, name: string }[],
 *   mode: string,
 *   current: number | null,
 *   compact: boolean,
 *   hint: string,
 *   isolate: string | null,
 *   legendLinks: ((key: string) => string) | null
 * }} options
 * @returns {string}
 */
function markup({
  model,
  elements,
  categories,
  mode,
  current,
  compact,
  hint,
  isolate,
  legendLinks,
}) {
  const numeric = mode === "electronegativity";
  const scale = numeric
    ? { domain: domainOf(elements, ELECTRONEGATIVITY.field), bands: ELECTRONEGATIVITY.bands, label: ELECTRONEGATIVITY.label }
    : null;

  const tiles = model.cells.map((cell, index) => {
    const key = numeric ? null : keyFor(cell.element, mode);

    return elementTile({
      element: cell.element,
      key,
      band: scale ? (bandFor(cell.element[ELECTRONEGATIVITY.field], scale) ?? "none") : null,
      tabbable: index === 0,
      compact,
      current: current !== null && cell.element.atomicNumber === current,
      match: isolate !== null && key === isolate,
    });
  });

  const legend = scale
    ? scaleLegend(scale)
    : legendChips({
        items: legendItems(mode, elements, categories).map((item) => ({
          ...item,
          href: legendLinks ? legendLinks(item.key) : undefined,
        })),
        label: `${MODE_LABELS[mode]} colour key`,
      });

  const note = hint ? `\n<p class="pt__hint">${escapeHtml(hint)}</p>` : "";

  return `<div${attributes({ class: "pt", "data-mode": mode })}>
${legend}${note}
<div class="pt__scroller">
<div${attributes({
    class: "pt__grid",
    role: "list",
    "aria-label": "Periodic table of the elements",
    "data-pt-grid": true,
    "data-isolated": isolate,
  })}>
${tiles.join("\n")}
</div>
</div>
</div>`;
}

/**
 * Bring a rendered table to life: roving focus, arrow-key navigation and isolation.
 *
 * Exported because a build-time caller wants the behaviour without the markup: the table views are
 * written into their documents by the build, and a browser attaches to what is already there. The
 * model is the only thing the behaviour needs, and it is the same `lib/grid.js` layout the markup
 * was drawn from — a second copy of the geometry would be a second answer to where a tile is.
 *
 * One tile is in the tab order and the arrows move between tiles, so Tab leaves the table rather
 * than walking through 118 links. The move itself is decided by `lib/keyboard.js` against the grid
 * model — the same model the markup was drawn from, so focus and layout cannot disagree about
 * where a tile is.
 *
 * @param {ParentNode} root the element the table was rendered into
 * @param {{ model: ReturnType<typeof createGrid>, staticIsolate?: string | null }} options
 *   `staticIsolate` overrides the key the page rests on, which by default is the table's own
 *   `data-isolated`: a page whose subject is one key is written already isolated to it, so a chip
 *   that is pointed at previews its own key and moving away restores the page's rather than
 *   clearing the table. A table that was not written isolated has nothing to rest on, so leaving a
 *   chip restores the whole table — which is what the home page and the four views want.
 * @returns {() => void} teardown
 */
export function attachPeriodicTable(root, { model, staticIsolate } = {}) {
  const grid = root.querySelector("[data-pt-grid]");

  if (!grid) {
    return () => {};
  }

  const restsOn = staticIsolate ?? grid.dataset.isolated ?? null;

  const tiles = [...grid.querySelectorAll(".tile")];
  const byCell = new Map(
    tiles.map((tile) => [`${tile.dataset.row}:${tile.dataset.column}`, tile]),
  );
  let current = tiles.find((tile) => tile.tabIndex === 0) ?? null;

  /** Move the tab stop, and only the tab stop, to a tile. */
  function rove(tile) {
    if (current && current !== tile) {
      current.tabIndex = -1;
    }

    current = tile;
    tile.tabIndex = 0;
  }

  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const tile = event.target.closest?.(".tile");

    if (!tile) {
      return;
    }

    const cell = model.cellAt(Number(tile.dataset.row), Number(tile.dataset.column));
    const destination = cell ? destinationFor({ grid: model, cell, key: event.key }) : null;
    const next = destination && byCell.get(`${destination.row}:${destination.column}`);

    if (!next) {
      return;
    }

    event.preventDefault();
    rove(next);
    next.focus({ preventScroll: true });
    next.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function onFocusIn(event) {
    const tile = event.target.closest?.(".tile");

    if (tile) {
      rove(tile);
    }
  }

  /** Dim every tile but the isolated key's own, or restore what the page rests on. */
  function isolate(key) {
    const target = key ?? restsOn;

    if (target === null) {
      grid.removeAttribute("data-isolated");

      for (const tile of tiles) {
        tile.classList.remove("is-match");
      }

      return;
    }

    grid.dataset.isolated = target;

    for (const tile of tiles) {
      tile.classList.toggle("is-match", tile.dataset.key === target);
    }
  }

  const releaseLegend = attachLegendChips(root, { onHighlight: isolate });

  grid.addEventListener("keydown", onKeyDown);
  grid.addEventListener("focusin", onFocusIn);

  return () => {
    grid.removeEventListener("keydown", onKeyDown);
    grid.removeEventListener("focusin", onFocusIn);
    releaseLegend();
  };
}

/**
 * The table as markup alone, for a caller that has no behaviour to attach.
 *
 * @param {Parameters<typeof createPeriodicTable>[0]} options
 * @returns {string}
 */
export function renderPeriodicTable(options) {
  return createPeriodicTable(options).html;
}

/**
 * The table and the ability to run it.
 *
 * @param {{
 *   elements: object[],
 *   categories?: { slug: string, name: string }[],
 *   mode?: "group" | "block" | "state" | "electronegativity" | "discovery",
 *   current?: number | null,
 *   compact?: boolean,
 *   hint?: string,
 *   isolate?: string | null,
 *   legendLinks?: ((key: string) => string) | null
 * }} options
 * @returns {{ model: ReturnType<typeof createGrid>, html: string, attach: (root: ParentNode) => () => void }}
 * @throws {TypeError} when the mode is not one of the five
 */
export function createPeriodicTable({
  elements,
  categories = [],
  mode = "group",
  current = null,
  compact = false,
  hint = "",
  isolate = null,
  legendLinks = null,
}) {
  if (!MODES.includes(mode)) {
    throw new TypeError(`Not a table mode: ${mode}`);
  }

  const model = createGrid(elements);

  return {
    model,
    html: markup({ model, elements, categories, mode, current, compact, hint, isolate, legendLinks }),
    attach: (root) => attachPeriodicTable(root, { model }),
  };
}
