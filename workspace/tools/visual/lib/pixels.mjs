/**
 * Pixels, for the two audits that make claims about them.
 *
 * `audit-atmosphere.mjs` and `audit-motion.mjs` both read screenshots pixel by pixel, and both need
 * the same five things: a hex from three channels, channels from a hex, one pixel, a median over a
 * small patch — the reading that survives one lattice hairline or a glyph's edge — and a tolerance
 * comparison. This file is those five, once, so the two audits cannot disagree about what a pixel
 * is. It is a development tool: nothing here is served or shipped.
 */

/** A pixel's three channels as a hex colour. */
export const asHex = ({ r, g, b }) => "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

/** A hex colour's three channels. */
export const hexOf = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

/** One pixel from a decoded PNG. */
export const pixelAt = (png, x, y) => {
  const i = (y * png.width + x) * 4;
  return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] };
};

/** The middle of a small patch, per channel: the reading a hairline or a glyph's edge survives. */
export const patchMedian = (png, x, y, size = 3) => {
  const channels = [[], [], []];
  for (let dy = -size; dy <= size; dy += 1) {
    for (let dx = -size; dx <= size; dx += 1) {
      const px = pixelAt(
        png,
        Math.max(0, Math.min(png.width - 1, x + dx)),
        Math.max(0, Math.min(png.height - 1, y + dy)),
      );
      channels[0].push(px.r);
      channels[1].push(px.g);
      channels[2].push(px.b);
    }
  }
  const median = channels.map((list) => list.sort((a, b) => a - b)[(list.length - 1) >> 1]);
  return { r: median[0], g: median[1], b: median[2] };
};

/** Whether two pixels are within a tolerance in every channel. */
export const close = (a, b, tolerance) =>
  Math.abs(a.r - b.r) <= tolerance && Math.abs(a.g - b.g) <= tolerance && Math.abs(a.b - b.b) <= tolerance;

/**
 * The commonest colour across a strip of one row — a band's ground, where its text and rules are
 * the minority and the ground is what a change to the band actually moves.
 *
 * @param {object} png
 * @param {number} y the row to read
 * @param {number} [step] every nth pixel, for speed
 */
export const stripMode = (png, y, step = 2) => {
  const counts = new Map();

  for (let x = 8; x < png.width - 8; x += step) {
    const px = pixelAt(png, x, y);
    const key = `${px.r},${px.g},${px.b}`;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let best = null;
  let bestCount = 0;

  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }

  const [r, g, b] = best.split(",").map(Number);

  return { r, g, b };
};
