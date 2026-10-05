/**
 * What a keypress means on the table.
 *
 * A table of 118 links is 118 tab stops, which is not navigation, it is an obstacle. The grid
 * takes the standard answer instead: one tile is in the tab order, the arrows move between tiles,
 * and Tab leaves the table rather than walking through it. This module owns the first half of
 * that — which key means which move, and where the focus lands — and knows nothing about the DOM,
 * so the rule can be tested without a browser. The table component owns the second half: reading
 * the key, moving the focus and the tab stop, and doing nothing when the move would leave the
 * table.
 *
 * The move itself is asked of the grid, not computed here. This module decides *that* Right means
 * "one cell to the right" and Home means "the first tile in this row"; `lib/grid.js` decides what
 * that cell is, which is the part that has to know about the table's holes and detached rows.
 */

import { createGrid } from "./grid.js";

/**
 * The keys the table answers to, and the direction each one travels.
 *
 * The four arrows are the plan's requirement. Home and End are here because a row of eighteen
 * tiles is long enough that eight presses to reach its far end is a worse experience than one,
 * and because a grid that responds to four of the six movement keys a browser sends feels broken.
 */
export const KEY_DIRECTIONS = new Map([
  ["ArrowLeft", "left"],
  ["ArrowRight", "right"],
  ["ArrowUp", "up"],
  ["ArrowDown", "down"],
  ["Home", "first"],
  ["End", "last"],
]);

/**
 * The movement a key asks for, or null when the table does not handle it.
 *
 * Null rather than a default, so that a key the table does not own is left to the browser: an
 * unmatched key must not be swallowed by a component that has no opinion about it.
 *
 * @param {string} key
 * @returns {"left" | "right" | "up" | "down" | "first" | "last" | null}
 */
export function directionFor(key) {
  return KEY_DIRECTIONS.get(key) ?? null;
}

/**
 * The cell a key moves to, or null when the move would leave the table.
 *
 * @param {{
 *   grid: ReturnType<typeof createGrid>,
 *   cell: { row: number, column: number },
 *   key: string
 * }} options
 * @returns {object | null}
 */
export function destinationFor({ grid, cell, key }) {
  const direction = directionFor(key);

  if (direction === null) {
    return null;
  }

  if (direction === "first") {
    return grid.firstInRow(cell.row);
  }

  if (direction === "last") {
    return grid.lastInRow(cell.row);
  }

  return grid.neighbour(cell, direction);
}
