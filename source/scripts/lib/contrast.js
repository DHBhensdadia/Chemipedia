/**
 * Contrast — pure colour maths, no DOM and no data.
 *
 * The site paints a tile or a chip in an element group's colour and then has to
 * decide what colour that group's text should be. Pale groups need dark text,
 * dark groups need cream text, and "which is it" is a question with an exact
 * answer, so it is computed rather than tabulated. One rule, nine lines of
 * arithmetic, and one test that walks all eleven groups.
 *
 * Everything here is pure: no DOM, no data, no side effects. That is what lets
 * the colour rules be tested without a browser, and why this lives in lib/.
 */

/**
 * The two foregrounds a group fill may take.
 *
 * These duplicate two values from `styles/tokens.css` — `--on-fill-dark` and
 * `--on-fill-light` — because a JavaScript module cannot read a CSS custom
 * property without the DOM, and this rule must also run in Node during the
 * build. A test asserts that the stylesheet still declares these values, so the
 * duplication cannot drift silently.
 */
export const ON_FILL_DARK = "#12211f";
export const ON_FILL_LIGHT = "#fdfbfa";

/** WCAG AA for normal text. */
export const AA_TEXT = 4.5;

/** WCAG AA for large text, and for a graphic element against its background. */
export const AA_LARGE = 3;

/**
 * Expand a three- or six-digit hex colour and check it is one.
 *
 * @param {string} hex
 * @returns {string} the colour in lowercase six-digit form, without a leading hash
 */
export function normaliseHex(hex) {
  if (typeof hex !== "string") {
    throw new TypeError(`A colour must be a string: received ${typeof hex}`);
  }

  const value = hex.trim().replace(/^#/, "").toLowerCase();

  if (/^[0-9a-f]{3}$/.test(value)) {
    return value
      .split("")
      .map((digit) => digit + digit)
      .join("");
  }

  if (/^[0-9a-f]{6}$/.test(value)) {
    return value;
  }

  throw new TypeError(`Not a hex colour: ${hex}`);
}

/**
 * The three channels of a colour, as numbers from 0 to 255.
 *
 * Exported because one thing in the project needs a colour broken into numbers rather than compared:
 * the atom viewer, which hands its palette to a graphics card, and which should not be parsing hexes
 * of its own. The scale stays 0–255 here — the division by 255 belongs to the caller that knows what
 * a graphics card wants.
 *
 * @param {string} hex
 * @returns {number[]}
 * @throws {TypeError} when the value is not a hex colour
 */
export function channels(hex) {
  const value = normaliseHex(hex);

  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

/**
 * One channel's contribution to relative luminance, per WCAG.
 *
 * @param {number} channel 0–255
 * @returns {number} 0–1
 */
function linearise(channel) {
  const value = channel / 255;

  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/**
 * The relative luminance of a colour, per WCAG 2.1.
 *
 * @param {string} hex
 * @returns {number} 0 for black, 1 for white
 */
export function relativeLuminance(hex) {
  const [red, green, blue] = channels(hex);

  return 0.2126 * linearise(red) + 0.7152 * linearise(green) + 0.0722 * linearise(blue);
}

/**
 * The contrast ratio between two colours, from 1 to 21.
 *
 * Symmetric: the order of the arguments does not change the result.
 *
 * @param {string} one
 * @param {string} other
 * @returns {number}
 */
export function contrastRatio(one, other) {
  const first = relativeLuminance(one);
  const second = relativeLuminance(other);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * A text colour painted over a fill at a partial alpha: what `opacity` on the element renders.
 *
 * Fading moves the text towards the surface under it, so this is the colour a reader actually
 * sees — and the colour a contrast ratio has to be measured against, because the browser blends
 * before it draws.
 *
 * @param {string} ink
 * @param {string} fill
 * @param {number} [alpha] 0–1
 * @returns {string} the composite, in six-digit form with a leading hash
 */
export function compositeOver(ink, fill, alpha = 1) {
  const front = channels(ink);
  const back = channels(fill);
  const blended = front.map((value, index) => alpha * value + (1 - alpha) * back[index]);

  return `#${blended.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * How far a text colour may be faded over the fill behind it and still reach AA.
 *
 * A tile sets its atomic number and its name in the symbol's own colour and fades them, and that
 * fade is the tile's whole hierarchy. But fading moves the text towards the fill it sits on, and on
 * a pairing that only just passes — the actinide sage takes the dark ink at 4.96:1 — a tenth of it
 * is the difference between readable and not. This is the arithmetic the browser does, so the token
 * that does the fading can be held to the tightest pairing rather than to a value someone liked.
 *
 * @param {string} ink
 * @param {string} fill
 * @param {number} [target] the ratio the faded ink has to reach
 * @returns {number | null} the lowest hundredth of an alpha — which is the most the ink can be
 *   faded — or null when the ink does not reach the target at full strength either
 */
export function lowestAlphaForAA(ink, fill, target = AA_TEXT) {
  let allowed = null;

  for (let step = 0; step <= 100; step += 1) {
    const alpha = step / 100;

    if (contrastRatio(compositeOver(ink, fill, alpha), fill) >= target) {
      allowed = alpha;
      break;
    }
  }

  return allowed;
}

/**
 * The foreground to use on a given fill: whichever of the two candidates
 * contrasts against it better.
 *
 * Better, not merely acceptable, because with two candidates the choice is
 * never close — one of them is always far ahead, and picking the stronger one
 * means the fill keeps a margin of safety if it is ever adjusted.
 *
 * @param {string} fill
 * @param {{ candidates?: string[] }} [options]
 * @returns {string} one of the candidates, in six-digit form with a leading hash
 */
export function readableForeground(fill, { candidates = [ON_FILL_DARK, ON_FILL_LIGHT] } = {}) {
  const ranked = candidates
    .map((candidate) => ({ candidate, ratio: contrastRatio(fill, candidate) }))
    .sort((a, b) => b.ratio - a.ratio);

  return `#${normaliseHex(ranked[0].candidate)}`;
}

/**
 * Whether a contrast ratio reaches a WCAG AA threshold.
 *
 * @param {number} ratio
 * @param {{ large?: boolean }} [options] large text, or a graphic against its background
 * @returns {boolean}
 */
export function meetsAA(ratio, { large = false } = {}) {
  return ratio >= (large ? AA_LARGE : AA_TEXT);
}
