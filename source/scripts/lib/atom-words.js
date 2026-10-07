/**
 * The words an atom is described in.
 *
 * Both halves of the atoms page need the same sentences — the build writes them under the fallback
 * diagram and into the canvas' accessible name, and the browser writes them again every time a count
 * changes — and a page that said "6 protons" in the diagram and "six protons" in the announcement
 * would be two descriptions of one atom. So the sentences live here, pure, and both halves read them.
 *
 * The rule they exist to keep is honesty about counts that are not an element. `atom-model.js` refuses
 * to draw carbon's shells around eleven protons; these sentences refuse to call a count an element
 * that no element has, and say what the atom would be instead.
 */

import { neutronsFor } from "./atom-model.js";

/**
 * How many of a particle, in words a sentence can use.
 *
 * @param {number} count
 * @param {string} word
 * @returns {string}
 */
export function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * The counts an element opens on: as many electrons as protons, and the neutrons its weight names.
 *
 * @param {object} record
 * @returns {{ protons: number, neutrons: number, electrons: number }}
 */
export function countsFor(record) {
  return {
    protons: record.atomicNumber,
    neutrons: neutronsFor(record),
    electrons: record.atomicNumber,
  };
}

/**
 * What the three counts are, in English.
 *
 * @param {{ protons: number, neutrons: number, electrons: number }} counts
 * @returns {string}
 */
export function countsSentence(counts) {
  return (
    `${plural(counts.protons, "proton")}, ${plural(counts.neutrons, "neutron")} and ` +
    `${plural(counts.electrons, "electron")}`
  );
}

/**
 * The charge, in words: a reader who has taken the electrons away should be told what that means.
 *
 * @param {{ protons: number, electrons: number }} counts
 * @returns {string}
 */
export function chargeSentence(counts) {
  const charge = counts.protons - counts.electrons;

  if (charge === 0) {
    return "no charge";
  }

  return `a charge of ${charge > 0 ? "+" : "\u2212"}${Math.abs(charge)}`;
}

/**
 * The whole atom in one sentence: the element when the counts name one, and the plain truth when they
 * do not.
 *
 * @param {object | null} record
 * @param {{ protons: number, neutrons: number, electrons: number }} counts
 * @returns {string}
 */
export function atomSentence(record, counts) {
  const mass = counts.protons + counts.neutrons;
  const subject = record
    ? `${record.name}-${mass}`
    : `Not an element — no element has ${plural(counts.protons, "proton")}`;

  return `${subject}: ${countsSentence(counts)}, with ${chargeSentence(counts)}.`;
}
