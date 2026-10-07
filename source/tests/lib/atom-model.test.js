import { test } from "node:test";
import assert from "node:assert/strict";

import { buildAtom, NEUTRON, PROTON } from "../../scripts/lib/atom-model.js";
import { placeElectrons } from "../../scripts/lib/atom-orbit.js";
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
  // The base radius, carried out by the nucleus' own share: even hydrogen's single proton pushes its
  // ring out a little, because the rule is the reference's and knows nothing of how small it is.
  assert.equal(
    hydrogen.shells[0].radius,
    SCALE.orbitBase * (1 + SCALE.orbitSpread * hydrogen.nucleusRadius),
  );
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

/**
 * The distance from each nucleon to the nearest other one, in units of a nucleon's own diameter.
 *
 * One is touching, less than one is overlapping, and more than one is a gap you can see through. This
 * is the number the packing is chosen for, and the only way to say "the nucleus is a clump" that is a
 * measurement rather than a description.
 *
 * @param {object} built
 * @returns {number[]}
 */
function nearestNeighbourGaps(built) {
  const { positions } = built.nucleons;
  const diameter = built.particleRadius * 2;
  const gaps = [];

  for (let one = 0; one < built.nucleonCount; one += 1) {
    let nearest = Number.POSITIVE_INFINITY;

    for (let other = 0; other < built.nucleonCount; other += 1) {
      if (one === other) {
        continue;
      }

      nearest = Math.min(
        nearest,
        Math.hypot(
          positions[one * 3] - positions[other * 3],
          positions[one * 3 + 1] - positions[other * 3 + 1],
          positions[one * 3 + 2] - positions[other * 3 + 2],
        ),
      );
    }

    gaps.push(nearest / diameter);
  }

  return gaps;
}

test("a nucleus is a clump of spheres rather than a shell with gaps in it", () => {
  // The packing is the reference's own nucleus scale factor, and this is what it is for. Before it, the
  // cluster radius was a third larger and every element showed daylight between its nucleons: carbon at
  // 1.55 diameters apart and iron at 1.27. Now every element but helium touches, and everything from
  // carbon up overlaps — which is what makes a nucleus read as one lump of matter rather than as a
  // scatter of spheres the camera happens to have caught.
  const means = [];
  const worsts = [];
  const tooSmallToClump = [];

  for (const record of records) {
    const built = atom({
      record,
      protons: record.atomicNumber,
      neutrons: Math.max(0, Math.round(record.atomicWeight) - record.atomicNumber),
      electrons: record.atomicNumber,
    });

    if (built.nucleonCount < 2) {
      continue;
    }

    if (built.nucleonCount < 12) {
      tooSmallToClump.push(record.symbol);
    }

    const gaps = nearestNeighbourGaps(built);
    const mean = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const worst = Math.max(...gaps);

    assert.ok(mean <= 1.05, `${record.symbol} sits ${mean} diameters apart on average`);
    means.push(mean);

    if (built.nucleonCount >= 12) {
      // Every nucleon of every element with a dozen or more of them overlaps a neighbour: a sphere that
      // touched nothing would be the gap the eye finds first.
      assert.ok(worst < 1, `${record.symbol} has a nucleon ${worst} diameters from its nearest`);
      worsts.push(worst);
    }
  }

  assert.equal(means.length, records.length - 1, "every element but hydrogen was measured");
  assert.deepEqual(
    tooSmallToClump,
    ["He", "Li", "Be", "B"],
    "four nucleons is the smallest set that cannot all touch, and five elements are that light",
  );
  assert.equal(worsts.length, records.length - 5, "the other 113 overlap at least one neighbour");

  // And the heaviest are the tightest, which is the cube root of the count showing through.
  assert.ok(Math.min(...worsts) < 0.65, `the tightest element's worst gap is ${Math.min(...worsts)}`);
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

test("the rings step outward from the base radius, carried out by the nucleus", () => {
  const oganesson = atom({ record: recordFor(118), protons: 118, neutrons: 176, electrons: 118 });
  const spread = 1 + SCALE.orbitSpread * oganesson.nucleusRadius;

  assert.equal(oganesson.shells.length, 7);

  for (const { number, radius } of oganesson.shells) {
    const wanted = Math.max(SCALE.orbitBase, oganesson.nucleusRadius + SCALE.nucleonRadius) * spread;

    assert.ok(Math.abs(radius - (wanted + SCALE.orbitStep * spread * (number - 1))) < 1e-9);
  }
});

test("a heavier atom's rings stand further out than a lighter one's", () => {
  // What the spread is for: the rings are placed against the nucleus rather than around a fixed box, so
  // the whole picture grows with the element instead of a heavy nucleus swelling inside rings that
  // stayed where they were.
  const light = atom({ record: recordFor(1), protons: 1, neutrons: 0, electrons: 1 });
  const heavy = atom({ record: recordFor(92), protons: 92, neutrons: 146, electrons: 92 });
  const growth = heavy.shells[0].radius / light.shells[0].radius;

  assert.ok(growth > 1, `uranium's first ring is only ${growth} of hydrogen's`);
  assert.ok(
    Math.abs(growth - (1 + SCALE.orbitSpread * heavy.nucleusRadius) / (1 + SCALE.orbitSpread * light.nucleusRadius)) < 1e-9,
    "the growth is the spread's own ratio and nothing else",
  );

  // And it is a nudge rather than a second nucleus: the rings still sit where the base radius put them.
  assert.ok(growth < 1.5, `uranium's rings grew by ${growth}`);
});

test("every ring has a plane of its own, and the first three are the picture's own", () => {
  const oganesson = atom({ record: recordFor(118), protons: 118, neutrons: 176, electrons: 118 });
  const normals = oganesson.shells.map((shell) => [shell.orientation[4], shell.orientation[5], shell.orientation[6]]);

  assert.equal(normals.length, 7);

  for (const [index, normal] of normals.entries()) {
    const length = Math.hypot(...normal);

    assert.ok(Math.abs(length - 1) < 1e-9, `ring ${index + 1}'s plane is not a plane: |n| = ${length}`);
  }

  for (let one = 0; one < normals.length; one += 1) {
    for (let other = one + 1; other < normals.length; other += 1) {
      const facing = Math.abs(
        normals[one][0] * normals[other][0] +
          normals[one][1] * normals[other][1] +
          normals[one][2] * normals[other][2],
      );

      assert.ok(facing < 0.99, `rings ${one + 1} and ${other + 1} share a plane`);
    }
  }

  // The first three are fixed rather than derived: one upright, one flat in the plane the rings are
  // built in, and one tipped halfway between the two.
  assert.deepEqual(normals[0].map((value) => Math.round(value * 1e6) / 1e6), [0, 1, 0]);
  assert.deepEqual(normals[1].map((value) => Math.round(value * 1e6) / 1e6), [0, 0, -1]);
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
    const spread = 1 + SCALE.orbitSpread * built.nucleusRadius;

    for (let index = 1; index < built.shells.length; index += 1) {
      const gap = built.shells[index].radius - built.shells[index - 1].radius;

      assert.ok(Math.abs(gap - SCALE.orbitStep * spread) < 1e-9);
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

test("an atom with no protons and no neutrons is empty rather than an error", () => {
  // The controls let a reader reach this: protons, neutrons and electrons are all free counts, and the
  // only honest picture of nothing is an empty stage. A refusal here would be a reader's zero turning
  // into a thrown error on a page.
  const empty = buildAtom({ record: null, protons: 0, neutrons: 0, electrons: 0, scale: SCALE });

  assert.equal(empty.nucleonCount, 0);
  assert.equal(empty.particleCount, 0);
  assert.equal(empty.nucleusRadius, 0);
  assert.equal(empty.nucleons.positions.length, 0);
  assert.equal(empty.nucleons.kinds.length, 0);
  assert.deepEqual(empty.shells, [], "no electrons, no rings");
  assert.equal(empty.orbitInner, SCALE.orbitBase, "the rings it would have had still start at the base");
  assert.equal(empty.labels.kind, "no-protons");
  assert.match(empty.labels.note, /not an atom of any element/);

  // And with neutrons but no protons it is a cluster of them with nowhere for electrons to be.
  const neutronsOnly = buildAtom({ record: null, protons: 0, neutrons: 12, electrons: 0, scale: SCALE });

  assert.equal(neutronsOnly.nucleonCount, 12);
  assert.equal(neutronsOnly.labels.kind, "no-protons");
  assert.ok(neutronsOnly.nucleusRadius > 0, "neutrons still make a nucleus");
  assert.equal(neutronsOnly.nucleons.kinds.every((kind) => kind === NEUTRON), true);
});
