/**
 * An orbit: the plane it lies in, and where its electrons are at a given moment.
 *
 * `atom-model.js` says what an atom is — how many nucleons, how many rings, how many electrons on each
 * — and this is the half of the picture that moves: which way each ring faces, and where on it each
 * electron has got to. It is one module rather than two because the two answers are the same answer
 * twice: a ring's plane is the turn its electrons are carried by, and an electron that was placed in
 * another frame would come off its own ring.
 *
 * **Each ring lies in its own plane.** A shell is a ring with an orientation, not a radius alone: the
 * first stands up, the second lies flat, the third tips diagonally, and every shell after them turns by
 * the golden angle in three axes at a half and a quarter rate. Rings that all lay in one plane turn a
 * viewer into a flat disc with dots on it — the electrons look like they are wandering a plate rather
 * than orbiting a nucleus — and the reference spends the same five lines on the same rule for the same
 * reason. The angles are quarter and half turns and the golden angle, so this is geometry rather than a
 * set of design values.
 *
 * **Pure, and hot.** `placeElectrons` runs once a frame for every electron the reader has asked for, so
 * it writes into the caller's own array instead of returning one and does no arithmetic it can avoid:
 * an electron is placed in its ring's plane, where the ring is a circle, and the plane's own columns
 * carry that place into the atom. Nothing here knows what a canvas is.
 */

import { GOLDEN_ANGLE } from "./point-sphere.js";
import { eulerRotation, multiply, rotationX } from "./matrix4.js";

/** A quarter turn, and the turn the rings are carried into the viewer's own plane by. */
const QUARTER_TURN = Math.PI / 2;

/**
 * The angles the nth shell's ring is turned by, counting from one.
 *
 * The reference's own rule, kept as it stands. Two rings sharing a plane would be drawn over each other
 * and read as one; this is what keeps seven shells visibly seven.
 *
 * @param {number} number the shell's number, counting from one
 * @returns {number[]} three radians, in the order x, then y, then z
 */
function shellAngles(number) {
  if (number === 1) {
    return [QUARTER_TURN, 0, 0];
  }

  if (number === 2) {
    return [0, 0, 0];
  }

  if (number === 3) {
    return [QUARTER_TURN / 2, QUARTER_TURN / 2, 0];
  }

  const turned = (number - 3) * GOLDEN_ANGLE;

  return [turned, turned / 2, turned / 4];
}

/**
 * The matrix that turns the ring the viewer builds into the plane the nth shell orbits in.
 *
 * Two things compose here, and the second is only a matter of which frame the ring is built in: the
 * viewer's ring lies in the x/z plane while the reference's lies in x/y, so a quarter turn about x
 * carries one onto the other and the angles above can be the reference's own rather than the same
 * picture turned a quarter turn inside out.
 *
 * The ring's normal is the matrix' second column, which is how a caller — or a test — can ask which way
 * a shell faces without re-deriving any of it.
 *
 * @param {number} number the shell's number, counting from one
 * @returns {number[]} sixteen numbers, column-major
 */
export function shellOrientation(number) {
  return multiply(eulerRotation(shellAngles(number)), rotationX(-QUARTER_TURN));
}

/**
 * Where every electron is at a given moment.
 *
 * Written into the caller's own array rather than returned, because this runs once a frame and a viewer
 * that allocated a new array sixty times a second would be spending its budget on the garbage
 * collector. The electrons come out in the order the shells hold them: the first ring's electrons
 * first, then the next ring's.
 *
 * @param {object} atom a model from `buildAtom`
 * @param {number} seconds since the scene started
 * @param {Float32Array} target where to write, three numbers per electron
 * @param {number} [offset] how far into the target to start
 * @returns {number} how many electrons were placed
 * @throws {TypeError} when the seconds are not a finite number or the target is too short
 */
export function placeElectrons(atom, seconds, target, offset = 0) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    throw new TypeError("the time an electron is placed at must be a finite number");
  }

  if (!target || typeof target.length !== "number" || target.length - offset < atom.electrons * 3) {
    throw new TypeError(`the target must hold ${atom.electrons * 3} numbers for the electrons`);
  }

  let written = 0;

  for (const shell of atom.shells) {
    // The ring's own plane, as the first and third columns of its rotation. An electron is placed on the
    // ring in that plane — across it by one, along it by the other, and no distance out of it at all —
    // and every frame carries that place into the atom by them.
    const plane = shell.orientation;

    for (const phase of shell.phases) {
      const angle = phase + shell.angularSpeed * seconds;
      const at = offset + written * 3;
      const along = shell.radius * Math.cos(angle);
      const across = shell.radius * Math.sin(angle);

      target[at] = plane[0] * along + plane[8] * across;
      target[at + 1] = plane[1] * along + plane[9] * across;
      target[at + 2] = plane[2] * along + plane[10] * across;
      written += 1;
    }
  }

  return written;
}
