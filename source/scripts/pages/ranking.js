/**
 * The melting-point and boiling-point rankings — one module behind both pages.
 *
 * The two pages are the same page about two different measurements, so the difference between them
 * is data: the route says which field it ranks (`ranking: { field, direction }`, plain data in the
 * manifest) and this module does the rest. A third ranking would be one line in the manifest.
 *
 * The order is the data layer's own. `sortedBy` in the elements repository already answers this
 * question — unknowns last in both directions, ties in atomic order — so this module asks for that
 * comparison rather than sorting the records itself, which is what keeps a ranking page and a
 * repository query from disagreeing about where a missing measurement goes.
 *
 * The direction is ascending on both pages because that is what the route descriptions promised: a
 * ranking that runs from the lowest measurement to the highest, so the two ends of the scale — the
 * gas that melts first, the element that refuses to — are the first and last rows.
 */

import { barRanking, hasValue } from "../components/bar-ranking.js";
import { compareByField } from "../data/elements-repository.js";

/**
 * The elements in rank order.
 *
 * @param {object[]} elements
 * @param {{ field: string, direction?: "ascending" | "descending" }} options
 * @returns {object[]}
 */
export function rankedElements(elements, { field, direction = "ascending" }) {
  return [...elements].sort(compareByField(field, { direction }));
}

/**
 * Every block a ranking page's template asks for.
 *
 * @param {{ route: object, elements: object[], units?: object }} options
 * @returns {{ rows: string, measured: string, missing: string, total: string }}
 * @throws {TypeError} when the route names no field, or names one no record carries — either way
 *   the build would otherwise render 118 rows of "Unknown" and call it a page
 */
export function rankingPageValues({ route, elements, units }) {
  const { field, direction = "ascending" } = route?.ranking ?? {};

  if (typeof field !== "string" || field === "") {
    throw new TypeError(`${route?.path ?? "A ranking route"} names no field to rank by`);
  }

  if (!elements.some((element) => field in element)) {
    throw new TypeError(`No element record carries a ${field} to rank by`);
  }

  const ranked = rankedElements(elements, { field, direction });
  const measured = ranked.filter((element) => hasValue(element, field)).length;

  return {
    rows: barRanking({ elements: ranked, field, units }),
    measured: String(measured),
    missing: String(ranked.length - measured),
    total: String(ranked.length),
  };
}
