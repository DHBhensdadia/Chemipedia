/**
 * The points a sphere of nucleons is built from.
 *
 * A nucleus is drawn as a cluster of spheres, and the only question this module answers is where they
 * go: an evenly spread set of points on a sphere, in the order they were generated. The count, the
 * kind of each nucleon and how big the cluster is belong to the model above it.
 *
 * **The spiral, and why this one.** Points placed at the golden angle turn by `π(3 − √5)` — about
 * 137.5° — between one step and the next, which is the angle that never repeats a direction: any
 * rational fraction of a turn would eventually come back round to where it started and leave a visible
 * seam of aligned points. It is the arrangement a sunflower head and a pine cone use for the same
 * reason, and it is a closed form rather than a relaxation: the same count gives the same points, in
 * the same order, on every machine and every visit.
 *
 * **Deterministic, where the reference shuffles.** The reference places its nucleons the same way and
 * then *shuffles* which ones are protons so that the two colours mix. Ours mixes them by arithmetic in
 * the model above, because a nucleus that came out differently on every visit would be a picture that
 * cannot be compared with itself — and because "the same element looks the same every time you look at
 * it" is a property this project can claim and test, and a shuffled one cannot.
 *
 * **The set is centred, which is worth more than being exactly on the surface.** A spiral is even but
 * not symmetric: at two points it puts them both on one side, and a nucleus drawn off-centre inside
 * its own orbits is the first thing a reader would notice about hydrogen. So the whole set is shifted
 * onto the origin and then scaled so its furthest point sits exactly on the radius — which is what
 * makes `radius` mean *the cluster's outer edge* rather than *the sphere a point would have landed on*,
 * and is the promise the model above places its orbits against. Points are therefore at or inside the
 * radius rather than exactly on it, by a fraction of a nucleon at every count an element has.
 *
 * A single point is the one case with no edge to scale to: it sits at the origin, which is what one
 * nucleon — hydrogen-1's — should be.
 */

/**
 * The angle between one point and the next: π(3 − √5), the golden angle.
 *
 * Not a design value — it is the constant that makes the spiral turn, the same way π makes a circle.
 * Exported because the atom model spreads its electrons' starting angles with the same angle.
 */
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * @param {unknown} value
 * @param {string} name
 * @param {number} least
 * @returns {number}
 * @throws {TypeError} when the value is not a whole number at least this large
 */
function asCount(value, name, least) {
  if (!Number.isInteger(value) || value < least) {
    throw new TypeError(`${name} must be a whole number, ${least} or more`);
  }

  return value;
}

/**
 * An evenly spread set of points on a sphere centred on the origin.
 *
 * @param {object} options
 * @param {number} options.count how many points; zero gives no points and no refusal
 * @param {number} options.radius the sphere's radius, greater than zero
 * @returns {Float32Array} three numbers per point, in generation order, centred on the origin
 * @throws {TypeError} when the count is not a whole number of zero or more, or the radius is not
 *   positive
 */
export function pointSphere({ count, radius }) {
  const points = asCount(count, "count", 0);

  if (typeof radius !== "number" || !Number.isFinite(radius) || radius <= 0) {
    throw new TypeError("a sphere's radius must be a positive number");
  }

  if (points === 0) {
    return new Float32Array(0);
  }

  const placed = new Float32Array(points * 3);
  const centre = [0, 0, 0];

  for (let index = 0; index < points; index += 1) {
    // Bands of equal height rather than equal angle: the sphere's area is even in y, so stepping
    // evenly in y is what spreads the points evenly over the surface. Placing each point at its band's
    // centre rather than its edge is what keeps a count of one off the pole and out of the middle of a
    // band it would otherwise share with nobody.
    const height = 1 - (2 * (index + 0.5)) / points;
    const ring = Math.sqrt(Math.max(0, 1 - height * height));
    const turn = index * GOLDEN_ANGLE;
    const at = index * 3;

    placed[at] = ring * Math.cos(turn) * radius;
    placed[at + 1] = height * radius;
    placed[at + 2] = ring * Math.sin(turn) * radius;

    centre[0] += placed[at];
    centre[1] += placed[at + 1];
    centre[2] += placed[at + 2];
  }

  // Shifted onto the origin, in the same units: the cluster is what a reader sees, and where it sits
  // matters more than whether a point is on the surface to the last float.
  let furthest = 0;

  for (let index = 0; index < points; index += 1) {
    const at = index * 3;

    placed[at] -= centre[0] / points;
    placed[at + 1] -= centre[1] / points;
    placed[at + 2] -= centre[2] / points;

    furthest = Math.max(furthest, Math.hypot(placed[at], placed[at + 1], placed[at + 2]));
  }

  // Scaled so the cluster's outermost point is the radius it was asked for. A single point has no
  // edge and no direction: it stays where the shift left it, at the centre.
  if (furthest > 0) {
    const scale = radius / furthest;

    for (let at = 0; at < placed.length; at += 1) {
      placed[at] *= scale;
    }
  }

  return placed;
}
