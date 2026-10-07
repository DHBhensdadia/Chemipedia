/**
 * What a WebGL stage actually painted, read out of its own drawing buffer.
 *
 * Two questions the rest of the harness cannot answer from a screenshot hash: is anything on the stage
 * at all, and is it in the colours the token layer asked for. A screenshot says "these two frames
 * differ"; this says "1 074 pixels of the stage are proton-coloured".
 *
 * **It has to read inside a frame.** The canvas is deliberately not created with
 * `preserveDrawingBuffer` — asking for one costs a copy of every frame for the sake of a debugger — so
 * a frame exists only until the browser has composited it. A read one turn later reports an empty
 * stage for a stage that draws perfectly well. The page's own loop registers its callback first, so a
 * callback registered here runs after it, with the frame still in the buffer.
 *
 * **A particle is lit, so it is not its own colour.** The shader multiplies a particle's colour by
 * however much light reached it, and adds a glow for the electrons, so a proton's pixels are its coral
 * times some brightness rather than the coral itself. Each pixel is therefore matched to a token
 * colour *scaled to fit it* — the brightness is solved for rather than guessed — and the residual left
 * over is what decides whether this is that colour at some brightness or a different colour. That is
 * also what makes the answer a check on the palette reaching the graphics card: a layer that never
 * uploaded the colours, or drew everything in one of them, cannot pass it.
 *
 * The classification is deliberately forgiving — 70 of 765 summed channels — because a pixel on the
 * edge of a lit sphere is a blend of that sphere and whatever is behind it, and an audit that only
 * counted perfect matches would report a correct render as a failure. It is not forgiving enough to
 * confuse two of the scene's own colours: the proton's coral and the neutron's warm grey differ by
 * more than that at every brightness.
 */

/** How much leftover counts as "this colour, lit", summed over the three channels. */
const SAME_COLOUR = 70;

/** How far from the panel's own colours a pixel may be and still be the panel. */
const PANEL = 40;

/** Every seventh pixel is sampled, which is twenty-eight bytes: at the widest surface this is a
 * two-million-pixel buffer, and the answer does not depend on reading all of it. */
const SAMPLE_EVERY = 28;

/**
 * Read a WebGL2 canvas' frame, and say what is on it.
 *
 * @param {import("playwright").Page} page
 * @param {string} selector the canvas
 * @returns {Promise<object>} `lit` and `sampled` counts, the lit share, and how many pixels were
 *   matched to each of the scene's particle colours. A canvas with no context resolves to zeros
 *   rather than throwing, because a page without WebGL2 is a case the harness has to be able to report
 *   on.
 */
export async function paintedShare(page, selector) {
  return page.evaluate(
    ({ stage, panel, same, step }) =>
      new Promise((resolve) => {
        const canvas = document.querySelector(stage);
        const gl = canvas?.getContext("webgl2");

        if (!gl) {
          resolve({ lit: 0, sampled: 0, ratio: 0, palette: {} });

          return;
        }

        const tokens = getComputedStyle(document.documentElement);
        const rgb = (name) => {
          const value = tokens.getPropertyValue(name).trim();

          return [1, 3, 5].map((at) => Number.parseInt(value.slice(at, at + 2), 16));
        };
        const ground = rgb("--atom-stage");
        const line = rgb("--atom-grid-line");
        const fade = Number.parseFloat(tokens.getPropertyValue("--atom-grid-fade").trim()) || 0;
        const palette = {
          proton: rgb("--atom-proton"),
          neutron: rgb("--atom-neutron"),
          electron: rgb("--atom-electron"),
        };

        /**
         * The panel's own colour at one point on it, and how far a pixel is from being it.
         *
         * The stage is not one colour any more: it is the field with a grid drawn over it, both of them
         * a shade darker towards the corners — the shader's own formula, repeated here so that a pixel
         * on the grid is read as the panel it is and not as something the scene drew. An anti-aliased
         * edge is the field and the line mixed, which is why the distance is measured to the segment
         * between them rather than to either end of it.
         *
         * @param {number[]} pixel
         * @param {number} x the pixel's column, in the surface's own pixels
         * @param {number} y its row
         * @param {number} width
         * @param {number} height
         * @returns {number} the summed distance from the panel's nearest own colour
         */
        const fromPanel = (pixel, x, y, width, height) => {
          const across = (x / width) * 2 - 1;
          const down = (y / height) * 2 - 1;
          const veil = 1 - fade * (across * across + down * down) * 0.5;
          const field = ground.map((channel) => channel * veil);
          const towards = line.map((channel, at) => channel - field[at]);
          const length = towards.reduce((sum, channel) => sum + channel * channel, 0) || 1;
          const along = Math.min(
            1,
            Math.max(
              0,
              pixel.reduce((sum, channel, at) => sum + (channel - field[at]) * towards[at], 0) /
                length,
            ),
          );

          return pixel.reduce(
            (sum, channel, at) => sum + Math.abs(channel - (field[at] + towards[at] * along)),
            0,
          );
        };

        requestAnimationFrame(() => {
          const pixels = new Uint8Array(canvas.width * canvas.height * 4);

          gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

          let lit = 0;
          let sampled = 0;
          const found = Object.fromEntries(Object.keys(palette).map((name) => [name, 0]));

          for (let at = 0; at < pixels.length; at += step) {
            sampled += 1;

            const pixel = [pixels[at], pixels[at + 1], pixels[at + 2]];
            const column = (at / 4) % canvas.width;
            const row = Math.floor(at / 4 / canvas.width);

            if (fromPanel(pixel, column, row, canvas.width, canvas.height) <= panel) {
              continue;
            }

            lit += 1;

            for (const [name, colour] of Object.entries(palette)) {
              // The brightness that would make this pixel the colour in question, if it is.
              const energy =
                (pixel[0] * colour[0] + pixel[1] * colour[1] + pixel[2] * colour[2]) /
                (colour[0] ** 2 + colour[1] ** 2 + colour[2] ** 2);

              // Outside the range the shader can produce — ambient at the bottom, full light plus a glow
              // at the top — so it is not this colour whatever the residual says.
              if (energy < 0.2 || energy > 1.6) {
                continue;
              }

              const residual =
                Math.abs(pixel[0] - colour[0] * energy) +
                Math.abs(pixel[1] - colour[1] * energy) +
                Math.abs(pixel[2] - colour[2] * energy);

              if (residual < same) {
                found[name] += 1;
                break;
              }
            }
          }

          resolve({ lit, sampled, ratio: lit / sampled, palette: found });
        });
      }),
    { stage: selector, panel: PANEL, same: SAME_COLOUR, step: SAMPLE_EVERY },
  );
}
