/**
 * The home page.
 *
 * The one page that is a composition rather than a family, so this module is mostly an order of
 * operations: fill the table's host with the engine, fill the search's host with its component,
 * and draw the two explainer diagrams from the same grid model the table is laid out from.
 *
 * The diagrams are the page's own decoration and live here rather than in a component: each one is
 * the table's real shape drawn small, with the axis it explains labelled. A period diagram labels
 * the rows down the left, so the cells shift one column right; a group diagram labels the columns
 * across the top, so the cells shift one row down. Because both come from `lib/grid.js`, a change
 * to where an element sits moves the diagrams with the table instead of leaving them behind.
 *
 * The template authors the sections and the hosts; this module fills them from the data layer when
 * the page loads. It is started by `app.js`, which reads the page's name from the body the build
 * wrote and calls `startHome` — the same call on a cold load and after a client-side navigation,
 * so there is one way in rather than two that can drift.
 */

import { attachElementSearch, elementSearch } from "../components/element-search.js";
import { createPeriodicTable } from "../components/periodic-table.js";
import { COLUMNS, createGrid } from "../lib/grid.js";
import { createCategoriesRepository } from "../data/categories-repository.js";
import { createElementsRepository } from "../data/elements-repository.js";

/** The line under the legend: what the colours and the keyboard are for. */
export const TABLE_HINT =
  "Point at or focus a group to pick it out of the table; the arrow keys move through it.";

/** How many periods the period diagram labels: the seven of the main body. */
const PERIODS = 7;

/**
 * The table's shape, drawn small, with one axis labelled.
 *
 * @param {object[]} elements every element record
 * @param {"period" | "group"} axis
 * @returns {string}
 * @throws {TypeError} when the axis is neither of the two
 */
export function tableDiagram(elements, axis) {
  if (axis !== "period" && axis !== "group") {
    throw new TypeError(`Not a diagram axis: ${axis}`);
  }

  const model = createGrid(elements);
  const place = (cell) =>
    axis === "period"
      ? { row: cell.row, column: cell.column + 1 }
      : { row: cell.row + 1, column: cell.column };

  const labels = Array.from({ length: axis === "period" ? PERIODS : COLUMNS }, (_, index) => {
    const value = index + 1;
    const position =
      axis === "period" ? `grid-column:1;grid-row:${value}` : `grid-column:${value};grid-row:1`;

    return `<span class="dia__label" style="${position}">${value}</span>`;
  });

  const cells = model.cells.map((cell) => {
    const position = place(cell);

    return `<span class="dia__cell" style="grid-column:${position.column};grid-row:${position.row}"></span>`;
  });

  return `<div class="dia dia--${axis}" aria-hidden="true">
<div class="dia__grid dia__grid--${axis}">
${labels.concat(cells).join("\n")}
</div>
</div>`;
}

/**
 * Fill the page's hosts from the data layer.
 *
 * @param {ParentNode} [root]
 * @returns {Promise<void>}
 */
export async function startHome(root = document) {
  const elements = await createElementsRepository();
  const categories = await createCategoriesRepository();
  const all = elements.all();

  const tableHost = root.querySelector("[data-home-table]");

  if (tableHost) {
    const table = createPeriodicTable({
      elements: all,
      categories: categories.all(),
      mode: "group",
      hint: TABLE_HINT,
    });

    tableHost.innerHTML = table.html;
    table.attach(tableHost);
  }

  const searchHost = root.querySelector("[data-home-search]");

  if (searchHost) {
    searchHost.innerHTML = elementSearch();
    attachElementSearch(searchHost, { elements: all });
  }

  const periods = root.querySelector("[data-periods-diagram]");

  if (periods) {
    periods.innerHTML = tableDiagram(all, "period");
  }

  const groups = root.querySelector("[data-groups-diagram]");

  if (groups) {
    groups.innerHTML = tableDiagram(all, "group");
  }
}
