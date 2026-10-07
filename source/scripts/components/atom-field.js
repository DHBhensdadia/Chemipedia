/**
 * The field the atom stands in: the grid behind everything else, and the one pass that draws it.
 *
 * The reference draws its own grid as a pattern on the page behind a transparent canvas. This one is a
 * pass inside the scene, and the reason is worth stating because the simpler road was taken first and
 * refused: a canvas that is transparent enough to show a stylesheet's pattern through it cannot also
 * blend a translucent ring into the field, and the rings' look is measured — blending a fifth-opacity
 * tube into an empty buffer and letting the browser composite it afterwards comes out at a third of
 * the opacity that was asked for. So the panel's ground is the scene's own first draw, and the numbers
 * for it still come from `tokens.css` like every other number in the scene.
 *
 * It is a module of its own rather than a fourth block inside `atom-view.js` for the same reason
 * `atom-orbit.js` is one: the view is the frame — what is drawn when, in which order, with what — and
 * a pass with its own configuration, its own validation and its own five uniforms is a thing, not a
 * block. Every function here takes what it needs, so the pass can be tested without a canvas.
 */

/**
 * The two arrays the pass uploads, kept between frames.
 *
 * A field is drawn sixty times a second and the same two and three numbers are written into them each
 * time; allocating them per frame would hand the collector a small pair of objects every frame for no
 * reason. Drawing is synchronous — both are written and uploaded before this module returns — so one
 * pair is enough however many views a page has.
 */
const resolution = new Float32Array(2);
const stageColour = new Float32Array(3);

/**
 * A field's configuration, checked and normalised.
 *
 * A caller that asks for no grid gets none, which is a legitimate configuration: a stage drawn without
 * one is the stage this project shipped before the field existed.
 *
 * @param {{ colour: number[], pitch: number, major: number, majorStrength: number, fade: number }|null} grid
 * @returns {{ colour: Float32Array, pitch: number, major: number, majorStrength: number, fade: number }|null}
 * @throws {TypeError} when a grid is asked for and any of its numbers is not one
 */
export function fieldFor(grid) {
  if (!grid) {
    return null;
  }

  const colour = grid.colour;
  const pitch = grid.pitch;
  const major = grid.major;
  const majorStrength = grid.majorStrength;
  const fade = grid.fade;

  for (const [name, value] of [
    ["pitch", pitch],
    ["major", major],
    ["majorStrength", majorStrength],
    ["fade", fade],
  ]) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`a grid's ${name} must be a finite number`);
    }
  }

  if (!Array.isArray(colour) || colour.length !== 3) {
    throw new TypeError("a grid's line colour must be three numbers");
  }

  if (pitch <= 0) {
    throw new TypeError("a grid's pitch must be greater than zero");
  }

  if (major < 1) {
    throw new TypeError("a grid's strong lines must be at least one line apart");
  }

  if (majorStrength <= 0) {
    throw new TypeError("a grid's strong lines must be stronger than nothing");
  }

  if (fade < 0 || fade > 1) {
    throw new TypeError("a grid's fade is a shade between nothing and everything");
  }

  return {
    colour: Float32Array.from(colour),
    pitch,
    major,
    majorStrength,
    fade,
  };
}

/**
 * Draw the field: one full-screen triangle, painted from the fragment's own position on the surface.
 *
 * The pitch arrives in CSS pixels and is multiplied by the surface's ratio here, so the grid is the
 * same size to a reader whatever display they are on, and the line is one pixel wide at any ratio
 * because the width comes from the fragment shader's own derivative rather than from a number.
 *
 * Depth and blending are turned off for the pass and left as the view had them: nothing is under the
 * field to be tested against, nothing is behind it to be blended with — it *is* what is under
 * everything else — and a pass that changed either for the rest of the frame would change every
 * particle drawn after it.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {{ program: WebGLProgram, uniforms: Object<string, WebGLUniformLocation> }} slot
 * @param {{ canvas: object, field: object, stage: ArrayLike<number> }} options the canvas being drawn
 *   on, the normalised field, and the stage's colour — which is the clear colour the view already has
 * @returns {void}
 */
export function drawField(gl, slot, { canvas, field, stage }) {
  const ratio = canvas.width / Math.max(1, canvas.clientWidth || canvas.width);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  resolution.set([canvas.width, canvas.height]);
  stageColour.set([stage[0], stage[1], stage[2]]);

  gl.useProgram(slot.program);
  gl.uniform2fv(slot.uniforms.uResolution, resolution);
  gl.uniform1f(slot.uniforms.uPitch, field.pitch * ratio);
  gl.uniform3fv(slot.uniforms.uLine, field.colour);
  gl.uniform3fv(slot.uniforms.uStage, stageColour);
  gl.uniform1f(slot.uniforms.uMajor, field.major);
  gl.uniform1f(slot.uniforms.uMajorStrength, field.majorStrength);
  gl.uniform1f(slot.uniforms.uFade, field.fade);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
}
