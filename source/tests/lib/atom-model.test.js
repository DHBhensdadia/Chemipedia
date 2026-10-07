import { test } from "node:test";
import assert from "node:assert/strict";

import { buildAtom, placeElectrons, NEUTRON, PROTON } from "../../scripts/lib/atom-model.js";
import { atom, recordFor, records, SCALE } from "./atom-fixtures.js";

/**
 * The atom's structure, held against the real element records rather than against numbers typed here.
 *
 * What the counts decide — where the nucleons sit and what kind each one is, how large the nucleus is,
 * which ring an electron belongs to and how fast that ring turns, and what the counts add up to in
 * words — is this file. Where the electrons are at a given moment is `atom-electrons.test.js`.
 *
 * A change to `data/elements.json` or to a token in §21 of `tokens.css` that would move the picture is
 * therefore a change that fails here rather than one a reader notices first.
 */

/**
 * @param {Uint8Array} kinds
 * @returns {number[]} the places a proton sits at
 */
function protonPlaces(kinds) {
  return [...kinds].flatMap((kind, index) => (kind === PROTON ? [index] : []));
}

test("hydrogen is one proton, one electron and one ring", () => {
  const hydrogen = atom({ record: recordFor(1), protons: 1, neutrons: 0, electrons: 1 });

  assert.equal(hydrogen.nucleonCount, 1);
  assert.equal(hydrogen.particleCount, 2);
  assert.equal(hydrogen.shells.length, 1);
  assert.equal(hydrogen.shells[0].electrons, 1);
  assert.equal(hydrogen.shells[0].radius, SCALE.orbitBase);
  assert.equal(hydrogen.shells[0].angularSpeed, SCALE.orbitSpeed);
  assert.deepEqual(hydrogen.labels.isotope, "H-1");
  assert.equal(hydrogen.labels.kind, "element");
  assert.equal(hydrogen.labels.note, null);
  assert.equal(hydrogen.labels.charge, 0);
  assert.equal(hydrogen.labels.chargeLabel, "no charge");
  assert.match(hydrogen.labels.description, /^Hydrogen-1: 1 proton, 0 neutrons and 1 electron/);
});

test("a single nucleon sits at the centre of its own nucleus", () => {
  const hydrogen = atom({ record: recordFor(1), protons: 1, neutrons: 0, electrons: 1 });

  // One point has no edge to spread along, which is the one case the sphere's scaling cannot improve:
  // and it is hydrogen-1, so being at the origin is also the right answer.
  assert.deepEqual([...hydrogen.nucleons.positions], [0, 0, 0]);
});

test("carbon-12 mixes its six protons through the twelve nucleons", () => {
  const carbon = atom({ record: recordFor(6), protons: 6, neutrons: 6, electrons: 6 });
  const kinds = [...carbon.nucleons.kinds];

  assert.equal(carbon.nucleonCount, 12);
  assert.equal(kinds.filter((kind) => kind === PROTON).length, 6);
  assert.equal(kinds.filter((kind) => kind === NEUTRON).length, 6);

  // Six protons in twelve places is the case where an even spread is a strict alternation: a nucleus
  // whose protons sat in one half of the order would be a red half and a grey half.
  for (let index = 1; index < kinds.length; index += 1) {
    assert.notEqual(kinds[index - 1], kinds[index], `nucleons ${index - 1} and ${index} are alike`);
  }
});

test("however many protons there are, they are spread through the cluster", () => {
  for (const [protons, neutrons] of [[1, 1], [2, 2], [6, 6], [26, 30], [92, 146], [118, 176]]) {
    const built = atom({ record: recordFor(protons), protons, neutrons, electrons: protons });
    const places = protonPlaces(built.nucleons.kinds);
    const half = Math.floor(built.nucleonCount / 2);
    const first = places.filter((place) => place < half).length;

    assert.equal(places.length, protons);
    // Equally many in each half, to within the one proton an odd count cannot split.
    assert.ok(
      Math.abs(first - (protons - first)) <= 1,
      `${protons} protons are split ${first} and ${protons - first} across the halves`,
    );

    // And no half of the cluster is untouched either.
    if (protons > 1) {
      assert.ok(places[0] < half && places.at(-1) >= half, `${protons} protons all sit on one side`);
    }
  }
});

test("the nucleus is the size of the matter in it", () => {
  const light = atom({ record: recordFor(1), protons: 1, neutrons: 0, electrons: 1 });
  const heavy = atom({ record: recordFor(92), protons: 92, neutrons: 146, electrons: 92 });

  assert.ok(Math.abs(light.nucleusRadius - SCALE.nucleonRadius * SCALE.nucleusPacking) < 1e-6);
  assert.ok(
    Math.abs(heavy.nucleusRadius - SCALE.nucleonRadius * Math.cbrt(238) * SCALE.nucleusPacking) < 1e-6,
  );
  // A quarter of a thousand nucleons in a space sized by the cube root of the count: 238 times the
  // matter in 6.2 times the radius, which is the relation that keeps a nucleus from being a solid ball
  // of its own matter.
  assert.ok(Math.abs(heavy.nucleusRadius / light.nucleusRadius - Math.cbrt(238)) < 1e-9);
  assert.ok(heavy.nucleusRadius < 7 * light.nucleusRadius);
});

test("every nucleon sits at or inside the nucleus' own radius", () => {
  for (const [protons, neutrons] of [[1, 0], [2, 1], [6, 6], [26, 30], [92, 146], [118, 176]]) {
    const built = atom({ record: recordFor(protons), protons, neutrons, electrons: protons });
    const { positions } = built.nucleons;
    let furthest = 0;

    assert.equal(positions.length, built.nucleonCount * 3);

    for (let at = 0; at < positions.length; at += 3) {
      furthest = Math.max(furthest, Math.hypot(positions[at], positions[at + 1], positions[at + 2]));
    }

    assert.ok(
      furthest <= built.nucleusRadius + 1e-5,
      `${protons}p ${neutrons}n: a nucleon sits outside the nucleus at ${furthest}`,
    );

    if (built.nucleonCount > 1) {
      // The outermost sphere is the nucleus' own edge, which is what lets the rings be placed against
      // it. A single nucleon is the one case with no edge to reach: it sits at the centre.
      assert.ok(
        Math.abs(furthest - built.nucleusRadius) < 1e-5,
        `${protons}p ${neutrons}n: furthest nucleon at ${furthest}`,
      );
    }
  }
});

test("a neutral atom of every element lands on that element's own shells", () => {
  for (const record of records) {
    const built = atom({
      record,
      protons: record.atomicNumber,
      neutrons: 0,
      electrons: record.atomicNumber,
    });

    assert.equal(built.shells.length, record.shells.length, `${record.symbol}: ring count`);
    assert.deepEqual(
      built.shells.map((shell) => shell.electrons),
      record.shells,
      `${record.symbol}: electrons per ring`,
    );
    assert.deepEqual(
      built.shells.map((shell) => shell.number),
      record.shells.map((unused, index) => index + 1),
    );
  }
});

test("the rings step outward from the base radius", () => {
  const oganesson = atom({ record: recordFor(118), protons: 118, neutrons: 176, electrons: 118 });

  assert.equal(oganesson.shells.length, 7);

  for (const { number, radius } of oganesson.shells) {
    const wanted = Math.max(SCALE.orbitBase, oganesson.nucleusRadius + SCALE.nucleonRadius);

    assert.ok(Math.abs(radius - (wanted + SCALE.orbitStep * (number - 1))) < 1e-9);
  }
});

test("no ring passes through the nucleus, however many neutrons are asked for", () => {
  for (const neutrons of [0, 6, 176, 400, 2000]) {
    const built = atom({ record: recordFor(6), protons: 6, neutrons, electrons: 12 });
    const edge = built.nucleusRadius + SCALE.nucleonRadius;

    for (const shell of built.shells) {
      assert.ok(
        shell.radius >= edge,
        `${neutrons} neutrons: ring ${shell.number} at ${shell.radius} inside a nucleus ending at ${edge}`,
      );
    }

    // And the ladder is still a ladder: the shift moves every ring rather than closing the gaps.
    for (let index = 1; index < built.shells.length; index += 1) {
      const gap = built.shells[index].radius - built.shells[index - 1].radius;

      assert.ok(Math.abs(gap - SCALE.orbitStep) < 1e-9);
    }
  }
});

test("an inner ring turns faster than an outer one, by Kepler's own ratio", () => {
  const iron = atom({ record: recordFor(26), protons: 26, neutrons: 30, electrons: 26 });
  const speeds = iron.shells.map((shell) => shell.angularSpeed);

  assert.equal(speeds[0], SCALE.orbitSpeed);

  for (let index = 1; index < iron.shells.length; index += 1) {
    const wanted = SCALE.orbitSpeed * Math.pow(iron.orbitInner / iron.shells[index].radius, 1.5);

    assert.ok(Math.abs(speeds[index] - wanted) < 1e-12, `ring ${index + 1}`);
    assert.ok(speeds[index] < speeds[index - 1], `ring ${index + 1} is not slower than ${index}`);
  }
});

test("electrons fill the inner rings before the outer ones", () => {
  const partly = atom({ record: recordFor(26), protons: 26, neutrons: 30, electrons: 10 });

  assert.deepEqual(partly.shells.map((shell) => shell.electrons), [2, 8]);
  assert.deepEqual(partly.shells.map((shell) => shell.number), [1, 2]);
});

test("electrons beyond anything the element holds get another ring, not a crowded one", () => {
  const crowded = atom({ record: recordFor(6), protons: 6, neutrons: 6, electrons: 20 });

  // Carbon's own shells are [2, 4]. Past them the textbook capacity stands in — the third shell holds
  // up to eighteen — so the fourteenth electron that will not fit in the second ring gets a third.
  assert.deepEqual(crowded.shells.map((shell) => shell.electrons), [2, 4, 14]);
});

test("the same counts give the same atom, on every call", () => {
  const one = atom({ record: recordFor(79), protons: 79, neutrons: 118, electrons: 79 });
  const other = atom({ record: recordFor(79), protons: 79, neutrons: 118, electrons: 79 });

  assert.deepEqual([...one.nucleons.positions], [...other.nucleons.positions]);
  assert.deepEqual([...one.nucleons.kinds], [...other.nucleons.kinds]);
  assert.deepEqual(
    one.shells.map((shell) => [...shell.phases]),
    other.shells.map((shell) => [...shell.phases]),
  );
});

test("a nucleus with no protons is a picture of counts, and says so", () => {
  const neutrons = atom({ record: null, protons: 0, neutrons: 4, electrons: 3 });

  assert.equal(neutrons.labels.kind, "no-protons");
  assert.equal(neutrons.labels.symbol, null);
  assert.equal(neutrons.labels.isotope, null);
  assert.equal(neutrons.labels.massNumber, 4);
  assert.equal(neutrons.labels.charge, -3);
  assert.equal(neutrons.labels.chargeLabel, "a charge of \u22123");
  assert.match(neutrons.labels.note, /not an atom of any element/);
  assert.match(neutrons.labels.description, /^Not an element/);
  assert.deepEqual([...neutrons.nucleons.kinds], [NEUTRON, NEUTRON, NEUTRON, NEUTRON]);
  assert.deepEqual(neutrons.shells.map((shell) => shell.electrons), [2, 1]);
});

test("protons no element has are drawn, and named as what they are not", () => {
  const heavy = atom({ record: null, protons: 119, neutrons: 180, electrons: 119 });

  assert.equal(heavy.labels.kind, "not-an-element");
  assert.equal(heavy.labels.name, null);
  assert.match(heavy.labels.note, /no element with 119 protons/);
  assert.equal(heavy.labels.massNumber, 299);
  // With no record, the shells are the textbook rule: 2, 8, 18 and so on, filling from the inside.
  assert.deepEqual(heavy.shells.map((shell) => shell.electrons), [2, 8, 18, 32, 50, 9]);
});

test("the charge is the electrons against the protons, in words", () => {
  const cation = atom({ record: recordFor(11), protons: 11, neutrons: 12, electrons: 10 });
  const anion = atom({ record: recordFor(17), protons: 17, neutrons: 18, electrons: 18 });

  assert.equal(cation.labels.charge, 1);
  assert.equal(cation.labels.chargeLabel, "a charge of +1");
  assert.equal(anion.labels.charge, -1);
  assert.equal(anion.labels.chargeLabel, "a charge of \u22121");
  assert.equal(atom({ record: recordFor(11), protons: 11, neutrons: 12, electrons: 11 }).labels.charge, 0);
});

test("an atom with no electrons has no rings and nothing to place", () => {
  const bare = atom({ record: recordFor(26), protons: 26, neutrons: 30, electrons: 0 });
  const where = new Float32Array(0);

  assert.deepEqual(bare.shells, []);
  assert.equal(placeElectrons(bare, 3, where), 0);
  assert.equal(bare.particleCount, 56);
  assert.equal(bare.labels.charge, 26);
});

test("counts that are not counts are refused", () => {
  const base = { record: recordFor(6), protons: 6, neutrons: 6, electrons: 6, scale: SCALE };

  assert.throws(() => buildAtom({ ...base, protons: -1 }), /protons must be a whole number/);
  assert.throws(() => buildAtom({ ...base, protons: 6.5 }), /protons must be a whole number/);
  assert.throws(() => buildAtom({ ...base, neutrons: -2 }), /neutrons must be a whole number/);
  assert.throws(() => buildAtom({ ...base, electrons: "6" }), /electrons must be a whole number/);
  assert.throws(() => buildAtom({ ...base, electrons: undefined }), /electrons must be a whole number/);
  assert.throws(() => buildAtom({ ...base, protons: Number.NaN }), /whole number/);
  assert.throws(
    () => buildAtom({ record: recordFor(6), protons: 6, neutrons: 6, electrons: 6 }),
    /a nucleon's radius must be a positive number/,
    "a model with no scale at all is a model with nothing to draw it at",
  );
});

test("a scale that is not a scale is refused", () => {
  const base = { record: recordFor(6), protons: 6, neutrons: 6, electrons: 6 };

  for (const field of ["nucleonRadius", "nucleusPacking", "orbitBase", "orbitStep", "orbitSpeed"]) {
    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, "2", undefined]) {
      assert.throws(
        () => buildAtom({ ...base, scale: { ...SCALE, [field]: value } }),
        /must be a positive number/,
        `${field} of ${String(value)} should have been refused`,
      );
    }
  }
});

test("a record that does not describe these protons is refused rather than drawn", () => {
  assert.throws(
    () => atom({ record: recordFor(6), protons: 11, neutrons: 12, electrons: 11 }),
    /a record for 6 protons cannot describe 11 protons/,
  );
  // The record that does match is taken, which is the other half of the rule.
  assert.equal(
    atom({ record: recordFor(6), protons: 6, neutrons: 6, electrons: 6 }).labels.name,
    "Carbon",
  );
});

test("a malformed record is refused rather than guessed at", () => {
  const base = { protons: 6, neutrons: 6, electrons: 6, scale: SCALE };

  assert.throws(() => buildAtom({ ...base, record: "carbon" }), /must be an object/);
  assert.throws(() => buildAtom({ ...base, record: { atomicNumber: 6 } }), /must carry a symbol/);
  assert.throws(
    () => buildAtom({ ...base, record: { atomicNumber: 6, symbol: "C" } }),
    /must carry a name/,
  );
  assert.throws(
    () => buildAtom({ ...base, record: { atomicNumber: 6, symbol: "C", name: "Carbon" } }),
    /shells its electrons occupy/,
  );
  assert.throws(
    () =>
      buildAtom({
        ...base,
        record: { atomicNumber: 6, symbol: "C", name: "Carbon", shells: [] },
      }),
    /shells its electrons occupy/,
  );
  assert.throws(
    () =>
      buildAtom({
        ...base,
        record: { atomicNumber: 6, symbol: "C", name: "Carbon", shells: [2, 4.5] },
      }),
    /whole number of electrons/,
  );
});

