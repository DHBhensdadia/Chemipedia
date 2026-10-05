/**
 * The periodic table.
 *
 * One component draws the whole table in every context it appears — the home page, the four table
 * views, a group page — and the context chooses only its colour mode. The mode is one of four, and
 * each answers a different question with the same 118 tiles:
 *
 *   group             which family an element belongs to (the default)
 *   block             which orbital block it fills
 *   state             whether it is a solid, a liquid or a gas at room temperature
 *   electronegativity how electronegative it is, banded into the scale in the legend
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
 */

import { bandFor } from "../lib/colour-scale.js";
import { UNKNOWN, formatNumber } from "../lib/format.js";
import { createGrid } from "../lib/grid.js";
import { attributes, escapeHtml } from "../lib/html.js";
import { destinationFor } from "../lib/keyboard.js";
import { elementTile } from "./element-tile.js";
import { attachLegendChips, legendChips } from "./legend-chips.js";

/** The four modes, in the order the table views introduce them. */
export const MODES = ["group", "block", "state", "electronegativity"];

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
 * @param {"group" | "block" | "state"} mode
 * @returns {string}
 */
function keyFor(element, mode) {
  if (mode === "group") {
    return element.category;
  }

  if (mode === "block") {
    return element.block;
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
 *   compact: boolean
 * }} options
 * @returns {string}
 */
function markup({ model, elements, categories, mode, current, compact }) {
  const numeric = mode === "electronegativity";
  const scale = numeric
    ? { domain: domainOf(elements, ELECTRONEGATIVITY.field), bands: ELECTRONEGATIVITY.bands, label: ELECTRONEGATIVITY.label }
    : null;

  const tiles = model.cells.map((cell, index) =>
    elementTile({
      element: cell.element,
      key: numeric ? null : keyFor(cell.element, mode),
      band: scale ? (bandFor(cell.element[ELECTRONEGATIVITY.field], scale) ?? "none") : null,
      tabbable: index === 0,
      compact,
      current: current !== null && cell.element.atomicNumber === current,
    }),
  );

  const legend = scale
    ? scaleLegend(scale)
    : legendChips({
        items: legendItems(mode, elements, categories),
        label: `${MODE_LABELS[mode]} colour key`,
      });

  return `<div${attributes({ class: "pt", "data-mode": mode })}>
${legend}
<div class="pt__scroller">
<div${attributes({
    class: "pt__grid",
    role: "list",
    "aria-label": "Periodic table of the elements",
    "data-pt-grid": true,
  })}>
${tiles.join("\n")}
</div>
</div>
</div>`;
}

/**
 * Bring a rendered table to life: roving focus, arrow-key navigation and isolation.
 *
 * One tile is in the tab order and the arrows move between tiles, so Tab leaves the table rather
 * than walking through 118 links. The move itself is decided by `lib/keyboard.js` against the grid
 * model — the same model the markup was drawn from, so focus and layout cannot disagree about
 * where a tile is.
 *
 * @param {ParentNode} root the element the table was rendered into
 * @param {{ model: ReturnType<typeof createGrid> }} options
 * @returns {() => void} teardown
 */
function attachPeriodicTable(root, { model }) {
  const grid = root.querySelector("[data-pt-grid]");

  if (!grid) {
    return () => {};
  }

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

  /** Dim every tile but the isolated key's own, or restore the whole table. */
  function isolate(key) {
    if (key === null) {
      grid.removeAttribute("data-isolated");

      for (const tile of tiles) {
        tile.classList.remove("is-match");
      }

      return;
    }

    grid.dataset.isolated = key;

    for (const tile of tiles) {
      tile.classList.toggle("is-match", tile.dataset.key === key);
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
 *   mode?: "group" | "block" | "state" | "electronegativity",
 *   current?: number | null,
 *   compact?: boolean
 * }} options
 * @returns {{ model: ReturnType<typeof createGrid>, html: string, attach: (root: ParentNode) => () => void }}
 * @throws {TypeError} when the mode is not one of the four
 */
export function createPeriodicTable({
  elements,
  categories = [],
  mode = "group",
  current = null,
  compact = false,
}) {
  if (!MODES.includes(mode)) {
    throw new TypeError(`Not a table mode: ${mode}`);
  }

  const model = createGrid(elements);

  return {
    model,
    html: markup({ model, elements, categories, mode, current, compact }),
    attach: (root) => attachPeriodicTable(root, { model }),
  };
}
