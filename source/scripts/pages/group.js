/**
 * The element group pages — one module behind the eleven pages and their index.
 *
 * A group page answers one question about one family of elements, and every one of them is the same
 * page: a hero carrying the group's own colour, the table already isolated to that group, the
 * members as cards, the group's shared character written out, and the other ten groups named at the
 * foot. The eleven differ in data and in copy, never in shape, so they share one template, one
 * module and one stylesheet — the arrangement the four table views already use.
 *
 * Two rules run through the module, both carried forward from the phases before it.
 *
 * The first is that a written claim about the data is derived from the data. The count, the range of
 * atomic numbers, the block and the states in the hero's facts are read off the group's own members,
 * and the sentence under the table counts them again from the same array, so correcting a record
 * changes the page instead of contradicting it. The prose is the one thing written down: it belongs
 * to the group rather than to a record, and it is kept free of counts precisely so that it cannot
 * go stale.
 *
 * The second is that a colour is a key. Nothing here names a colour or a token: the page's wrapper
 * carries the group's slug as `data-key` and the table's own sheet turns that into `--fill`,
 * `--on-fill` and the deeper pair the hero's lede is written in. That is why the hero can be
 * painted in the group's colour, why the member cards are painted by the same key, and why the
 * siblings at the foot can each be a different group's colour without a second mapping existing.
 */

import { attachPeriodicTable, renderPeriodicTable } from "../components/periodic-table.js";
import { createElementsRepository } from "../data/elements-repository.js";
import { UNKNOWN, capitalise, formatMeasurement } from "../lib/format.js";
import { createGrid } from "../lib/grid.js";
import { attributes, escapeHtml } from "../lib/html.js";
import { plural } from "../lib/plural.js";

/** The unit definition for a field, or an empty one when the units data has none. */
const definitionFor = (units, field) => units?.definitionFor(field) ?? {};

/** The lede the index page opens with. */
export const INDEX_LEDE =
  "The periodic table is divided into families that share a chemistry, and this is all eleven of " +
  "them. Each one gathers the elements that behave alike, from the metals that react with water to " +
  "the gases that will not react with anything — where they sit, what they have in common, and " +
  "every member in turn.";

/**
 * Each group's own copy: the sentence its hero carries, and the paragraphs under its table.
 *
 * The copy is deliberately free of numbers. Every count a reader is given on these pages — how many
 * members, which atomic numbers, which states — is derived from the records by the functions below,
 * so the words that cannot be derived are kept to the things the data does not change: what an
 * alkali metal does in water, why the lanthanides were hard to separate, what a transactinide can
 * be known by. A sentence here may not disagree with the table, because it does not state a fact
 * the table could state instead.
 *
 * @type {Record<string, { lede: string, about: string[] }>}
 */
export const GROUP_NOTES = {
  "alkali-metals": {
    lede: "Each one carries a single electron in its outer shell, and gives it away at the first opportunity.",
    about: [
      "Every alkali metal holds one electron in an s orbital with nothing beyond a closed shell. Losing it leaves a stable noble-gas core behind, which is why these metals are soft, light and violently reactive: they tarnish within seconds of being cut, and they react with water to give a hydroxide and hydrogen, often fast enough to set the gas alight.",
      "Reactivity climbs down the column and so does the violence of the reaction — lithium fizzes, sodium skitters, potassium ignites, and caesium is the most eager metal on the table. None of them occurs free in nature, because anything that reactive cannot stay that way; they are found as salts, and their flame colours are how they were first told apart.",
    ],
  },
  "alkaline-earth-metals": {
    lede: "Two electrons in the outer s orbital, given up to make a 2+ ion, and a hardness the alkali metals do not have.",
    about: [
      "These sit one column to the right of the alkali metals and pay for the extra proton with an extra electron: they still form ions readily, but the 2+ charge binds them into harder, denser metals with melting points high enough to be structural rather than decorative.",
      "Calcium and magnesium are the two the world runs on — bone and shell and limestone on one side, chlorophyll and the reducing agent that makes titanium on the other. Beryllium is the exception: too small to give its electrons away gracefully, it forms covalent compounds and a stubborn, poisonous oxide. Radium closes the column, and nobody keeps it.",
    ],
  },
  "transition-metals": {
    lede: "The wide block in the middle of the table: metals whose d orbitals fill across ten columns.",
    about: [
      "A d subshell holds ten electrons and the filling of it runs across ten columns, which is why the transition metals form the broad middle of the table. The electrons being added lie in a shell below the surface, so they take part in bonding rather than sitting inert: these metals show several oxidation states apiece, form coloured compounds almost without exception, and dissolve into solutions that are rarely colourless.",
      "They are also the working metals. Iron and steel carry the load, copper and silver carry the current, platinum and palladium and rhodium carry the reactions, and mercury is the one metal that is liquid at room temperature. Most are dense, most melt high, and between them they account for the industrial half of the periodic table.",
    ],
  },
  "post-transition-metals": {
    lede: "Softer, lower-melting metals to the right of the transition block, where the p electrons are held more tightly.",
    about: [
      "These are metals by their place in the table rather than by their behaviour. They are softer and melt far lower than the transition metals — gallium melts in a hand and bismuth is barely above that — and several of them are amphoteric, dissolving in acid and in alkali alike, which is not what a metal is expected to do.",
      "Aluminium is the most abundant metal in the crust and the one that makes the group matter; tin and lead are the metals of solder and old pipework. The heavier members show the inert-pair effect, holding on to two of their outer electrons rather than surrendering all of them, which is why thallium prefers the +1 state and lead the +2.",
    ],
  },
  metalloids: {
    lede: "The elements on the stairway between the metals and the non-metals, which conduct only when given a reason to.",
    about: [
      "A metalloid looks like a metal and behaves like neither: brittle rather than malleable, a poor conductor at rest, and a controllable one once it is doped. That property — conductivity switched by a trace of another element — is the whole of the electronics industry, and it belongs to silicon and to germanium.",
      "Boron is a hard, refractory solid whose chemistry has more in common with carbon than with aluminium; arsenic, antimony and tellurium are the ones whose names still mean poison to most readers. Every member of the group is a solid at room temperature, and every one forms oxides that are weakly acidic rather than basic.",
    ],
  },
  "non-metals": {
    lede: "Elements that would rather share electrons than give them away — and the ones living things are made of.",
    about: [
      "A non-metal is defined by what it does not do: it does not conduct, it does not shine, and it does not hand its electrons to a metal without taking something back. Instead these elements bond covalently, with each other in chains and rings and cages, and with everything else as well.",
      "Carbon is the frame of every organic molecule, oxygen and nitrogen fill the air and most of the ocean's chemistry, hydrogen is the simplest atom in the universe and the fuel of the stars, and phosphorus and sulphur make fertiliser and protein possible. Selenium is the odd one out: a trace element that turns toxic barely a milligram past the point where the body needs it.",
    ],
  },
  halogens: {
    lede: "Every one of them is a single electron short of a full outer shell, which is exactly why they react.",
    about: [
      "A halogen carries seven electrons in its outer shell, arranged as a pair in an s orbital and five in a p set. Taking one more would complete the stable noble-gas arrangement, so the group's whole chemistry is a hunt for that electron: halogens strip it from metals to make salts, and they are the most reactive non-metals on the table.",
      "The group is also the only one that spans the ordinary states at room temperature — gases, a liquid and solids inside one family — and the only one whose reactivity falls away so steeply down the column. Fluorine is the strongest oxidising agent there is; the last member of the family is known almost entirely by its radioactivity.",
    ],
  },
  "noble-gases": {
    lede: "Closed shells and nothing to gain: no electron wanted, no bond needed, the highest ionisation energies in the table.",
    about: [
      "A noble gas has filled its outer shell, so there is no electron it wants and nothing it needs a bond for. That is why the group is monatomic, and why helium, neon, argon, krypton and xenon are all found free in the air: they were discovered by noticing what they would not do rather than by isolating a compound.",
      "The bottom of the column is the interesting part. Krypton and xenon do form compounds with fluorine and oxygen, and the last member of the group — made one atom at a time and named for the man who taught chemistry to Russia — is predicted to be a solid rather than a gas, which is what happens when the table runs out of room.",
    ],
  },
  lanthanides: {
    lede: "The first of the two detached rows: metals whose f orbitals fill beneath the outer shell, so alike they are hard to tell apart.",
    about: [
      "The electrons these metals add go into an f subshell buried beneath the outer shell, which barely changes how the atom behaves. All of them are soft and silvery, tarnish in air and react with water, and prefer the same +3 oxidation state so uniformly that separating them chemically is a problem rather than a question.",
      "They are not rare, despite the name — cerium is more abundant than copper — but they are so similar that they were separated one slow crystallisation at a time, and cerium, praseodymium and neodymium are named after the twins they appeared to be. Their magnetism and their light are why they matter now: the strongest permanent magnets and the phosphors in a screen both come from this row.",
    ],
  },
  actinides: {
    lede: "The second detached row: radioactive metals filling an f subshell while the nucleus itself comes apart.",
    about: [
      "The actinides repeat the lanthanides' problem with a sharper edge. The 5f electrons fill across the row, the chemistry is dominated by +3 again, and the difference is that no isotope of any of them lasts on a human timescale. Thorium and uranium are the two found in the crust in quantity; everything beyond uranium has to be made, a nucleus at a time.",
      "Uranium and plutonium are the two the world knows by their fission rather than by their chemistry, and the elements after them exist in quantities measured in micrograms and are used as sources and as targets rather than as materials. The row ends at lawrencium, and every member of it except the first four is synthetic.",
    ],
  },
  unknown: {
    lede: "The heaviest elements, made a few atoms at a time and gone almost immediately, known by prediction as much as by measurement.",
    about: [
      "These are the transactinides: the elements past the actinide row, all of them synthetic, all of them radioactive with half-lives of minutes or less. None has ever been collected in a quantity anyone could see, so what is known of them is what a few atoms at a time will say — a decay chain, a particle energy, and a place at the end of the seventh period.",
      "Their chemistry is expected to follow the column each one stands in, with relativistic effects pulling the predicted behaviour away from the lighter members of the same group. Some are named for the people and places that made them and some for the laboratories that did the work, and the last of them closed the seventh period in 2010.",
    ],
  },
};

/**
 * The facts a group's hero states, read off its members.
 *
 * The block is reported only when the whole group shares one, which is what makes it worth stating;
 * a group drawn from two blocks says nothing rather than naming one of them. The states keep the
 * order the members are read in — atomic number order — so the list reads the way the group runs
 * down the table rather than the way a legend happens to be ordered.
 *
 * @param {object[]} members
 * @returns {{ count: number, range: string, block: string | null, states: string[] }}
 */
export function groupFacts(members) {
  const numbers = members.map((element) => element.atomicNumber);
  const blocks = [...new Set(members.map((element) => element.block))];
  const states = [...new Set(members.map((element) => element.state ?? "unknown"))];

  return {
    count: members.length,
    range: numbers.length ? `${Math.min(...numbers)}\u2013${Math.max(...numbers)}` : UNKNOWN,
    block: blocks.length === 1 ? `${blocks[0]}-block` : null,
    states,
  };
}

/**
 * The hero's facts as a definition list: how many, which numbers, which block, which states.
 *
 * @param {object[]} members
 * @returns {string}
 */
export function groupFactList(members) {
  const { count, range, block, states } = groupFacts(members);
  const rows = [
    ["Elements", String(count)],
    ["Atomic numbers", range],
    block === null ? null : ["Block", block],
    ["States", states.map(capitalise).join(", ")],
  ].filter((row) => row !== null);

  return `<dl class="grp-facts">
${rows
  .map(
    ([label, value]) =>
      `<div class="grp-fact"><dt class="grp-fact__k">${escapeHtml(label)}</dt><dd class="grp-fact__v">${escapeHtml(value)}</dd></div>`,
  )
  .join("\n")}
</dl>`;
}

/**
 * The group's members as cards: the element's tile, its name, its weight and its state.
 *
 * The card is a link to the element's page before it is anything else, so the whole card is the
 * link, and the link is named by what the card shows: the tile's number and symbol, then the name,
 * the weight and the state. It used to be named by an `aria-label` that reworded the tile, which
 * left the weight and the state unnamed and put the link's name in an order the visible text does
 * not have — the label-in-name failure Lighthouse reported on every group page. Its weight is
 * formatted through the units data and its state is the record's own word, capitalised, which is
 * the same pair of rules the elements index follows — a measurement reads the same on both pages or
 * it is a bug.
 *
 * @param {{ members: object[], units?: object }} options
 * @returns {string}
 */
export function groupMemberList({ members, units }) {
  return members
    .map((element) => {
      const weight = formatMeasurement(element.atomicWeight, definitionFor(units, "atomicWeight"));
      const state = capitalise(element.state) || UNKNOWN;

      return `<li class="grp-members__item"><a${attributes({
        class: "grp-member",
        href: `/elements/${escapeHtml(element.slug)}/`,
      })}>
<span class="grp-member__tile"><span class="grp-member__z">${escapeHtml(element.atomicNumber)}</span><span class="grp-member__sym">${escapeHtml(element.symbol)}</span></span>
<span class="grp-member__meta"><span class="grp-member__name">${escapeHtml(element.name)}</span><span class="grp-member__sub">${escapeHtml(`${weight} \u00b7 ${state}`)}</span></span>
</a></li>`;
    })
    .join("\n");
}

/**
 * The other groups, each as a pill carrying its own colour.
 *
 * A pill sets `data-key` to its own group, not the page's, which is what lets the foot of the page
 * show ten different colours out of one mapping. The dot is the only thing painted, because the
 * label needs to stay readable at the contrast the ink gives it.
 *
 * @param {{ categories: object[], current: string }} options
 * @returns {string}
 */
export function groupSiblingList({ categories, current }) {
  return categories
    .filter((category) => category.slug !== current)
    .map(
      (category) =>
        `<li><a${attributes({
          class: "grp-sibling",
          href: `/element-groups/${category.slug}/`,
          "data-key": category.slug,
        })}><span class="grp-sibling__dot" aria-hidden="true"></span>${escapeHtml(category.name)}</a></li>`,
    )
    .join("\n");
}

/**
 * The sentence under the table: what the colours are, and how many cells are the group's own.
 *
 * @param {{ members: object[], category: object, total: number }} options
 * @returns {string}
 */
export function groupNote({ members, category, total }) {
  const many = plural(category.name);

  return `Every cell is painted by the group its element belongs to. The ${members.length} at full colour are the ${many}; the other ${total - members.length} are dimmed so that the group's own shape is what a reader sees first.`;
}

/**
 * One card on the index: the group's colour, how many members it has, its name and its sentence.
 *
 * @param {{ category: object, count: number, lede: string }} options
 * @returns {string}
 */
export function groupCard({ category, count, lede }) {
  return `<li class="grp-card"><a${attributes({
    class: "grp-card__link",
    href: `/element-groups/${category.slug}/`,
    "data-key": category.slug,
    "aria-label": `${category.name}, ${count} elements`,
  })}>
<span class="grp-card__tile" aria-hidden="true"><span class="grp-card__n">${escapeHtml(count)}</span></span>
<span class="grp-card__meta"><span class="grp-card__name">${escapeHtml(category.name)}</span><span class="grp-card__lede">${escapeHtml(lede)}</span></span>
</a></li>`;
}

/** The elements of one category, in atomic-number order. */
const membersOf = (elements, slug) =>
  elements
    .filter((element) => element.category === slug)
    .sort((one, other) => one.atomicNumber - other.atomicNumber);

/**
 * Every block a group page's template asks for.
 *
 * The table is the table: the group mode the home page already draws, written with this group
 * already isolated so that the page is right before a script runs, and with its legend chips as
 * links to the eleven pages rather than buttons that isolate. The chips still preview on hover —
 * `attachPeriodicTable` leaves the page's own isolation in place when the pointer leaves — but a
 * press on one is a navigation, which is what a reader looking at another colour expects.
 *
 * @param {{ route: object, elements: object[], categories?: object[], units?: object }} options
 * @returns {{
 *   key: string, name: string, lede: string, facts: string, table: string, note: string,
 *   membersHeading: string, members: string, aboutHeading: string, about: string, siblings: string
 * }}
 * @throws {TypeError} when the route carries no category, which would render a page of the wrong
 *   group's colour rather than failing
 */
export function groupValues({ route, elements, categories = [], units }) {
  const category = route?.category ?? null;

  if (!category) {
    throw new TypeError(`${route?.path ?? "A group route"} carries no category to render`);
  }

  const members = membersOf(elements, category.slug);
  const notes = GROUP_NOTES[category.slug];

  if (!notes) {
    throw new TypeError(`No copy is written for the ${category.slug} group`);
  }

  return {
    key: category.slug,
    name: category.name,
    lede: notes.lede,
    facts: groupFactList(members),
    table: renderPeriodicTable({
      elements,
      categories,
      mode: "group",
      isolate: category.slug,
      legendLinks: (key) => `/element-groups/${key}/`,
    }),
    note: `<p class="grp-note">${escapeHtml(groupNote({ members, category, total: elements.length }))}</p>`,
    membersHeading: `The ${plural(category.name)}`,
    members: groupMemberList({ members, units }),
    aboutHeading: `About the ${plural(category.name)}`,
    about: notes.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n"),
    siblings: groupSiblingList({ categories, current: category.slug }),
  };
}

/**
 * Every block the index page's template asks for.
 *
 * @param {{ elements: object[], categories?: object[] }} options
 * @returns {{ lede: string, cards: string }}
 */
export function groupIndexValues({ elements, categories = [] }) {
  const cards = categories.map((category) =>
    groupCard({
      category,
      count: membersOf(elements, category.slug).length,
      lede: GROUP_NOTES[category.slug]?.lede ?? "",
    }),
  );

  return { lede: INDEX_LEDE, cards: cards.join("\n") };
}

/**
 * Bring a group page to life: the arrow keys and the chips' preview, over the markup the build wrote.
 *
 * Nothing is passed in but the document. The table's own `data-mode` says how its tiles are keyed,
 * its `data-isolated` says which key the page rests on, and the grid is the layout of the elements
 * the page was rendered from — so the behaviour and the markup cannot disagree about any of it.
 *
 * @param {Document} [root]
 * @returns {Promise<() => void>} teardown
 */
export async function startGroup(root = document) {
  const host = root.querySelector("[data-group-table]");

  if (!host) {
    return () => {};
  }

  const elements = await createElementsRepository();

  return attachPeriodicTable(host, { model: createGrid(elements.all()) });
}
