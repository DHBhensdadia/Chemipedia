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

/** How far a sampled pixel has to be from the stage colour to count as drawn at all. */
const DRAWN = 24;

/** How much leftover counts as "this colour, lit", summed over the three channels. */
const SAME_COLOUR = 70;

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
    ({ stage, drawn, same, step }) =>
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
        const palette = {
          proton: rgb("--atom-proton"),
          neutron: rgb("--atom-neutron"),
          electron: rgb("--atom-electron"),
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
            const away =
              Math.abs(pixel[0] - ground[0]) +
              Math.abs(pixel[1] - ground[1]) +
              Math.abs(pixel[2] - ground[2]);

            if (away <= drawn) {
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
    { stage: selector, drawn: DRAWN, same: SAME_COLOUR, step: SAMPLE_EVERY },
  );
}
