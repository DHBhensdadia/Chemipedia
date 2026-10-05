/**
 * The property list: one element's labelled facts, written once and read everywhere.
 *
 * A property value that appears twice on a page is a value that can disagree with itself. So the
 * panel below the hero, the FAQ further down the page and any later ranking page all ask this
 * module for the same row, and a row is rendered by the same formatter from the same units
 * definition every time. The FAQ's answers are not written here — but their *values* are, and a
 * test holds the two blocks to each other.
 *
 * What a row is: a field name in the record, a label a reader recognises, and one of a handful of
 * formats. Unknown values are not skipped. A list with a hole in it would be a different list for
 * every element and a reader could not tell a missing measurement from a missing row, so the row
 * stays and its value is the word for not knowing it.
 *
 * A category arrives as its slug and is printed as its name: `non-metals` is data, `Non-metal` is
 * what a page says, and the translation belongs to the categories repository rather than to a
 * table of names copied into this file.
 *
 * Pure: records in, strings out, no DOM and no data file of its own.
 */

import { attributes, escapeHtml } from "../lib/html.js";
import {
  UNKNOWN,
  capitalise,
  formatList,
  formatMeasurement,
  formatNumber,
  formatSignedInteger,
} from "../lib/format.js";

/**
 * The rows the panel shows, in the order a reader wants them: what identifies the element, then
 * what is true of the atom, then what has been measured about the substance.
 *
 * @type {{ field: string, label: string, format: string }[]}
 */
const ROWS = [
  { field: "atomicNumber", label: "Atomic number", format: "count" },
  { field: "atomicWeight", label: "Atomic weight", format: "measurement" },
  { field: "category", label: "Category", format: "category" },
  { field: "state", label: "State at room temperature", format: "word" },
  { field: "meltingPoint", label: "Melting point", format: "measurement" },
  { field: "boilingPoint", label: "Boiling point", format: "measurement" },
  { field: "heatOfVaporization", label: "Heat of vaporization", format: "measurement" },
  { field: "heatOfFusion", label: "Heat of fusion", format: "measurement" },
  { field: "crystalStructure", label: "Crystal structure", format: "word" },
  { field: "thermalConductivity", label: "Thermal conductivity", format: "measurement" },
  { field: "specificHeat", label: "Specific heat", format: "measurement" },
  { field: "shells", label: "Electron shells", format: "list" },
  { field: "group", label: "Group", format: "count" },
  { field: "period", label: "Period", format: "count" },
  { field: "block", label: "Block", format: "block" },
  { field: "electronConfiguration", label: "Electron configuration", format: "word" },
  { field: "electronegativity", label: "Electronegativity", format: "measurement" },
  { field: "valence", label: "Valence electrons", format: "count" },
  { field: "thermalExpansion", label: "Thermal expansion", format: "measurement" },
  { field: "covalentRadius", label: "Covalent radius", format: "measurement" },
  { field: "atomicRadius", label: "Atomic radius", format: "measurement" },
  { field: "atomicVolume", label: "Atomic volume", format: "measurement" },
  { field: "density", label: "Density", format: "measurement" },
  { field: "electricalConductivity", label: "Electrical conductivity", format: "measurement" },
  { field: "ionizationEnergies", label: "Ionization energies", format: "measurements" },
  { field: "oxidationStates", label: "Oxidation states", format: "signed" },
  { field: "latticeParameters", label: "Lattice parameters", format: "measurements" },
];

/**
 * How a stored value becomes text.
 *
 * Each format takes the value, the unit definition for its field, and the context the value needs
 * to be read in. The context exists for the one format that is not arithmetic: a category is a
 * slug in the record and a name on the page, and the name lives in the categories repository.
 */
const FORMATS = {
  count: (value) => formatNumber(value, { decimals: 0 }) ?? UNKNOWN,
  measurement: (value, definition) => formatMeasurement(value, definition),
  measurements: (value, definition) =>
    formatList(value, (entry) => formatMeasurement(entry, definition)),
  list: (value) => formatList(value),
  signed: (value) => formatList(value, formatSignedInteger),
  word: (value) => capitalise(value) || UNKNOWN,
  block: (value) => (value ? `${value} block` : UNKNOWN),
  category: (value, _definition, { categories }) =>
    categories.find((category) => category.slug === value)?.name ?? UNKNOWN,
};

/**
 * The unit definition for a field, or an empty one when the units data has none.
 *
 * Null rather than a default, from the repository, because a field with no definition is a field
 * whose unit nobody has decided — and printing a bare number as though it were dimensionless is
 * the mistake that makes a definition necessary in the first place.
 *
 * @param {object} units the units repository
 * @param {string} field
 * @returns {{ unit?: string | null, decimals?: number, significant?: number }}
 */
function definitionFor(units, field) {
  return units?.definitionFor(field) ?? {};
}

/**
 * The panel's rows, formatted.
 *
 * @param {object} element
 * @param {{ units: object, categories?: object[] }} options
 * @returns {{ label: string, value: string }[]}
 */
export function propertyRows(element, { units, categories = [] } = {}) {
  return ROWS.map(({ field, label, format }) => ({
    label,
    value: FORMATS[format](element[field], definitionFor(units, field), { element, units, categories }),
  }));
}

/**
 * The same rows, keyed by their label, so another block can quote one without re-deriving it.
 *
 * @param {object} element
 * @param {{ units: object, categories?: object[] }} options
 * @returns {Map<string, string>}
 */
export function propertyValues(element, options) {
  return new Map(propertyRows(element, options).map(({ label, value }) => [label, value]));
}

/**
 * The property panel as markup: the symbol, then every row.
 *
 * The symbol is the one row with no label of its own — it is the panel's heading — and it carries
 * the element's colour key, like the card and the tiles, so the panel is tied to the element's
 * group by the same key the table paints with.
 *
 * @param {{
 *   element: object,
 *   units: object,
 *   categories?: object[],
 *   rowIds?: boolean
 * }} options
 * @returns {string}
 */
export function propertyList({ element, units, categories = [], rowIds = false }) {
  const rows = propertyRows(element, { units, categories });

  const rendered = rows
    .map((row, index) => {
      const id = rowIds ? attributes({ id: `property-${index}` }) : "";
      const valueId = rowIds ? attributes({ id: `property-value-${index}` }) : "";

      return `<div class="properties__row">
<dt class="properties__k"${id}>${escapeHtml(row.label)}</dt>
<dd class="properties__v"${valueId}${attributes({ "data-key": element.category })}>${escapeHtml(row.value)}</dd>
</div>`;
    })
    .join("\n");

  return `<div class="properties">
<div class="properties__head">
<span class="properties__sym"${attributes({ "data-key": element.category })}>${escapeHtml(element.symbol)}</span>
<span class="properties__label">Element symbol</span>
</div>
<dl class="properties__rows">
${rendered}
</dl>
</div>`;
}

/**
 * The particles a neutral atom carries.
 *
 * Protons and electrons are the same number, because an element's atoms are neutral: the count is
 * the atomic number, not a second measurement. There is deliberately no neutron count. Working one
 * out means rounding the atomic weight to the nearest whole number, which is right for hydrogen
 * and wrong for bromine, whose two common isotopes round to forty-five and which has forty-four
 * neutrons in one and forty-six in the other. A number that is wrong for one element and right for
 * the next is worse than no number.
 *
 * @param {object} element
 * @returns {{ label: string, value: number }[]}
 */
export function particleCounts(element) {
  return [
    { label: "Protons", value: element.atomicNumber },
    { label: "Electrons", value: element.atomicNumber },
  ];
}

/**
 * The particle counts as markup.
 *
 * @param {{ element: object }} options
 * @returns {string}
 */
export function countsPanel({ element }) {
  const items = particleCounts(element)
    .map(
      (item) =>
        `<li class="particles__item"><span class="particles__v">${escapeHtml(item.value)}</span>${escapeHtml(item.label)}</li>`,
    )
    .join("\n");

  return `<ul class="particles" aria-label="Particles in ${escapeHtml(element.name)}">
${items}
</ul>`;
}

/**
 * The discovery block's rows.
 *
 * The year is printed as a year and not as a measurement, and an element whose discovery nobody
 * recorded says so on every row rather than disappearing: an empty discovery section would read as
 * a page that forgot to render it.
 *
 * @param {object} element
 * @returns {{ label: string, value: string }[]}
 */
export function discoveryRows(element) {
  const discovery = element.discovery ?? {};

  return [
    { label: "Discovered by", value: capitalise(discovery.discoveredBy) || UNKNOWN },
    { label: "Year", value: formatNumber(discovery.year, { decimals: 0 }) ?? UNKNOWN },
    { label: "Where", value: capitalise(discovery.place) || UNKNOWN },
    { label: "Name origin", value: capitalise(discovery.nameOrigin) || UNKNOWN },
  ];
}

/**
 * The discovery block as markup.
 *
 * @param {{ element: object }} options
 * @returns {string}
 */
export function discoveryList({ element }) {
  const rows = discoveryRows(element)
    .map(
      (row) => `<div class="discovery__row">
<dt class="discovery__k">${escapeHtml(row.label)}</dt>
<dd class="discovery__v">${escapeHtml(row.value)}</dd>
</div>`,
    )
    .join("\n");

  return `<dl class="discovery">
${rows}
</dl>`;
}
