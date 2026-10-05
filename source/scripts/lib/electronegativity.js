/**
 * What is true of the electronegativity field, read off the records.
 *
 * The alternate electronegativity view makes four claims about its scale, and every one of them is
 * a question about the data rather than a sentence somebody wrote down: where the scale ends, which
 * periods rise at every step, how many groups never rise, and which records have no value at all.
 * Those are pure questions, so they live here rather than in the page that words them — the page
 * decides how to say it, and this module decides whether it is so.
 *
 * The reason it matters is the reason the rest of the project derives its claims: a sentence
 * written beside a dataset goes stale quietly. Phase 6 found a page promising a ranking "from
 * helium to tungsten" when the data's highest melting point is carbon's. A count computed here
 * changes with the data; a count typed into a sentence does not.
 *
 * Two shapes of sequence are read. Across a period, a value is compared with the element to its
 * left, in the order the table draws them — the two detached f rows belong to no column and are
 * left out, because a sequence read off them is not a sequence a reader can follow. Down a group, a
 * value is compared with the element above it, and only groups with three or more measured values
 * are counted at all.
 *
 * Pure: no DOM, no data file, no stylesheet.
 */

/** The field every function here reads. */
export const FIELD = "electronegativity";

/** The seven rows of the table's main body; the detached f rows are drawn outside them. */
const MAIN_ROWS = 7;

/**
 * Whether a record carries a value for the field.
 *
 * @param {object} element
 * @returns {boolean}
 */
export function isMeasured(element) {
  return typeof element[FIELD] === "number" && Number.isFinite(element[FIELD]);
}

/** Whether every value in a sequence is higher than the one before it. */
const risesAtEveryStep = (row) =>
  row.every((element, index) => index === 0 || element[FIELD] > row[index - 1][FIELD]);

/** Whether no value in a sequence is higher than the one before it. */
const fallsOrHolds = (column) =>
  column.every((element, index) => index === 0 || element[FIELD] <= column[index - 1][FIELD]);

/**
 * The measured elements, ascending by value.
 *
 * @param {object[]} elements
 * @returns {object[]}
 */
export function ascendingByValue(elements) {
  return elements.filter(isMeasured).sort((one, other) => one[FIELD] - other[FIELD]);
}

/**
 * A period's measured elements in the order the table reads them, left to right.
 *
 * @param {object[]} elements
 * @param {number} period
 * @returns {object[]}
 */
export function periodSequence(elements, period) {
  return elements
    .filter(
      (element) =>
        element.period === period &&
        (element.position?.row ?? 0) <= MAIN_ROWS &&
        isMeasured(element),
    )
    .sort((one, other) => one.position.column - other.position.column);
}

/**
 * The periods whose measured values rise at every step, with the sequence that rose.
 *
 * @param {object[]} elements
 * @returns {{ period: number, row: object[] }[]}
 */
export function risingPeriods(elements) {
  const periods = [...new Set(elements.map((element) => element.period))].sort(
    (one, other) => one - other,
  );

  return periods
    .map((period) => ({ period, row: periodSequence(elements, period) }))
    .filter(({ row }) => row.length >= 3 && risesAtEveryStep(row));
}

/**
 * How the value behaves down a column: how many groups were checkable, and how many never rise.
 *
 * A group is checkable when three or more of its members carry a value, which is what keeps a
 * two-element group from being reported as a trend.
 *
 * @param {object[]} elements
 * @returns {{ checked: number, falling: number }}
 */
export function fallingGroups(elements) {
  const columns = Array.from({ length: 18 }, (_, index) => index + 1)
    .map((group) =>
      elements.filter((element) => element.group === group && isMeasured(element)).sort(
        (one, other) => one.period - other.period,
      ),
    )
    .filter((column) => column.length >= 3);

  return { checked: columns.length, falling: columns.filter(fallsOrHolds).length };
}

/**
 * The records with no value that run unbroken to the end of the table.
 *
 * This is what makes "every element from rutherfordium onward" a derived sentence rather than a
 * remembered one: the tail is found in the data, and it is found without naming an atomic number.
 *
 * @param {object[]} elements in atomic order
 * @returns {object[]}
 */
export function missingTrail(elements) {
  const trail = [];

  for (let index = elements.length - 1; index >= 0; index -= 1) {
    if (isMeasured(elements[index])) {
      break;
    }

    trail.unshift(elements[index]);
  }

  return trail;
}

/**
 * The records with no value, split into the table's tail and the rest.
 *
 * @param {object[]} elements
 * @returns {{ missing: object[], before: object[], trail: object[] }} `before` is the ones above
 *   the tail, which are the ones worth naming individually
 */
export function missingValues(elements) {
  const trail = missingTrail(elements);
  const missing = elements.filter((element) => !isMeasured(element));

  return { missing, before: missing.filter((element) => !trail.includes(element)), trail };
}

/**
 * Everything a page can say about the field's spread, in one call.
 *
 * @param {object[]} elements
 * @returns {{
 *   measured: number,
 *   missing: number,
 *   ascending: object[],
 *   low: object | null,
 *   high: object | null,
 *   risingPeriods: { period: number, row: object[] }[],
 *   groups: { checked: number, falling: number },
 *   before: object[],
 *   trail: object[]
 * }}
 */
export function electronegativitySummary(elements) {
  const ascending = ascendingByValue(elements);
  const { missing, before, trail } = missingValues(elements);

  return {
    measured: ascending.length,
    missing: missing.length,
    ascending,
    low: ascending[0] ?? null,
    high: ascending.at(-1) ?? null,
    risingPeriods: risingPeriods(elements),
    groups: fallingGroups(elements),
    before,
    trail,
  };
}
