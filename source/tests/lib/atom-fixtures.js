/**
 * What the atom model's tests are built from: the real records, and the real scale.
 *
 * Not a test file — `node --test source/tests` runs files named as tests, and this is the fixture half
 * the two model test files share. It reads `data/elements.json` and `tokens.css` themselves, so a test
 * that says "carbon's rings" is talking about the data the site ships and the scale the scene draws at
 * rather than about numbers typed here that were true once.
 *
 * The same reason `tests/components/webgl-stub.js` is a module rather than a block copied twice.
 */

import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

import { buildAtom } from "../../scripts/lib/atom-model.js";

/** The records the site publishes. */
export const records = JSON.parse(
  await readFile(new URL("../../data/elements.json", import.meta.url), "utf8"),
);

/** Every custom property `tokens.css` declares, by name. */
const declared = new Map(
  [...(await readFile(new URL("../../styles/tokens.css", import.meta.url), "utf8")).matchAll(
    /(--[a-z0-9-]+)\s*:\s*([^;]+);/g,
  )].map((match) => [match[1], match[2].trim()]),
);

/**
 * A token's value, refusing a name the stylesheet does not declare.
 *
 * @param {string} name
 * @returns {number}
 */
export function token(name) {
  assert.ok(declared.has(name), `tokens.css declares no ${name}`);

  return Number.parseFloat(declared.get(name));
}

/**
 * The record for an atomic number, refusing one the data does not hold.
 *
 * @param {number} atomicNumber
 * @returns {object}
 */
export function recordFor(atomicNumber) {
  const record = records.find((entry) => entry.atomicNumber === atomicNumber);

  assert.ok(record, `no record for ${atomicNumber} protons`);

  return record;
}

/**
 * The scene's own scale, as `tokens.css` §21 declares it.
 *
 * A model is only ever drawn at one scale and these five numbers are that scale: if the stylesheet
 * moves one, the picture moves with it, and the tests say so.
 */
export const SCALE = {
  nucleonRadius: token("--atom-nucleon-radius"),
  nucleusPacking: token("--atom-nucleus-packing"),
  orbitBase: token("--atom-orbit-base"),
  orbitStep: token("--atom-orbit-step"),
  orbitSpeed: token("--atom-orbit-speed"),
};

/**
 * A model at that scale.
 *
 * @param {object} options as `buildAtom` takes them
 * @returns {object}
 */
export function atom(options) {
  return buildAtom({ scale: SCALE, ...options });
}
