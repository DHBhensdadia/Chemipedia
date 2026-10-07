/**
 * One atom, from three counts to everything the scene draws.
 *
 * This is the feature's core and it is arithmetic: no canvas, no graphics card, no DOM, no clock. It
 * takes the element record the counts match, three counts and the scene's own scale, and answers the
 * three questions the picture needs — where each nucleon sits and what kind it is, which ring each
 * electron belongs to and how fast that ring turns, and what the counts add up to in words.
 *
 * **The model is Bohr's, on purpose, and the reference's.** Shells are rings, one sphere per electron,
 * electrons placed by count rather than by orbital. That is not an approximation anyone is being
 * asked to forgive; it is the picture a reader can understand at a glance, which is the whole point of
 * a viewer. Nothing here claims a quantum orbital.
 *
 * **Deterministic, where the reference shuffles.** Which nucleon is a proton is decided by arithmetic
 * over the point order, not by a random number generator or a shuffle, so carbon-12 is the same
 * picture on every visit and a test can hold it still. The reference reshuffles its protons on every
 * mount; a nucleus that looked different each time could not be compared with itself.
 *
 * **Where the rings face, and where their electrons are, is `atom-orbit.js`.** A shell leaves here
 * carrying the plane it lies in and the phases its electrons start at; that module turns a shell into
 * places, once a frame, and nothing in either file needs the other to be a scene.
 *
 * **Honest about the states that are not an element.** The counts are free, so a reader will reach
 * seven protons and forty neutrons, or no protons at all. The model names the element when the proton
 * count matches one, and otherwise says so in `labels.note` and `labels.kind` rather than inventing a
 * symbol. Nothing is capped and nothing is silently corrected: the picture is of the counts asked for.
 *
 * **Refusals rather than guesses.** A fractional count, a negative one, a scale that is not positive,
 * a record whose atomic number is not the proton count it was handed with — each is a mistake in the
 * caller, and each is thrown where it was made rather than drawn as a plausible-looking atom.
 */

import { GOLDEN_ANGLE, pointSphere } from "./point-sphere.js";
import { shellOrientation } from "./atom-orbit.js";

/** The kind of a nucleon that carries the element's identity. */
export const PROTON = 1;

/** The kind of a nucleon that carries the mass and decides the isotope. */
export const NEUTRON = 0;

/**
 * How an orbit's angular speed falls off with its distance: ω ∝ r^(−3/2).
 *
 * Not a design value — it is Kepler's third law, the same relation that sets how long a planet takes
 * to go round. It is here because an inner ring that turned as slowly as an outer one would read as a
 * still picture, and it is the honest rate to fall off at rather than a number chosen to look nice.
 */
const KEPLER = 1.5;

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError} when the value is not a whole number of zero or more
 */
function asCount(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a whole number, zero or more`);
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError} when the value is not a finite number of zero or more
 */
function asSpread(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a number of zero or more`);
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError} when the value is not a positive finite number
 */
function asScale(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive number`);
  }

  return value;
}

/**
 * @param {number} count
 * @param {string} word
 * @returns {string}
 */
function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * How many electrons a shell holds.
 *
 * The record's own shell array is the answer wherever it reaches, because that is the element's
 * measured configuration and the picture should be the element's. Past its last ring the textbook
 * rule stands in — the nth shell holds up to 2n² — which only ever matters for a reader who has pushed
 * the electron count above anything the element has, and which gives that case one more ring instead
 * of a ring carrying more electrons than any shell holds.
 *
 * @param {object | null} record
 * @param {number} number the shell's number, counting from one
 * @returns {number}
 */
function shellCapacity(record, number) {
  const measured = record?.shells?.[number - 1];

  return Number.isInteger(measured) && measured > 0 ? measured : 2 * number * number;
}

/**
 * Whether the nucleon at a given place in the cluster is a proton.
 *
 * The protons are spread through the point order rather than gathered at the front, because the
 * reference has that same problem — a nucleus whose protons and neutrons sat in two halves would show
 * a red half and a grey half — and solves it by shuffling. This is the shuffle done by arithmetic:
 * comparing how many protons *should* have appeared by this point with how many should have appeared
 * by the next one puts them as evenly through the order as they can be, and puts them in the same
 * places every time.
 *
 * @param {number} index
 * @param {number} protons
 * @param {number} count
 * @returns {number} `PROTON` or `NEUTRON`
 */
function kindAt(index, protons, count) {
  const behind = Math.floor((index * protons) / count);
  const ahead = Math.floor(((index + 1) * protons) / count);

  return ahead > behind ? PROTON : NEUTRON;
}

/**
 * The neutrons of the isotope a record's own weight names: the rounded weight less the atomic number.
 *
 * A convenience for callers that have a record and want a sensible atom to open on, not a rule of the
 * model — `buildAtom` draws whatever counts it is handed. Its honest limits belong beside it, because
 * one element shows them plainly: copper's weight rounds to 64, and 64 is neither of its isotopes, so
 * this answers 35 neutrons where Cu-63 has 34 and Cu-65 has 36.
 *
 * @param {{ atomicNumber: number, atomicWeight?: number }} record
 * @returns {number} zero or more
 */
export function neutronsFor(record) {
  const weight = Number(record?.atomicWeight);

  if (!Number.isFinite(weight)) {
    return 0;
  }

  return Math.max(0, Math.round(weight) - record.atomicNumber);
}

/**
 * Check the record the counts were matched against, or accept that there is none.
 *
 * A record that does not belong to these protons is worse than no record: it would draw carbon's
 * shells around eleven protons and label it sodium. It is refused here, at the one place that can.
 *
 * @param {unknown} record
 * @param {number} protons
 * @returns {object | null}
 * @throws {TypeError} when the record is malformed or belongs to a different proton count
 */
function asRecord(record, protons) {
  if (record === null || record === undefined) {
    return null;
  }

  if (typeof record !== "object") {
    throw new TypeError("an element record must be an object, or nothing");
  }

  if (record.atomicNumber !== protons) {
    throw new TypeError(
      `a record for ${record.atomicNumber} protons cannot describe ${protons} protons`,
    );
  }

  for (const field of ["symbol", "name"]) {
    if (typeof record[field] !== "string" || record[field].length === 0) {
      throw new TypeError(`a record must carry a ${field}`);
    }
  }

  if (!Array.isArray(record.shells) || record.shells.length === 0) {
    throw new TypeError("a record must carry the shells its electrons occupy");
  }

  for (const electrons of record.shells) {
    if (!Number.isInteger(electrons) || electrons < 1) {
      throw new TypeError("every shell in a record must hold a whole number of electrons");
    }
  }

  return record;
}

/**
 * The words for the counts, and the honest ones for the states that are not an element.
 *
 * @param {object | null} record
 * @param {{ protons: number, neutrons: number, electrons: number, massNumber: number }} counts
 * @returns {object}
 */
function labelsFor(record, { protons, neutrons, electrons, massNumber }) {
  const charge = protons - electrons;
  const chargeLabel =
    charge === 0 ? "no charge" : `a charge of ${charge > 0 ? "+" : "\u2212"}${Math.abs(charge)}`;
  const particles =
    `${plural(protons, "proton")}, ${plural(neutrons, "neutron")} and ` +
    `${plural(electrons, "electron")}`;
  const kind = record ? "element" : protons === 0 ? "no-protons" : "not-an-element";
  const subject = record ? `${record.name}-${massNumber}` : "Not an element";
  const note =
    kind === "element"
      ? null
      : kind === "no-protons"
        ? "A nucleus with no protons is not an atom of any element: the proton count is what decides " +
          "which element an atom is."
        : `This viewer's data holds no element with ${protons} protons, so this is a picture of the ` +
          "counts rather than of an element.";

  return {
    symbol: record?.symbol ?? null,
    name: record?.name ?? null,
    massNumber,
    isotope: record ? `${record.symbol}-${massNumber}` : null,
    charge,
    chargeLabel,
    kind,
    note,
    description: `${subject}: ${particles}, with ${chargeLabel}.`,
  };
}

/**
 * Build the whole model of one atom.
 *
 * @param {object} options
 * @param {object | null} options.record the element the proton count matches, or nothing
 * @param {number} options.protons
 * @param {number} options.neutrons
 * @param {number} options.electrons
 * @param {object} options.scale the scene's own numbers, read from the token layer by the caller
 * @param {number} options.scale.nucleonRadius
 * @param {number} options.scale.nucleusPacking how loosely the nucleons are packed: the cluster's
 *   radius is `nucleonRadius · ∛count · packing`
 * @param {number} options.scale.orbitBase the innermost ring's radius, before any clearing of the
 *   nucleus
 * @param {number} options.scale.orbitStep how much further out each ring after the first sits
 * @param {number} options.scale.orbitSpread how much further out every ring sits for each unit of
 *   the nucleus' radius, so that a heavier atom's rings reach past a heavier nucleus
 * @param {number} options.scale.orbitSpeed radians a second the innermost ring turns at
 * @returns {object} the model: nucleons, shells and labels
 * @throws {TypeError} when a count is not a whole number of zero or more, a scale is not positive, or
 *   the record does not describe these protons
 */
export function buildAtom({ record = null, protons, neutrons, electrons, scale }) {
  const protonCount = asCount(protons, "protons");
  const neutronCount = asCount(neutrons, "neutrons");
  const electronCount = asCount(electrons, "electrons");
  const element = asRecord(record, protonCount);
  const {
    nucleonRadius,
    nucleusPacking,
    orbitBase,
    orbitStep,
    orbitSpread,
    orbitSpeed,
  } = scale ?? {};

  asScale(nucleonRadius, "a nucleon's radius");
  asScale(nucleusPacking, "a nucleus' packing");
  asScale(orbitBase, "an orbit's base radius");
  asScale(orbitStep, "an orbit's step");
  asSpread(orbitSpread, "an orbit's spread");
  asScale(orbitSpeed, "an orbit's speed");

  const nucleonCount = protonCount + neutronCount;

  // A nucleus the size of the matter in it: the volume rises with the number of nucleons, so the
  // radius rises with its cube root, and the packing factor is what makes the cluster look like
  // touching spheres rather than a dust of them.
  const nucleusRadius = nucleonRadius * Math.cbrt(nucleonCount) * nucleusPacking;

  // A nucleus with nothing in it is an empty set of points rather than a sphere of radius zero: the
  // controls can reach a state with no protons and no neutrons at all, and a stage that goes empty is
  // the honest answer where a refusal would be an error a reader caused by typing zero in a field.
  const positions =
    nucleonCount === 0 ? new Float32Array(0) : pointSphere({ count: nucleonCount, radius: nucleusRadius });
  const kinds = new Uint8Array(nucleonCount);

  for (let index = 0; index < nucleonCount; index += 1) {
    kinds[index] = kindAt(index, protonCount, nucleonCount);
  }

  // Every ring reaches further out than the bare base by a share of the nucleus' own radius, which is
  // what keeps a heavier atom's rings *around* its heavier nucleus rather than swallowed by it: the
  // picture grows with the element, the way the reference's does.
  const spread = 1 + orbitSpread * nucleusRadius;

  // No ring may pass through the nucleus. The base radius is what the picture is built around, and it
  // is only overruled by a nucleus too large for it — a reader can slide the neutrons up without
  // anything above them stopping, and a ring through the middle of the nucleons would be the model's
  // fault rather than theirs.
  const orbitInner = Math.max(orbitBase, nucleusRadius + nucleonRadius) * spread;
  const shells = [];
  let placed = 0;

  for (let number = 1; placed < electronCount; number += 1) {
    const taking = Math.min(shellCapacity(element, number), electronCount - placed);
    const radius = orbitInner + orbitStep * spread * (number - 1);
    const phases = new Float64Array(taking);

    for (let electron = 0; electron < taking; electron += 1) {
      // Evenly spaced around the ring, which is what makes a full shell read as a ring of electrons
      // rather than a clump, and each ring's whole pattern turned by the golden angle so that one
      // shell's electrons do not line up behind another's.
      phases[electron] = (electron * 2 * Math.PI) / taking + number * GOLDEN_ANGLE;
    }

    shells.push({
      number,
      electrons: taking,
      radius,
      orientation: shellOrientation(number),
      angularSpeed: orbitSpeed * Math.pow(orbitInner / radius, KEPLER),
      phases,
    });
    placed += taking;
  }

  const massNumber = protonCount + neutronCount;

  return {
    protons: protonCount,
    neutrons: neutronCount,
    electrons: electronCount,
    nucleonCount,
    particleCount: nucleonCount + electronCount,
    massNumber,
    particleRadius: nucleonRadius,
    nucleusRadius,
    orbitInner,
    nucleons: { count: nucleonCount, positions, kinds },
    shells,
    labels: labelsFor(element, { protons: protonCount, neutrons: neutronCount, electrons: electronCount, massNumber }),
  };
}
