/**
 * The element detail page — one module behind all 118 URLs.
 *
 * This is a family's renderer, not a page that boots. The element pages carry no behaviour of
 * their own: the table's engine, the finder and the router are the site's interactive parts, and
 * an element page is content — the whole point of it is that a reader, a crawler or a curl sees
 * the same complete page. So this module's one job is to turn a record into the markup the
 * template's placeholders ask for, and it runs at build time, in Node, through the build's
 * renderers. Nothing here touches the DOM, which is what lets the test suite call it directly.
 *
 * Each value is one block of the page, and each block is composed from a component or from the
 * record's own prose. Two rules hold across all of them:
 *
 *   - a value that appears twice is computed once. The FAQ's answers come from the same formatter
 *     and the same units as the property panel's rows, and the shell diagram and the panel both
 *     read `shells`.
 *   - every string that reaches markup is escaped in this file. The template is trusted; the data
 *     is not, and a summary with an ampersand in it must not become an entity by accident.
 *
 * The mini table is drawn from `lib/grid.js` through the tile component rather than through the
 * table engine: it is a figure, not a control. Its tiles are links a mouse can follow — the same
 * destination, the same accessible name — but they are all out of the tab order, because a reader
 * tabbing through a page should meet the 118 elements in the index, not in a diagram on the way
 * past.
 */

import { faqBlock } from "../components/faq-block.js";
import { propertyList, countsPanel, discoveryList } from "../components/property-list.js";
import { shellDiagram, shellSummary } from "../components/shell-diagram.js";
import { elementTile } from "../components/element-tile.js";
import { createGrid } from "../lib/grid.js";
import { attributes, escapeHtml } from "../lib/html.js";
import { UNKNOWN } from "../lib/format.js";

/** How many siblings the "other elements" row shows before it stops. */
export const SIMILAR_LIMIT = 12;

/**
 * The elements before and after this one, wrapping at both ends.
 *
 * Wrapping is not an edge case to tolerate: the table is a cycle in the sense that a reader
 * browsing element by element wants to keep going rather than stop at the first or the last. So
 * hydrogen's previous element is oganesson and oganesson's next is hydrogen, which is also what the
 * reference does.
 *
 * @param {object[]} elements every record
 * @param {number} atomicNumber the element being rendered
 * @returns {{ previous: object | null, next: object | null }}
 */
export function neighbouringElements(elements, atomicNumber) {
  const ordered = [...elements].sort((one, other) => one.atomicNumber - other.atomicNumber);
  const index = ordered.findIndex((element) => element.atomicNumber === atomicNumber);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: ordered[(index - 1 + ordered.length) % ordered.length],
    next: ordered[(index + 1) % ordered.length],
  };
}

/**
 * The elements beside this one: same category, atomic order, this element left out.
 *
 * The limit is a page decision, not a data one. A transition-metal page has thirty-four siblings
 * and a row of thirty-four tiles is a wall; the twelve nearest in atomic order are the twelve a
 * reader is most likely to want, and the group pages exist for the whole family.
 *
 * @param {object} element
 * @param {object[]} elements
 * @param {{ limit?: number }} [options]
 * @returns {object[]}
 */
export function similarElements(element, elements, { limit = SIMILAR_LIMIT } = {}) {
  return elements
    .filter((other) => other.category === element.category && other.atomicNumber !== element.atomicNumber)
    .sort((one, other) => one.atomicNumber - other.atomicNumber)
    .slice(0, limit);
}

/**
 * The strip above the hero: the previous element, this one, and the next.
 *
 * It takes the shell band's place on purpose — the element pages carry no submenu, so the same row
 * of the page tells a reader where they are among the 118 instead of offering the section's other
 * pages.
 *
 * @param {{ element: object, previous: object | null, next: object | null }} options
 * @returns {string}
 */
export function elementStrip({ element, previous, next }) {
  const link = (neighbour, relation) =>
    neighbour
      ? `<a class="el-strip__item" href="/elements/${neighbour.slug}/" rel="${relation}"><span class="el-strip__name">${escapeHtml(neighbour.name)}</span><span class="el-strip__z">${escapeHtml(neighbour.atomicNumber)}</span></a>`
      : "";

  return `<nav class="el-strip" aria-label="Elements">
<div class="shell el-strip__inner">
${link(previous, "prev")}
<span class="el-strip__item el-strip__item--current"${attributes({ "data-key": element.category })} aria-current="page"><span class="el-strip__name">${escapeHtml(element.name)}</span><span class="el-strip__z">${escapeHtml(element.atomicNumber)}</span></span>
${link(next, "next")}
</div>
</nav>`;
}

/**
 * The mini table: the whole periodic table small, with this element picked out.
 *
 * The caption is the figure's accessible name and is visually hidden, because the diagram is an
 * orientation aid beside the hero card, not a control: a reader who wants the table has the home
 * page, and a reader who wants another element has the strip above and the row below.
 *
 * @param {{ element: object, elements: object[] }} options
 * @returns {string}
 */
export function elementMiniTable({ element, elements }) {
  const model = createGrid(elements);
  const caption = `Position of ${element.name} in the periodic table`;

  const tiles = model.cells
    .map((cell) =>
      elementTile({
        element: cell.element,
        key: cell.element.category,
        compact: true,
        tabbable: false,
        current: cell.element.atomicNumber === element.atomicNumber,
      }),
    )
    .join("\n");

  return `<div class="pt pt--mini" data-mode="group">
<div class="pt__grid pt__grid--mini" role="img" aria-label="${escapeHtml(caption)}">
${tiles}
</div>
</div>`;
}

/**
 * The hero: the element's card and the table it sits in.
 *
 * @param {{ element: object, elements: object[] }} options
 * @returns {string}
 */
export function elementHero({ element, elements }) {
  const caption = `Position of ${element.name} in the periodic table`;

  return `<section class="el-hero"${attributes({ "data-key": element.category })}>
<div class="shell el-hero__inner">
<div class="el-hero__card">
<span class="el-card"${attributes({ "data-key": element.category })} aria-hidden="true"><span class="el-card__z">${escapeHtml(element.atomicNumber)}</span><span class="el-card__sym">${escapeHtml(element.symbol)}</span></span>
</div>
<figure class="el-hero__table">
${elementMiniTable({ element, elements })}
<figcaption class="visually-hidden">${escapeHtml(caption)}</figcaption>
</figure>
</div>
<span class="el-hero__line" aria-hidden="true"></span>
</section>`;
}

/**
 * The page's heading: the element's name and how it is said.
 *
 * @param {{ element: object }} options
 * @returns {string}
 */
export function elementHeadline({ element }) {
  return `<div class="el-headline">
<h1 class="el-name" id="element-name">${escapeHtml(element.name)}</h1>
<p class="el-say"><span class="el-say__k">Pronounced</span><span class="el-say__v"${attributes({ "data-key": element.category })}>${escapeHtml(element.pronunciation ?? UNKNOWN)}</span></p>
</div>`;
}

/**
 * The blocks below the FAQ: what the element is used for, where it comes from, and who found it.
 *
 * @param {{ element: object }} options
 * @returns {string}
 */
export function elementSections({ element }) {
  const prose = (title, text) =>
    `<section class="el-section">
<h2 class="el-section__title">${escapeHtml(title)}</h2>
<div class="el-prose"><p>${escapeHtml(text ?? UNKNOWN)}</p></div>
</section>`;

  return `${prose("Uses", element.uses)}
${prose("Sources", element.sources)}
<section class="el-section">
<h2 class="el-section__title">Discovery</h2>
${discoveryList({ element })}
</section>`;
}

/**
 * The orbital figure: the shell diagram and the configuration it draws.
 *
 * @param {{ element: object }} options
 * @returns {string}
 */
export function elementOrbital({ element }) {
  const diagram = shellDiagram({
    shells: element.shells,
    label: `Electron shell diagram for ${element.name}: ${shellSummary(element.shells)} electrons per shell`,
  });

  if (diagram === "") {
    return "";
  }

  return `<figure class="el-orbital">
${diagram}
<figcaption class="el-orbital__caption">Electron configuration — ${escapeHtml(element.electronConfiguration ?? UNKNOWN)}</figcaption>
</figure>`;
}

/**
 * The siblings row: other elements of the same kind.
 *
 * @param {{ element: object, siblings: object[], category: object | null }} options
 * @returns {string} an empty string when this element has no siblings
 */
export function elementSimilar({ element, siblings, category }) {
  if (siblings.length === 0) {
    return "";
  }

  const name = (category?.name ?? "element").toLowerCase();
  const tiles = siblings
    .map(
      (sibling) => `<li><a class="el-similar__tile" href="/elements/${sibling.slug}/"${attributes({ "data-key": sibling.category })} title="${escapeHtml(sibling.name)} · ${escapeHtml(sibling.symbol)} · ${escapeHtml(sibling.atomicNumber)}"><span class="el-similar__z">${escapeHtml(sibling.atomicNumber)}</span><span class="el-similar__sym">${escapeHtml(sibling.symbol)}</span><span class="el-similar__name">${escapeHtml(sibling.name)}</span></a></li>`,
    )
    .join("\n");

  return `<section class="shell el-similar" aria-labelledby="similar-title">
<h2 class="el-similar__title" id="similar-title">Explore other ${escapeHtml(name)} elements</h2>
<ul class="el-similar__list">
${tiles}
</ul>
</section>`;
}

/**
 * The foot of the page: the same two neighbours as the strip, with room to breathe.
 *
 * @param {{ previous: object | null, next: object | null }} options
 * @returns {string}
 */
export function elementPager({ previous, next }) {
  const link = (neighbour, relation, label, modifier) =>
    neighbour
      ? `<a class="el-pager__link${modifier}" href="/elements/${neighbour.slug}/" rel="${relation}"><span class="el-pager__k">${label}</span><span class="el-pager__n">${escapeHtml(neighbour.name)}</span></a>`
      : "";

  return `<nav class="shell el-pager" aria-label="Previous and next element">
${link(previous, "prev", "Previous", "")}
${link(next, "next", "Next", " el-pager__link--next")}
</nav>`;
}

/**
 * Every block the page's template asks for, keyed by the placeholder's name.
 *
 * The build fills the template with this object; a test holds the keys and the template's
 * placeholders to each other, so a block cannot be written and never used, and a placeholder cannot
 * survive into the built page.
 *
 * `elements` is the whole table, not a filtered list: the mini table draws all 118 and the strip
 * needs the two neighbours of this one.
 *
 * @param {{ element: object, elements: object[], categories?: object[], units: object }} options
 * @returns {Record<string, string>}
 */
export function elementPageValues({ element, elements, categories = [], units }) {
  const { previous, next } = neighbouringElements(elements, element.atomicNumber);
  const siblings = similarElements(element, elements);
  const category = categories.find((candidate) => candidate.slug === element.category) ?? null;

  return {
    strip: elementStrip({ element, previous, next }),
    hero: elementHero({ element, elements }),
    headline: elementHeadline({ element }),
    lede: `<p class="el-lede"${attributes({ "data-key": element.category })}>${escapeHtml(element.summary ?? UNKNOWN)}</p>`,
    faq: faqBlock({ element, units }),
    sections: elementSections({ element }),
    counts: countsPanel({ element }),
    properties: propertyList({ element, units, categories }),
    orbital: elementOrbital({ element }),
    similar: elementSimilar({ element, siblings, category }),
    pager: elementPager({ element, previous, next }),
  };
}
