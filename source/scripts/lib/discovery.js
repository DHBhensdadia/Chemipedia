/**
 * Which era of the table's history an element belongs to.
 *
 * The evolution view colours the same 118 tiles by the year each element was first recognised, so
 * the key a tile is painted by is a fact about the record rather than a category somebody filed it
 * under. This module is that fact, and it is pure: no DOM, no data file, no stylesheet.
 *
 * The eras are the centuries the recorded years fall in, plus one bucket for the records that hold
 * no year at all. The implementation plan asked for decades; the dataset's years begin in 1669 and
 * end in 2010, and thirty-one decades would be a legend nobody can read — the reference groups its
 * own evolution view into six eras for the same reason. Six keys is a legend; a bucket per year
 * would be a chart.
 *
 * The bucket for a missing year is not "antiquity". Five of the thirteen records without a year
 * name a chemist who isolated the element in the eighteenth or nineteenth century and simply left
 * no date, so calling all thirteen ancient would be a claim the data does not support. It is called
 * `undated`, and a view is free to word that however it likes.
 *
 * The counts are always counted from the array the view is drawing, never declared, so a legend
 * chip and the tiles it dims cannot disagree.
 */

/** The bucket for a record with no year, and the key its tile is painted by. */
export const UNDATED = "undated";

/**
 * The eras, in the order they are read: the dated ones oldest first, then the records without a
 * year.
 *
 * `from` is the first year in the era. The last dated era has no ceiling, because the dataset's
 * newest year is in it and a ceiling written down would be a second opinion about data that
 * already carries the years.
 *
 * @type {{ key: string, label: string, from: number | null }[]}
 */
export const ERAS = [
  { key: "before-1700", label: "Before 1700", from: null },
  { key: "18th-century", label: "18th century", from: 1700 },
  { key: "19th-century", label: "19th century", from: 1800 },
  { key: "20th-century", label: "20th century", from: 1900 },
  { key: "21st-century", label: "21st century", from: 2000 },
  { key: UNDATED, label: "Undated", from: null },
];

/**
 * A record's discovery year, or null when it has none.
 *
 * `Number.isFinite` rather than a truthiness test: a year of 0 is not a discovery in this data, but
 * a truthiness test would also accept the string `"1900"`, and an element discovered in the year
 * named by a string is a parsing bug waiting to happen in a year's arithmetic.
 *
 * @param {object} element
 * @returns {number | null}
 */
export function yearOf(element) {
  const year = element?.discovery?.year;

  return Number.isFinite(year) ? year : null;
}

/**
 * The era a year falls in.
 *
 * @param {number | null} year
 * @returns {string} one of `ERAS`'s keys
 */
export function eraKeyFor(year) {
  if (!Number.isFinite(year)) {
    return UNDATED;
  }

  const century = [...ERAS]
    .reverse()
    .find((era) => era.from !== null && year >= era.from);

  return century ? century.key : "before-1700";
}

/**
 * The era record for an element.
 *
 * @param {object} element
 * @returns {{ key: string, label: string, from: number | null }}
 * @throws {TypeError} when a key cannot be found, which would mean `ERAS` had lost an era
 */
export function eraOf(element) {
  const key = eraKeyFor(yearOf(element));
  const era = ERAS.find((candidate) => candidate.key === key);

  if (!era) {
    throw new TypeError(`No era is declared for ${key}`);
  }

  return era;
}

/**
 * Every era with the number of elements behind it, in reading order.
 *
 * @param {object[]} elements
 * @returns {{ key: string, label: string, from: number | null, count: number }[]}
 */
export function eraCounts(elements) {
  return ERAS.map((era) => ({
    ...era,
    count: elements.filter((element) => eraKeyFor(yearOf(element)) === era.key).length,
  }));
}

/**
 * Every era with its members, for a timeline.
 *
 * Within a dated era the members are ordered by year, so a card reads as the era's own story; the
 * undated era keeps the order it was given, which is the table's atomic order.
 *
 * @param {object[]} elements
 * @returns {{ key: string, label: string, from: number | null, elements: object[] }[]}
 */
export function eraGroups(elements) {
  return ERAS.map((era) => ({
    ...era,
    elements: elements
      .filter((element) => eraKeyFor(yearOf(element)) === era.key)
      .sort((one, other) => (yearOf(one) ?? 0) - (yearOf(other) ?? 0)),
  }));
}

/**
 * The first and last year an era's members were recorded in.
 *
 * Derived from the members rather than from the era's own bounds, because the two are different
 * facts: the eighteenth century is a frame, and `1735–1798` is what actually happened in it.
 *
 * @param {object[]} elements
 * @returns {{ from: number, to: number } | null} null when nothing in the era has a year
 */
export function eraSpan(elements) {
  const years = elements.map(yearOf).filter((year) => year !== null);

  if (years.length === 0) {
    return null;
  }

  return { from: Math.min(...years), to: Math.max(...years) };
}
