import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createElementsRepository } from "../../scripts/data/elements-repository.js";
import { COLUMNS, ROWS, createGrid } from "../../scripts/lib/grid.js";

/**
 * A stand-in for the browser's fetch that reads the real file from disk.
 *
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function fromDisk(url) {
  const name = url.split("/").pop();
  const body = await readFile(new URL(`../../data/${name}`, import.meta.url), "utf8");

  return new Response(body, { status: 200, headers: { "content-type": "application/json" } });
}

const elements = await createElementsRepository({ fetchImpl: fromDisk });
const grid = createGrid(elements.all());

/** The grid cell of an element, by symbol. */
function cellOf(symbol) {
  const element = elements.bySymbol(symbol);

  return grid.cellAt(element.position.row, element.position.column);
}

test("the grid is the table's shape", () => {
  assert.equal(ROWS, 10, "seven periods, the gap, and two detached rows");
  assert.equal(COLUMNS, 18);
  assert.equal(grid.rows, ROWS);
  assert.equal(grid.columns, COLUMNS);
  assert.equal(grid.cells.length, 118);
});

test("every element sits in its own cell, where the data puts it", () => {
  const seen = new Set();

  for (const cell of grid.cells) {
    const key = `${cell.row}:${cell.column}`;

    assert.ok(!seen.has(key), `${cell.element.symbol} shares cell ${key}`);
    seen.add(key);

    assert.equal(cell.row, cell.element.position.row);
    assert.equal(cell.column, cell.element.position.column);
    assert.equal(grid.cellAt(cell.row, cell.column), cell);
  }
});

test("row eight stays empty, as the gap between the body and the f block", () => {
  assert.deepEqual(grid.row(8), []);

  for (let column = 1; column <= COLUMNS; column += 1) {
    assert.equal(grid.cellAt(8, column), null);
  }
});

test("both detached rows run from column three to column seventeen, without a gap", () => {
  for (const [row, first, last] of [
    [9, "La", "Lu"],
    [10, "Ac", "Lr"],
  ]) {
    const cells = grid.row(row);

    assert.equal(cells.length, 15, `row ${row} does not hold fifteen elements`);
    assert.equal(cells.at(0).element.symbol, first);
    assert.equal(cells.at(-1).element.symbol, last);

    cells.forEach((cell, index) => assert.equal(cell.column, 3 + index, `row ${row} has a gap`));
  }
});

test("every f-block element is in a detached row and in no group", () => {
  const detached = elements.withBlock("f");

  assert.equal(detached.length, 30, "fifteen lanthanides and fifteen actinides");

  for (const element of detached) {
    const { row, column } = element.position;

    assert.ok(row === 9 || row === 10, `${element.symbol} is in row ${row}`);
    assert.ok(column >= 3 && column <= 17, `${element.symbol} is in column ${column}`);
    assert.equal(element.group, null, `${element.symbol} claims a group`);
  }
});

test("down from hydrogen reaches lithium", () => {
  assert.equal(grid.neighbour({ row: 1, column: 1 }, "down").element.symbol, "Li");
});

test("right from hydrogen crosses the first period's gap to helium", () => {
  assert.equal(grid.neighbour({ row: 1, column: 1 }, "right").element.symbol, "He");
});

test("down from a d-block element skips the empty row and the gap and reaches the lanthanide", () => {
  assert.equal(grid.neighbour({ row: 7, column: 4 }, "down").element.symbol, "Ce");
});

test("a step that would leave the table has no destination", () => {
  assert.equal(grid.neighbour({ row: 1, column: 1 }, "up"), null);
  assert.equal(grid.neighbour({ row: 1, column: 1 }, "left"), null);
  assert.equal(grid.neighbour({ row: 7, column: 1 }, "down"), null, "nothing hangs below francium");
  assert.equal(grid.neighbour({ row: 7, column: 18 }, "right"), null);
});

test("a row's ends are its first and last occupied cells", () => {
  assert.equal(grid.firstInRow(1).element.symbol, "H");
  assert.equal(grid.lastInRow(1).element.symbol, "He");
  assert.equal(grid.firstInRow(9).element.symbol, "La");
  assert.equal(grid.lastInRow(9).element.symbol, "Lu");
  assert.equal(grid.firstInRow(10).element.symbol, "Ac");
  assert.equal(grid.lastInRow(10).element.symbol, "Lr");
  assert.equal(grid.firstInRow(8), null);
  assert.equal(grid.lastInRow(8), null);
});

test("the ends of real rows match the element queries", () => {
  assert.equal(cellOf("He").column, 18);
  assert.equal(cellOf("Og").column, 18);
  assert.equal(cellOf("Fr").row, 7);
});

test("a record with no usable position is refused, with its symbol in the message", () => {
  assert.throws(() => createGrid([{ symbol: "Xx", position: { row: 0, column: 1 } }]), /Xx/);
  assert.throws(() => createGrid([{ symbol: "Xx" }]), TypeError);
});

test("two records in one cell are refused", () => {
  assert.throws(
    () =>
      createGrid([
        { symbol: "A", position: { row: 1, column: 1 } },
        { symbol: "B", position: { row: 1, column: 1 } },
      ]),
    /share cell 1:1/,
  );
});

test("a direction that is not one of the four is refused", () => {
  assert.throws(() => grid.neighbour({ row: 1, column: 1 }, "diagonal"), TypeError);
});
