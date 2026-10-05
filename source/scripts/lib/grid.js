/**
 * Where each element sits, and which cell a keypress lands on next.
 *
 * The table's geometry is already decided. Every element record carries a `position` — a row and a
 * column on an eighteen-column grid — computed by the build from the atomic number alone, and
 * `tools/data-sources/layout.js` remains the single answer to where an element belongs. This
 * module does not re-derive that and it does not let a stylesheet decide it either. It reads the
 * frozen answer, lays the 118 records out as cells, and answers the two questions the engine asks:
 * which element is in a cell, and which cell is one step away.
 *
 * The second question is why this is a module and not four lines inside the table component.
 * Stepping from one tile to the next is not arithmetic on a column number. The first three periods
 * have holes where the d block has not started; row 8 is empty on purpose, because it is the gap
 * that separates the lanthanides and actinides from the body; and the two detached rows hang
 * fifteen columns wide below it. So a step is "the nearest occupied cell in that direction,
 * skipping the holes" — one rule for all 118 elements and all four directions, which is what makes
 * it testable without a browser.
 *
 * Pure: no DOM, no data file, no stylesheet.
 */

/** The grid's dimensions, which are also its shape: seven periods, a gap, two detached rows. */
export const ROWS = 10;
export const COLUMNS = 18;

/** How a direction moves a row and a column. */
const STEPS = {
  left: [0, -1],
  right: [0, 1],
  up: [-1, 0],
  down: [1, 0],
};

/**
 * A cell's address as a map key.
 *
 * @param {number} row
 * @param {number} column
 * @returns {string}
 */
function keyOf(row, column) {
  return `${row}:${column}`;
}

/**
 * Lay the element records out as a grid, and answer questions about it.
 *
 * @param {object[]} elements every element record, in any order
 * @returns {{
 *   rows: number,
 *   columns: number,
 *   cells: { element: object, row: number, column: number }[],
 *   row: (row: number) => object[],
 *   cellAt: (row: number, column: number) => object | null,
 *   neighbour: (cell: { row: number, column: number }, direction: string) => object | null,
 *   firstInRow: (row: number) => object | null,
 *   lastInRow: (row: number) => object | null
 * }}
 * @throws {TypeError} when a record has no usable position, or two share a cell
 */
export function createGrid(elements) {
  const cells = [];
  const byCell = new Map();

  for (const element of elements) {
    const { row, column } = element.position ?? {};

    if (
      !Number.isInteger(row) ||
      !Number.isInteger(column) ||
      row < 1 ||
      row > ROWS ||
      column < 1 ||
      column > COLUMNS
    ) {
      throw new TypeError(
        `${element.symbol ?? "an element"} has no cell on the table: ${row}:${column}`,
      );
    }

    const key = keyOf(row, column);

    if (byCell.has(key)) {
      throw new TypeError(
        `${element.symbol} and ${byCell.get(key).element.symbol} share cell ${row}:${column}`,
      );
    }

    const cell = { element, row, column };

    byCell.set(key, cell);
    cells.push(cell);
  }

  const rowOf = (row) => cells.filter((cell) => cell.row === row).sort((one, other) => one.column - other.column);

  /**
   * The nearest occupied cell one step away, or null at the table's edge.
   *
   * The scan continues while it is inside the grid, so a step that would land in a hole — the
   * empty half of period 2, the gap row, the empty column 3 of the f-block rows — arrives at the
   * next real tile instead of stopping. That is what makes Down from hydrogen reach lithium and
   * Down from a period-7 element reach the actinides.
   *
   * @param {{ row: number, column: number }} cell
   * @param {"left" | "right" | "up" | "down"} direction
   * @returns {object | null}
   */
  function neighbour(cell, direction) {
    const step = STEPS[direction];

    if (!step) {
      throw new TypeError(`Not a direction: ${direction}`);
    }

    const [rowStep, columnStep] = step;
    let row = cell.row + rowStep;
    let column = cell.column + columnStep;

    while (row >= 1 && row <= ROWS && column >= 1 && column <= COLUMNS) {
      const found = byCell.get(keyOf(row, column));

      if (found) {
        return found;
      }

      row += rowStep;
      column += columnStep;
    }

    return null;
  }

  return {
    rows: ROWS,
    columns: COLUMNS,
    cells,
    row: rowOf,
    cellAt: (row, column) => byCell.get(keyOf(row, column)) ?? null,
    neighbour,
    firstInRow: (row) => rowOf(row)[0] ?? null,
    lastInRow: (row) => rowOf(row).at(-1) ?? null,
  };
}
