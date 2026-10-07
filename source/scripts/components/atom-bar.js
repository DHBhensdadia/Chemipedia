/**
 * The bar under the atom: the element's card, its three counts, its speed and its legend.
 *
 * Markup only, with no behaviour of its own: the build renders this into the page and
 * `pages/atoms.js` finds the controls by the ids below and wires them. That split is the project's
 * usual one — a page is a finished document before any script runs — and it is what makes "the bar
 * works with the script off" a fact rather than a wish: the card, the three counts and the legend
 * are all there, and the number fields still accept a typed count.
 *
 * Three decisions are worth the reading:
 *
 *   1. **Every control is a native control.** A `<select>`, three `<input type="number">` with their
 *      own labels, a `<input type="range">`, and `<button>`s — so the bar is keyboard-operable and
 *      readable by a screen reader without inventing a single ARIA role. The ids are exported so the
 *      page cannot drift from the markup, and a test holds the two together.
 *   2. **The counts are the page's ceilings, and the page's rules.** Protons stop at 118 — the last
 *      element — while neutrons and electrons go past anything an element has, because the point of
 *      the page is to watch what an unusual atom does. The heaviest atom these allow is measured in
 *      `docs/research/05-atom-renderer-measurements.md`.
 *   3. **The legend's dots are painted from the token layer.** Each one carries `--dot` as a
 *      reference to the same custom property the renderer reads, so the key beside the atom cannot
 *      disagree with the atom.
 */

import { attributes, escapeHtml } from "../lib/html.js";

/** The ids the page's behaviour looks its controls up by. */
export const ATOM_CONTROLS = {
  picker: "atom-picker",
  protons: "atom-protons",
  neutrons: "atom-neutrons",
  electrons: "atom-electrons",
  speed: "atom-speed",
  shake: "atom-shake",
  reset: "atom-reset",
  motion: "atom-motion",
  link: "atom-element-link",
  name: "atom-name",
};

/** The most protons the controls offer: the last element in the table. */
export const PROTON_LIMIT = 118;

/** How far the free counts go. Past every element, and short of the point where the stage suffers. */
export const NEUTRON_LIMIT = 300;
export const ELECTRON_LIMIT = 200;

/** The three particles, in the order the bar lists them: the key to the colours on the stage. */
const LEGEND = [
  { name: "proton", label: "Protons", dot: "--atom-proton" },
  { name: "neutron", label: "Neutrons", dot: "--atom-neutron" },
  { name: "electron", label: "Electrons", dot: "--atom-electron" },
];

/**
 * One count: a minus, the field itself, a plus, and the letter a reader recognises it by.
 *
 * @param {object} options
 * @param {string} options.id the field's own id
 * @param {string} options.name the field's name and the particle it counts
 * @param {string} options.label the accessible label
 * @param {number} options.value
 * @param {number} options.max
 * @returns {string}
 */
function stepper({ id, name, label, value, max }) {
  const step = (direction, glyph, said) =>
    `<button class="at-bar__step" type="button" data-atom-step="${name}" data-atom-by="${direction}" ` +
    `aria-label="${escapeHtml(said)}">${glyph}</button>`;

  return `<span class="at-bar__stepper">
      ${step(-1, "\u2212", `One ${name} fewer`)}
      <label class="visually-hidden" for="${id}">${escapeHtml(label)}</label>
      <input class="at-bar__number" id="${id}" name="${name}" type="number" inputmode="numeric"
        min="0" max="${max}" step="1" value="${value}">
      ${step(1, "+", `One ${name} more`)}
      <span class="at-bar__control-label" aria-hidden="true">${escapeHtml(name.slice(0, 1))}</span>
    </span>`.replace(/\n\s+/g, "\n      ");
}

/**
 * The whole bar, as markup.
 *
 * @param {object} options
 * @param {object} options.record the element the page opens on, for the card and the picker
 * @param {{ protons: number, neutrons: number, electrons: number }} options.counts
 * @param {object[]} options.elements every record, in atomic order, for the picker
 * @param {number} [options.speed]
 * @returns {string}
 */
export function atomBar({ record, counts, elements, speed = 1 }) {
  const options = elements
    .map(
      (element) =>
        `<option value="${element.atomicNumber}"${
          element.atomicNumber === record.atomicNumber ? " selected" : ""
        }>${escapeHtml(`${element.symbol} · ${element.name}`)}</option>`,
    )
    .join("\n        ");
  const legend = LEGEND.map(
    (part) =>
      `<li class="at-bar__legend-item" style="--dot: var(${part.dot})">` +
      `<span class="at-bar__dot" aria-hidden="true"></span>${escapeHtml(part.label)}</li>`,
  ).join("\n      ");

  return `  <p class="at-bar__card">
    <a class="at-bar__symbol" id="${ATOM_CONTROLS.link}" href="/elements/${escapeHtml(record.slug)}/"
      >${escapeHtml(record.symbol)}</a>
    <span class="at-bar__name" id="${ATOM_CONTROLS.name}"
      >${escapeHtml(`${record.name} · ${record.symbol}-${counts.protons + counts.neutrons}`)}</span>
  </p>
  <fieldset class="at-bar__counts">
    <legend class="visually-hidden">Protons, neutrons and electrons</legend>
    ${stepper({
      id: ATOM_CONTROLS.protons,
      name: "protons",
      label: "Protons",
      value: counts.protons,
      max: PROTON_LIMIT,
    })}
    ${stepper({
      id: ATOM_CONTROLS.neutrons,
      name: "neutrons",
      label: "Neutrons",
      value: counts.neutrons,
      max: NEUTRON_LIMIT,
    })}
    ${stepper({
      id: ATOM_CONTROLS.electrons,
      name: "electrons",
      label: "Electrons",
      value: counts.electrons,
      max: ELECTRON_LIMIT,
    })}
  </fieldset>
  <span class="at-bar__speed">
    <label class="at-bar__control-label" for="${ATOM_CONTROLS.speed}">Speed</label>
    <input class="at-bar__slider" id="${ATOM_CONTROLS.speed}" type="range" min="0" max="5" step="0.5"
      value="${speed}">
  </span>
  <span class="at-bar__buttons">
    <button class="at-bar__button" type="button" id="${ATOM_CONTROLS.shake}">Shake</button>
    <button class="at-bar__button" type="button" id="${ATOM_CONTROLS.reset}">Reset view</button>
    <button class="at-bar__button" type="button" id="${ATOM_CONTROLS.motion}"${attributes({
      "aria-pressed": "false",
    })}>Pause</button>
  </span>
  <ul class="at-bar__legend">
    <li class="at-bar__legend-item at-bar__legend-title">Legend</li>
    ${legend}
  </ul>
  <label class="at-bar__legend-title" for="${ATOM_CONTROLS.picker}">Element
    <select class="at-bar__select" id="${ATOM_CONTROLS.picker}">
        ${options}
    </select>
  </label>`;
}
