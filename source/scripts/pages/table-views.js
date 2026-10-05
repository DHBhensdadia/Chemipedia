/**
 * The four alternate table views — one module behind all four pages.
 *
 * Each page is the same table answering a different question, so this module is one table renderer
 * and four sets of words: the mode the tiles are coloured by, the line printed under the legend, and
 * — for the two views whose question needs more than a note — the section that follows the table.
 *
 *   properties-and-states  what each element is at 20 °C
 *   orbitals               which subshell each element's last electron fills
 *   electronegativity      how hard each element pulls on a shared pair of electrons
 *   evolution              which century each element was first recognised in
 *
 * The mode is a property of the view rather than of the route, so it lives beside the words it
 * belongs to. A route that named it as well would be a second place to write the same fact, and
 * nothing reads it: the browser learns the mode from the rendered table's own `data-mode`.
 *
 * Two rules run through the module. The first is that a page of data is written at build time: the
 * table, its legend and its note are in the finished document, so a cold load and a crawler see all
 * 118 tiles, and `startTableViews` only lays the behaviour over what is already there. The second is
 * that a claim about the data is derived from the data: the counts in the notes, the ends of the
 * electronegativity scale and the century an element is painted by are all read off the records, so
 * correcting a record changes the sentence instead of quietly contradicting it.
 *
 * Nothing here touches the DOM at build time — `tableViewPageValues` is a pure function of the
 * records, which is what lets the test suite call it and count what it produced.
 */

import { eraTimeline } from "../components/era-timeline.js";
import { attachPeriodicTable, renderPeriodicTable } from "../components/periodic-table.js";
import { createElementsRepository } from "../data/elements-repository.js";
import { eraGroups, yearOf } from "../lib/discovery.js";
import { electronegativitySummary } from "../lib/electronegativity.js";
import { formatMeasurement } from "../lib/format.js";
import { createGrid } from "../lib/grid.js";
import { attributes, escapeHtml } from "../lib/html.js";

/** The seven rows of the table's main body; the two detached f rows are drawn outside them. */
const MAIN_ROWS = 7;

/** The band of melting points the states note describes: solid in a cold room, liquid in a warm one. */
export const MELT_BAND = { from: 0, to: 40 };

/** The units definition for a field, or an empty one when the units data has none. */
const definitionFor = (units, field) => units?.definitionFor(field) ?? {};

/**
 * A list as a sentence fragment: `a, b and c`.
 *
 * @param {string[]} items
 * @returns {string}
 */
function sentenceList(items) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * The elements that are solid at a cold room temperature and liquid in a warm one.
 *
 * The band is the page's own question — the route promises "the elements that change state near it"
 * — and it is derived rather than listed, so a corrected melting point moves an element in or out of
 * the sentence instead of leaving the sentence wrong.
 *
 * @param {object[]} elements
 * @param {{ from?: number, to?: number }} [band]
 * @returns {object[]} ascending by melting point
 */
export function meltingNear(elements, { from = MELT_BAND.from, to = MELT_BAND.to } = {}) {
  return elements
    .filter(
      (element) =>
        typeof element.meltingPoint === "number" &&
        element.meltingPoint >= from &&
        element.meltingPoint < to,
    )
    .sort((one, other) => one.meltingPoint - other.meltingPoint);
}

/**
 * The line under the state legend: the two liquids, and the solids a warm room would melt.
 *
 * @param {object[]} elements
 * @param {object} [units]
 * @returns {string}
 */
export function stateNote(elements, units) {
  const liquids = elements.filter((element) => element.state === "liquid");
  const near = meltingNear(elements);
  const temperature = (element) =>
    formatMeasurement(element.meltingPoint, definitionFor(units, "meltingPoint"));
  const liquidNames = sentenceList(liquids.map((element) => element.name.toLowerCase()));
  const nearNames = sentenceList(
    near.map((element) => `${element.name.toLowerCase()} at ${temperature(element)}`),
  );
  const liquidPart = liquids.length
    ? `Only ${liquids.length} ${liquids.length === 1 ? "element is" : "elements are"} liquid at 20 °C (${liquidNames})`
    : "No element is liquid at 20 °C";
  const nearPart = near.length
    ? `${near.length === 1 ? "one more is" : `${near.length} more are`} solid only in a cold room: ${nearNames}`
    : "no other element is solid at 20 °C and liquid in a warm room";

  return `${liquidPart}, and ${nearPart}. Point at a state to pick its elements out of the table.`;
}

/**
 * The block a drawn column belongs to.
 *
 * The table's own layout, not the record: the detached rows are the f block, the first two columns
 * are s, the last six are p, and the ten between them are d.
 *
 * @param {object} element
 * @returns {string}
 */
export function drawnBlock(element) {
  const { row, column } = element.position ?? {};

  if (row > MAIN_ROWS) {
    return "f";
  }

  if (column <= 2) {
    return "s";
  }

  return column >= 13 ? "p" : "d";
}

/**
 * The elements drawn in a column that their own record's block does not own.
 *
 * @param {object[]} elements
 * @returns {object[]}
 */
export function outsideTheirBlock(elements) {
  return elements.filter((element) => drawnBlock(element) !== element.block);
}

/**
 * The exception clause of the block note, worded for however many exceptions there are.
 *
 * @param {object[]} outside
 * @returns {string}
 */
function outsideSentence(outside) {
  if (outside.length === 0) {
    return "Every element is drawn in the column its own block owns.";
  }

  if (outside.length === 1) {
    const [element] = outside;

    return `${element.name} is the one exception: it is drawn in the ${drawnBlock(element)}-block's column, and its own configuration files it under ${element.block}.`;
  }

  return `${outside.length} elements are drawn in a column their own block does not own: ${sentenceList(
    outside.map((element) => element.name.toLowerCase()),
  )}.`;
}

/**
 * The line under the block legend: what the counts are, and the element drawn outside its block.
 *
 * @param {object[]} elements
 * @returns {string}
 */
export function blockNote(elements) {
  return `Every one of the ${elements.length} configurations ends in a subshell of the block it is filed under, so the legend's counts are the configuration's own arithmetic. ${outsideSentence(
    outsideTheirBlock(elements),
  )} Point at a block to pick its elements out of the table.`;
}

/**
 * The line under the electronegativity scale: how many records have no value, and where they sit.
 *
 * @param {object[]} elements
 * @returns {string}
 */
export function missingNote(elements) {
  const { measured, missing, before, trail } = electronegativitySummary(elements);

  if (trail.length === 0) {
    return `Every one of the ${elements.length} elements carries a Pauling value.`;
  }

  const names = sentenceList(before.map((element) => element.name.toLowerCase()));

  return `${missing} of the ${elements.length} elements carry no Pauling value: ${before.length} below ${trail[0].name.toLowerCase()} — ${names} — and every element from ${trail[0].name.toLowerCase()} to ${trail.at(-1).name.toLowerCase()}.`;
}

/**
 * The evolution view's line: how many records have no year, and how many of those no discoverer.
 *
 * @param {object[]} elements
 * @returns {string}
 */
export function evolutionNote(elements) {
  const undated = elements.filter((element) => yearOf(element) === null);
  const anonymous = undated.filter((element) => !element.discovery?.discoveredBy);

  return `${undated.length} elements carry no recorded year and keep the legend's grey; ${anonymous.length} of them have no discoverer in the record either. Point at an era to pick its elements out of the table.`;
}

/**
 * One row of the trend section's list: where an element sits at one end of the scale.
 *
 * @param {{ rank: string, element: object, value: string }} options
 * @returns {string}
 */
function endRow({ rank, element, value }) {
  return `<li class="end"><span class="end__rank">${escapeHtml(rank)}</span><a${attributes({
    class: "end__element",
    href: `/elements/${element.slug}/`,
    "data-key": element.category,
    "aria-label": `${element.name}, electronegativity ${value}`,
  })}><span class="end__sym" aria-hidden="true">${escapeHtml(element.symbol)}</span><span class="end__name">${escapeHtml(element.name)}</span></a><span class="end__value">${escapeHtml(value)}</span></li>`;
}

/**
 * The electronegativity trend: what the scale measures, how it moves, and what it does not have.
 *
 * Every figure in the section is read off the records — the two ends, the periods that rise at every
 * step, the groups that never rise, and which elements have no value at all — so a corrected value
 * changes the sentence. A set with almost nothing measured returns nothing rather than a paragraph
 * about a scale with no ends.
 *
 * @param {{ elements: object[], units?: object }} options
 * @returns {string}
 */
export function trendSection({ elements, units }) {
  const { measured, missing, ascending, risingPeriods, groups, before, trail } =
    electronegativitySummary(elements);

  if (ascending.length < 4) {
    return "";
  }

  const value = (element) =>
    formatMeasurement(element.electronegativity, definitionFor(units, "electronegativity"));
  const name = (element) => element.name.toLowerCase();
  const rising = risingPeriods.map(
    ({ period, row }) =>
      `period ${period} from ${value(row[0])} at ${name(row[0])} to ${value(row.at(-1))} at ${name(row.at(-1))}`,
  );
  const ends = [
    { rank: "Highest", element: ascending.at(-1) },
    { rank: "Next highest", element: ascending.at(-2) },
    { rank: "Next lowest", element: ascending.at(1) },
    { rank: "Lowest", element: ascending.at(0) },
  ];
  const missingSentence =
    trail.length === 0
      ? `Every one of the ${elements.length} elements carries a Pauling value.`
      : `The ${missing} elements with no value are ${before.length} below ${name(trail[0])} — ${sentenceList(before.map(name))} — and every element from ${name(trail[0])} to ${name(trail.at(-1))}.`;

  return `<p>The scale runs from ${escapeHtml(value(ends[3].element))} at ${escapeHtml(name(ends[3].element))} to ${escapeHtml(value(ends[0].element))} at ${escapeHtml(name(ends[0].element))}, on the Pauling scale. ${measured} of the ${elements.length} elements carry a value.</p>
<p>The pull strengthens across a period — ${escapeHtml(sentenceList(rising))} — and weakens down a group: ${groups.falling} of the ${groups.checked} groups with three or more measured values never rise from top to bottom. The transition metals are where the pattern strains, because their d electrons are drawn from a shell below the surface, so the value barely moves across the middle ten columns and sometimes slips back.</p>
<p>${escapeHtml(missingSentence)}</p>
<ul class="ends" data-mode="group">
${ends.map(({ rank, element }) => endRow({ rank, element, value: value(element) })).join("\n")}
</ul>`;
}

/** One sentence per era, ours. Keyed by the era key `lib/discovery` assigns. */
const ERA_BLURBS = {
  "before-1700":
    "Phosphorus and fluorine: the two elements isolated before the eighteenth century had a chemistry to do it in.",
  "18th-century":
    "Once chemists began weighing what they collected, the useful metals and the gases arrived in a run — cobalt and platinum in 1735, hydrogen in 1766, oxygen in 1774.",
  "19th-century":
    "Electrolysis and then spectroscopy opened the floodgates: sodium and potassium in 1807, and the rare earths one at a time for the rest of the century.",
  "20th-century":
    "The last naturally occurring elements were found and the first synthetic ones were made — technetium in 1937, then the transuranium elements one target at a time.",
  "21st-century":
    "Five elements made and named in the table's final decade and a half, closing the seventh period.",
  undated:
    "Thirteen elements with no year in the record: the eight metals worked before anyone could call them elements, and five that a named chemist isolated without leaving a date.",
};

/**
 * The evolution view's timeline, drawn from the same eras the tiles are keyed by.
 *
 * @param {object[]} elements
 * @returns {string}
 */
export function eraTimelineSection(elements) {
  return eraTimeline({ groups: eraGroups(elements), blurbs: ERA_BLURBS });
}

/** The note written under each mode's table, keyed by the mode the view draws with. */
const MODE_NOTES = {
  state: stateNote,
  block: blockNote,
  electronegativity: missingNote,
  discovery: evolutionNote,
};

/**
 * The four views, each with the mode its tiles are coloured by.
 *
 * @type {Record<string, { mode: "state" | "block" | "electronegativity" | "discovery" }>}
 */
export const VIEWS = {
  "properties-and-states": { mode: "state" },
  orbitals: { mode: "block" },
  electronegativity: { mode: "electronegativity" },
  evolution: { mode: "discovery" },
};

/**
 * A view's note, as the paragraph the template places after its table.
 *
 * The note sits below the table rather than above it, which is where the reference puts its own: the
 * line belongs to the picture the reader has just looked at, and a paragraph of counts between the
 * legend and the tiles pushes the table down the page by its own height.
 *
 * @param {object[]} elements
 * @param {"state" | "block" | "electronegativity" | "discovery"} mode
 * @param {object} [units]
 * @returns {string}
 */
export function viewNote(elements, mode, units) {
  const note = MODE_NOTES[mode];

  if (!note) {
    throw new TypeError(`No note is written for the ${mode} view`);
  }

  return `<p class="tv-note">${escapeHtml(note(elements, units))}</p>`;
}

/**
 * Every block a table view's template asks for.
 *
 * @param {{ route: object, elements: object[], categories?: object[], units?: object }} options
 * @returns {{ table: string, note: string, trend?: string, eras?: string }}
 * @throws {TypeError} when the route is not one of the four views, which would otherwise render a
 *   page of tiles coloured by nothing
 */
export function tableViewPageValues({ route, elements, categories = [], units }) {
  const view = VIEWS[route?.template];

  if (!view) {
    throw new TypeError(`${route?.path ?? "A table view route"} is not one of the four views`);
  }

  const values = {
    table: renderPeriodicTable({ elements, categories, mode: view.mode }),
    note: viewNote(elements, view.mode, units),
  };

  if (view.mode === "electronegativity") {
    values.trend = trendSection({ elements, units });
  }

  if (view.mode === "discovery") {
    values.eras = eraTimelineSection(elements);
  }

  return values;
}

/**
 * Bring a built view to life: the arrow keys and the legend's isolation, over the markup the build
 * already wrote.
 *
 * The mode is not passed in. The browser reads it from the table's own `data-mode`, and the only
 * thing the behaviour needs beyond that is the grid, which is the layout of the elements the page
 * was rendered from — the same `lib/grid.js` model, so focus and layout cannot disagree about where
 * a tile is.
 *
 * @param {Document} [root]
 * @returns {Promise<() => void>} teardown
 */
export async function startTableViews(root = document) {
  const host = root.querySelector("[data-table-view]");

  if (!host) {
    return () => {};
  }

  const elements = await createElementsRepository();

  return attachPeriodicTable(host, { model: createGrid(elements.all()) });
}
