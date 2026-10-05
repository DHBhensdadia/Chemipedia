/**
 * The orbital configurations page — every element's configuration, grouped by block.
 *
 * The four blocks are the table's own shape: s on the left, p on the right, d across the middle
 * ten columns, f in the two detached rows at the foot. Grouping the configurations that way is
 * what makes the page answer its question — why the table looks the way it does — rather than
 * being a second list of the 118 in atomic order.
 *
 * The page makes one claim of its own, and it is derived rather than asserted: the elements whose
 * configurations differ from the order a simple energy rule predicts. `lib/electron-configuration`
 * works that out from the records themselves, so the count and the list are the dataset's answers
 * and a corrected configuration changes the page instead of quietly contradicting it.
 *
 * Nothing here touches the DOM: this is a build-time renderer, like the element family's, which is
 * what lets the test suite call it and count what it produced.
 */

import { attributes, escapeHtml } from "../lib/html.js";
import { UNKNOWN } from "../lib/format.js";
import { irregularElements } from "../lib/electron-configuration.js";

/**
 * The four blocks, in the order the table lays them out, each with the sentence that says what the
 * block is. The notes are ours: they describe the shape of the table, not the reference's copy.
 *
 * @type {{ key: string, name: string, note: string }[]}
 */
export const BLOCKS = [
  {
    key: "s",
    name: "s block",
    note: "The outermost electron is in an s subshell: the two left-hand columns, and helium, whose first shell is full at two.",
  },
  {
    key: "p",
    name: "p block",
    note: "The outer p subshell is filling across the six right-hand columns, closing at the noble gas that ends each period.",
  },
  {
    key: "d",
    name: "d block",
    note: "The transition metals, where a d subshell one shell below the surface fills across ten columns.",
  },
  {
    key: "f",
    name: "f block",
    note: "The lanthanides and actinides, filling an f subshell two shells below the surface, drawn as two rows of their own.",
  },
];

/**
 * One element's row: the symbol, the name and the atomic number, then its configuration.
 *
 * The configuration is printed exactly as the record holds it, because it is notation rather than a
 * measurement: there is no unit to attach and no figures to round.
 *
 * @param {object} element
 * @returns {string}
 */
export function configurationRow(element) {
  const label = `${element.name}, symbol ${element.symbol}, atomic number ${element.atomicNumber}`;

  return `<li class="cfg__row"${attributes({ "data-key": element.category })}>
<a class="cfg__element" href="/elements/${escapeHtml(element.slug)}/"${attributes({ "aria-label": label })}><span class="cfg__sym">${escapeHtml(element.symbol)}</span><span class="cfg__name">${escapeHtml(element.name)}</span><span class="cfg__z">${escapeHtml(element.atomicNumber)}</span></a>
<span class="cfg__notation">${escapeHtml(element.electronConfiguration ?? UNKNOWN)}</span>
</li>`;
}

/**
 * A list of elements with their configurations.
 *
 * @param {object[]} elements
 * @returns {string}
 */
export function configurationList(elements) {
  return `<ul class="cfg__list">
${elements.map(configurationRow).join("\n")}
</ul>`;
}

/**
 * One block: its heading, its count, the sentence that describes it, and its elements.
 *
 * @param {{ block: { key: string, name: string, note: string }, elements: object[] }} options
 * @returns {string}
 */
export function configurationBlock({ block, elements }) {
  return `<section class="cfg__block">
<h2 class="cfg__title">${escapeHtml(block.name)}<span class="cfg__count">${elements.length} elements</span></h2>
<p class="cfg__note">${escapeHtml(block.note)}</p>
${configurationList(elements)}
</section>`;
}

/**
 * The elements whose configurations do not fill in the predicted order.
 *
 * The list is worth the space because it is the exception a reader is told about and then shown:
 * a page that says "the rule has exceptions" without naming them is a page that has taught nothing.
 *
 * @param {{ elements: object[], irregular?: object[] }} options
 * @returns {string}
 */
export function irregularitiesSection({ elements, irregular = irregularElements(elements) }) {
  if (irregular.length === 0) {
    return "";
  }

  return `<section class="cfg__block cfg__block--irregular">
<h2 class="cfg__title">Where the filling order bends<span class="cfg__count">${irregular.length} elements</span></h2>
<p class="cfg__note">The order the subshells fill in is a rule with exceptions. These elements hold their electrons differently from the way a simple energy order predicts — most often because a half-filled or filled subshell below the surface is the steadier arrangement, which is why chromium and copper are the familiar pair.</p>
${configurationList(irregular)}
</section>`;
}

/**
 * Every block the page's template asks for: the four blocks in table order, then the exception.
 *
 * @param {{ elements: object[] }} options
 * @returns {{ blocks: string }}
 */
export function configurationPageValues({ elements }) {
  const sections = BLOCKS.map((block) =>
    configurationBlock({
      block,
      elements: elements.filter((element) => element.block === block.key),
    }),
  );

  sections.push(irregularitiesSection({ elements }));

  return { blocks: sections.filter(Boolean).join("\n") };
}
