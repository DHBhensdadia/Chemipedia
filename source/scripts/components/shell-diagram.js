/**
 * The electron shell diagram: the atom's shells as rings, its electrons as dots.
 *
 * Drawn from `shells` — the counts of electrons per shell the record already carries — rather than
 * illustrated once per element. A picture per element would be 118 files that could disagree with
 * the numbers beside them; this way the diagram cannot show a shell the property list does not
 * count, because both read the same array.
 *
 * The geometry is a pure function of the counts, so it is testable without a browser: how many
 * rings a diagram has, how many dots are on each ring, and that a shell with one electron gets one
 * dot — the check that would catch a renderer quietly drawing a filled ring instead of the data.
 *
 * The drawing is 200 units square in its own coordinates and the stylesheet decides how large it
 * appears, so the same SVG is an aside on a wide screen and a full-width figure on a phone. No
 * colour is written here: the rings and the dots are classes, and `shell-diagram.css` paints them
 * from the token layer.
 */

import { escapeHtml } from "../lib/html.js";

/** The drawing's own coordinate space. The stylesheet scales it; the geometry does not know that. */
export const SIZE = 200;

const CENTRE = SIZE / 2;

/** The outermost ring's radius, leaving room for the dots' own radius at the edge. */
const MAX_RADIUS = 90;

/** A dot's radius, clamped: large enough to see, small enough that a crowded shell still reads. */
const DOT_MAX = 3.2;
const DOT_MIN = 1.2;

/** The nucleus is a fixed mark at the centre, not a measurement. */
const NUCLEUS_RADIUS = 3;

/** How many degrees each shell is rotated from the one inside it, so dots do not line up in spokes. */
const SHELL_PHASE = 12;

/**
 * Rounds to two decimals, which is finer than the coordinate space can show and stable in a test.
 *
 * @param {number} value
 * @returns {number}
 */
function round(value) {
  return Math.round(value * 100) / 100;
}

/**
 * The shells that can be drawn: whole positive counts.
 *
 * @param {unknown} shells
 * @returns {number[]}
 */
function drawableShells(shells) {
  if (!Array.isArray(shells)) {
    return [];
  }

  return shells.filter((count) => Number.isFinite(count) && count > 0);
}

/**
 * Rings and dots for a set of shell counts.
 *
 * @param {number[]} shells electrons per shell, innermost first
 * @returns {{ rings: { radius: number, dots: { cx: number, cy: number, r: number }[] }[] }}
 */
export function shellGeometry(shells) {
  const counts = drawableShells(shells);
  const rings = [];

  for (const [index, count] of counts.entries()) {
    const radius = round((MAX_RADIUS * (index + 1)) / counts.length);
    const spacing = (2 * Math.PI * radius) / count;
    const dotRadius = round(Math.min(DOT_MAX, Math.max(DOT_MIN, spacing / 2.4)));
    const dots = [];

    for (let position = 0; position < count; position += 1) {
      const degrees = -90 + (360 * position) / count + index * SHELL_PHASE;
      const radians = (degrees * Math.PI) / 180;

      dots.push({
        cx: round(CENTRE + radius * Math.cos(radians)),
        cy: round(CENTRE + radius * Math.sin(radians)),
        r: dotRadius,
      });
    }

    rings.push({ radius, dots });
  }

  return { rings };
}

/**
 * The shells as one line of text, for a caption or an accessible name.
 *
 * @param {unknown} shells
 * @returns {string} the counts, or an empty string when there are none to print
 */
export function shellSummary(shells) {
  return drawableShells(shells).join(", ");
}

/**
 * The diagram as an SVG.
 *
 * The accessible name is the whole diagram's content in words, because a picture of an atom is
 * exactly the kind of figure a screen reader cannot describe for itself.
 *
 * @param {{ shells: number[], label: string }} options
 * @returns {string} an empty string when the record has no shells to draw
 */
export function shellDiagram({ shells, label }) {
  const counts = drawableShells(shells);

  if (counts.length === 0) {
    return "";
  }

  const { rings } = shellGeometry(counts);

  const ringCircles = rings
    .map(
      (ring) =>
        `<circle class="shells__ring" cx="${CENTRE}" cy="${CENTRE}" r="${ring.radius}"></circle>`,
    )
    .join("\n");

  const dots = rings
    .flatMap((ring) => ring.dots)
    .map((dot) => `<circle class="shells__dot" cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}"></circle>`)
    .join("\n");

  return `<svg class="shells" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${escapeHtml(label)}" focusable="false">
${ringCircles}
${dots}
<circle class="shells__nucleus" cx="${CENTRE}" cy="${CENTRE}" r="${NUCLEUS_RADIUS}"></circle>
</svg>`;
}
