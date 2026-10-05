import { test } from "node:test";
import assert from "node:assert/strict";

import { createGrid } from "../../scripts/lib/grid.js";
import { KEY_DIRECTIONS, destinationFor, directionFor } from "../../scripts/lib/keyboard.js";

/**
 * A four-cell fixture with a hole between the two ends of the first row, so the movement rules are
 * visible without the whole table.
 */
const grid = createGrid([
  { symbol: "H", position: { row: 1, column: 1 } },
  { symbol: "He", position: { row: 1, column: 18 } },
  { symbol: "Li", position: { row: 2, column: 1 } },
  { symbol: "Be", position: { row: 2, column: 2 } },
  { symbol: "B", position: { row: 2, column: 13 } },
]);

const cellOf = (symbol) => {
  const found = grid.cells.find((cell) => cell.element.symbol === symbol);

  return found;
};

test("the arrow keys name the four directions, and Home and End name the ends", () => {
  assert.equal(directionFor("ArrowLeft"), "left");
  assert.equal(directionFor("ArrowRight"), "right");
  assert.equal(directionFor("ArrowUp"), "up");
  assert.equal(directionFor("ArrowDown"), "down");
  assert.equal(directionFor("Home"), "first");
  assert.equal(directionFor("End"), "last");
  assert.equal(KEY_DIRECTIONS.size, 6);
});

test("a key the table does not own has no direction", () => {
  for (const key of ["Enter", "Tab", "Escape", "PageDown", "a", " ", ""]) {
    assert.equal(directionFor(key), null, `${key} was claimed`);
  }
});

test("an arrow moves to the neighbouring cell, across a row's holes", () => {
  assert.equal(destinationFor({ grid, cell: cellOf("H"), key: "ArrowRight" }).element.symbol, "He");
  assert.equal(destinationFor({ grid, cell: cellOf("He"), key: "ArrowLeft" }).element.symbol, "H");
  assert.equal(destinationFor({ grid, cell: cellOf("H"), key: "ArrowDown" }).element.symbol, "Li");
  assert.equal(destinationFor({ grid, cell: cellOf("Be"), key: "ArrowRight" }).element.symbol, "B");
  assert.equal(destinationFor({ grid, cell: cellOf("Be"), key: "ArrowLeft" }).element.symbol, "Li");
});

test("Home and End reach the ends of the row the focus is in", () => {
  assert.equal(destinationFor({ grid, cell: cellOf("Be"), key: "Home" }).element.symbol, "Li");
  assert.equal(destinationFor({ grid, cell: cellOf("Be"), key: "End" }).element.symbol, "B");
  assert.equal(destinationFor({ grid, cell: cellOf("He"), key: "Home" }).element.symbol, "H");
  assert.equal(destinationFor({ grid, cell: cellOf("H"), key: "End" }).element.symbol, "He");
});

test("a move that would leave the table has no destination", () => {
  assert.equal(destinationFor({ grid, cell: cellOf("H"), key: "ArrowUp" }), null);
  assert.equal(destinationFor({ grid, cell: cellOf("H"), key: "ArrowLeft" }), null);
  assert.equal(destinationFor({ grid, cell: cellOf("B"), key: "ArrowDown" }), null);
  assert.equal(destinationFor({ grid, cell: cellOf("Be"), key: "ArrowDown" }), null);
});

test("an unhandled key never moves focus", () => {
  assert.equal(destinationFor({ grid, cell: cellOf("H"), key: "Enter" }), null);
  assert.equal(destinationFor({ grid, cell: cellOf("H"), key: "Tab" }), null);
});
