/**
 * The atoms page, as the build writes it.
 *
 * A finished page before any script runs: the hero, the element's shell diagram, the counts in words,
 * and the whole bar — its card, its three steppers, its speed and its legend. `components/atom-stage.js`
 * is the other half, and it replaces the diagram with the scene once there is a frame to show. Between
 * them, a reader with no scripting, no WebGL2 or a reduced-motion preference keeps what is written
 * here, which is why none of it is assembled in the browser.
 *
 * **What a reader changes.** Protons, neutrons and electrons, each with a stepper of its own. The
 * protons stop at 118, because that is the last element and the card has something true to say about
 * every count below it; the free counts deliberately go past anything an element has. When the proton
 * count names an element the card names it, and when it does not the page says so in words rather than
 * inventing a symbol — the same honesty `atom-model.js` applies to the model, applied to the page that
 * draws it.
 *
 * **The sentences are not written here.** `lib/atom-words.js` holds them, so the diagram's caption,
 * the canvas' accessible name and the live region's announcement are one description of one atom
 * rather than three that can drift apart.
 */

import { atomBar } from "../components/atom-bar.js";
import { atomSentence, countsFor, countsSentence } from "../lib/atom-words.js";
import { shellDiagram } from "../components/shell-diagram.js";

/** The element the page opens on: the one the style guide opens on, so the two show the same atom. */
export const ATOM_OPENING = 6;

/** The page's lede, in our own words. */
export const ATOM_LEDE =
  "Every element is an atom of its own shape: a nucleus of protons and neutrons, with electrons " +
  "orbiting around it in shells. Choose an element, or set the three counts yourself, and watch what " +
  "the atom does.";

/** What the stage's heading says, for a reader who cannot see it. */
export const STAGE_TITLE = "The atom, drawn in three dimensions";

/**
 * Every block the page's template asks for.
 *
 * @param {{ elements: object[] }} context
 * @returns {object}
 */
export function atomsPageValues({ elements }) {
  const record = elements.find((element) => element.atomicNumber === ATOM_OPENING);
  const counts = countsFor(record);
  const sentence = atomSentence(record, counts);

  return {
    lede: ATOM_LEDE,
    title: STAGE_TITLE,
    canvasLabel: `${sentence} Drawn in three dimensions.`,
    diagram: shellDiagram({
      shells: record.shells,
      label: `A diagram of ${record.name}'s electron shells: ${countsSentence(counts)}.`,
    }),
    counts:
      `${sentence} A reader with no WebGL2, no scripting, or a reduced-motion preference keeps this ` +
      "diagram and this line instead of the three-dimensional view.",
    bar: atomBar({ record, counts, elements }),
    note: `<p>Every particle on the stage is one of the counts above: the protons and neutrons
      together in the nucleus, and the electrons on their shells' own rings. A ring turns at a speed
      that falls off with its distance, so the innermost shells are the busy ones, and the nucleus
      holds still while they move.</p>
    <p>The picture is drawn by this site's own WebGL2 — no library — and every value in it, from the
      stage's colour to how fast the atom turns, is a token in one stylesheet. Drag the stage to swing
      the view, and use the wheel or a trackpad gesture to move closer.</p>
    <p>The element facts are PubChem's and Wikidata's — see <a href="/about/#data-sources">where the
      data comes from</a>.</p>`,
  };
}
