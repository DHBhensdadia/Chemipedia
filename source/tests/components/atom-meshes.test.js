import { test } from "node:test";
import assert from "node:assert/strict";

import { createRingShapes, createSphereInstances } from "../../scripts/components/atom-meshes.js";
import { callsOf, createGlStub, memoryOf } from "./webgl-stub.js";

/** The unit sphere both the mesh and the instance buffers are built with. */
const SPHERE = { segments: 8, rings: 6 };

/** How many triangles the sphere above is made of, which is what a draw has to ask for. */
const SPHERE_INDICES = SPHERE.segments * SPHERE.rings * 6;

/** Every attribute the sphere program declares, which is what its buffers are bound to. */
const SPHERE_ATTRIBUTES = ["aPosition", "aNormal", "aOffset", "aRadius", "aColour", "aGlow"];

/** The two attributes the ring program declares. */
const RING_ATTRIBUTES = ["aPosition", "aNormal"];

/**
 * The attribute locations one program would have handed back, by name.
 *
 * The program has to be the same object for every name: locations belong to a program, and asking a
 * different one each time would number every attribute from zero.
 *
 * @param {object} gl
 * @param {string[]} names
 * @returns {Record<string, object>}
 */
function locations(gl, names) {
  const program = { id: "program" };

  return Object.fromEntries(names.map((name) => [name, gl.getAttribLocation(program, name)]));
}

/**
 * A list of particles, of the shape the view passes on.
 *
 * @param {number} count
 * @returns {object}
 */
function particles(count) {
  return {
    count,
    positions: Array.from({ length: count * 3 }, (unused, at) => at),
    radii: Array.from({ length: count }, (unused, at) => 0.2 + at / 1000),
    colours: Array.from({ length: count * 3 }, (unused, at) => (at % 3) / 2),
    glows: Array.from({ length: count }, (unused, at) => at / count),
  };
}

/**
 * @param {object} [ring]
 * @returns {object}
 */
function ring(ring = {}) {
  return {
    radius: 2,
    tube: 0.007,
    segments: 32,
    tubeSegments: 8,
    colour: [0.2, 0.8, 1],
    opacity: 0.15,
    ...ring,
  };
}

test("the sphere is uploaded once, and then only the particles change", () => {
  const gl = createGlStub();
  const mesh = createSphereInstances(gl, { attribs: locations(gl, SPHERE_ATTRIBUTES), ...SPHERE });

  assert.equal(mesh.capacity(), 0, "nothing should be reserved before anything is drawn");

  mesh.set(particles(90));

  const afterFirst = callsOf(gl, "bufferData").length;

  mesh.set(particles(90));
  mesh.set(particles(40));

  assert.equal(
    callsOf(gl, "bufferData").length,
    afterFirst,
    "a scene that redraws the same atom should reallocate nothing",
  );
  assert.equal(
    callsOf(gl, "bufferSubData").length,
    12,
    "three uploads of four buffers each, and nothing else",
  );
});

test("room is made for at least twice what there was, and never given back", () => {
  const gl = createGlStub();
  const mesh = createSphereInstances(gl, { attribs: locations(gl, SPHERE_ATTRIBUTES), ...SPHERE });

  mesh.set(particles(4));
  assert.equal(mesh.capacity(), 16, "the smallest capacity should still hold a hydrogen atom");

  const small = callsOf(gl, "bufferData").length;

  mesh.set(particles(20));
  assert.equal(mesh.capacity(), 32, "twenty particles in room for sixteen should double it");
  assert.ok(callsOf(gl, "bufferData").length > small, "growing should have replaced the buffers");

  const grown = callsOf(gl, "bufferData").length;

  mesh.set(particles(30));
  assert.equal(mesh.capacity(), 32);
  assert.equal(callsOf(gl, "bufferData").length, grown, "what already fits should not be rebuilt");
});

test("each kind of particle number is uploaded on its own, tightly packed", () => {
  const gl = createGlStub();
  const mesh = createSphereInstances(gl, { attribs: locations(gl, SPHERE_ATTRIBUTES), ...SPHERE });
  const list = {
    count: 2,
    positions: [1, 2, 3, 4, 5, 6],
    radii: [0.5, 0.25],
    colours: [1, 0, 0, 0, 1, 0],
    glows: [0, 0.5],
  };

  mesh.set(list);

  const uploads = callsOf(gl, "bufferSubData");

  // In the order the shader declares them, each exactly as wide as its attribute: an offset is three
  // numbers, a radius one, and no buffer carries padding it does not need.
  assert.deepEqual([...uploads[0].data.slice(0, 6)], [1, 2, 3, 4, 5, 6]);
  assert.deepEqual([...uploads[1].data.slice(0, 2)], [0.5, 0.25]);
  assert.deepEqual([...uploads[2].data.slice(0, 6)], [1, 0, 0, 0, 1, 0]);
  assert.deepEqual([...uploads[3].data.slice(0, 2)], [0, 0.5]);
});

test("the sphere is bound once per vertex and the particles once per instance", () => {
  const gl = createGlStub();
  const mesh = createSphereInstances(gl, { attribs: locations(gl, SPHERE_ATTRIBUTES), ...SPHERE });

  mesh.set(particles(3));

  const pointers = callsOf(gl, "vertexAttribPointer");
  const widths = Object.fromEntries(
    SPHERE_ATTRIBUTES.map((name) => [
      name,
      [...new Set(pointers.filter((call) => call.location.name === name).map((call) => call.stride))],
    ]),
  );

  // The mesh's own vertices are shared by every instance, so nothing advances between them; each
  // particle's numbers are exactly as wide as the attribute that carries them.
  assert.deepEqual(widths.aPosition, [0]);
  assert.deepEqual(widths.aNormal, [0]);
  assert.deepEqual(widths.aOffset, [3 * Float32Array.BYTES_PER_ELEMENT]);
  assert.deepEqual(widths.aRadius, [Float32Array.BYTES_PER_ELEMENT]);
  assert.deepEqual(widths.aColour, [3 * Float32Array.BYTES_PER_ELEMENT]);
  assert.deepEqual(widths.aGlow, [Float32Array.BYTES_PER_ELEMENT]);

  const divisors = Object.fromEntries(
    SPHERE_ATTRIBUTES.map((name) => [
      name,
      [...new Set(callsOf(gl, "vertexAttribDivisor")
        .filter((call) => call.location.name === name)
        .map((call) => call.divisor))],
    ]),
  );

  assert.deepEqual(divisors, {
    aPosition: [0],
    aNormal: [0],
    aOffset: [1],
    aRadius: [1],
    aColour: [1],
    aGlow: [1],
  });
});

test("an attribute the driver dropped is skipped rather than bound at a negative location", () => {
  const gl = createGlStub({ dropped: ["aNormal"] });
  const attribs = locations(gl, SPHERE_ATTRIBUTES);

  assert.equal(attribs.aNormal, -1, "the stub should have dropped the normal");

  const mesh = createSphereInstances(gl, { attribs, ...SPHERE });

  mesh.set(particles(2));

  assert.equal(
    callsOf(gl, "vertexAttribPointer").some((call) => call.location === -1),
    false,
    "a negative location is not an attribute",
  );
  assert.equal(
    callsOf(gl, "enableVertexAttribArray").some((call) => call.location === -1),
    false,
  );
  assert.ok(
    callsOf(gl, "vertexAttribPointer").some((call) => call.location.name === "aPosition"),
    "the attribute that survived should still be bound",
  );
});

test("the particles are one instanced call, whatever the atom is made of", () => {
  const gl = createGlStub();
  const mesh = createSphereInstances(gl, { attribs: locations(gl, SPHERE_ATTRIBUTES), ...SPHERE });

  assert.equal(mesh.draw(90), false, "there is nothing to draw before anything is uploaded");

  mesh.set(particles(90));

  assert.equal(mesh.draw(0), false, "an atom with no particles draws nothing");

  assert.equal(mesh.draw(90), true);

  const draws = callsOf(gl, "drawElementsInstanced");

  assert.equal(draws.length, 1, "ninety spheres should be one call, not ninety");
  assert.equal(draws[0].instances, 90);
  assert.equal(draws[0].count, SPHERE_INDICES);
  assert.equal(draws[0].mode, gl.TRIANGLES);
  assert.equal(draws[0].type, gl.UNSIGNED_SHORT);
});

test("disposing the mesh gives back every buffer and array it made", () => {
  const gl = createGlStub();
  const mesh = createSphereInstances(gl, { attribs: locations(gl, SPHERE_ATTRIBUTES), ...SPHERE });

  mesh.set(particles(20));
  mesh.set(particles(60));
  mesh.dispose();

  assert.deepEqual(memoryOf(gl).outstanding, [], "nothing should be left on the card");
});

test("a ring's mesh is built once per radius, however many shells ask for it", () => {
  const gl = createGlStub();
  const rings = createRingShapes(gl, { attribs: locations(gl, RING_ATTRIBUTES) });

  const first = rings.prepare([ring(), ring({ radius: 3.2 })]);
  const buffers = callsOf(gl, "createBuffer").length;

  assert.equal(rings.size(), 2);
  assert.equal(first.length, 2);

  const again = rings.prepare([ring(), ring({ radius: 3.2 })]);

  assert.equal(rings.size(), 2, "the same two radii should not be built twice");
  assert.equal(callsOf(gl, "createBuffer").length, buffers);
  assert.equal(again[0].shape, first[0].shape, "the cache is the mesh, not a copy of it");
});

test("two shells of one radius still keep their own colour and transparency", () => {
  const gl = createGlStub();
  const rings = createRingShapes(gl, { attribs: locations(gl, RING_ATTRIBUTES) });

  const prepared = rings.prepare([
    ring({ colour: [1, 0, 0], opacity: 0.15 }),
    ring({ colour: [0, 0, 1], opacity: 0.4 }),
  ]);

  assert.equal(rings.size(), 1, "one radius is one mesh");
  assert.deepEqual(prepared.map((entry) => entry.colour), [
    [1, 0, 0],
    [0, 0, 1],
  ]);
  assert.deepEqual(prepared.map((entry) => entry.opacity), [0.15, 0.4]);
});

test("a ring is drawn as one call, and a large one says its indices are thirty-two bit", () => {
  const gl = createGlStub();
  const rings = createRingShapes(gl, { attribs: locations(gl, RING_ATTRIBUTES) });
  const [small] = rings.prepare([ring()]);

  rings.draw(small.shape);

  assert.equal(callsOf(gl, "drawElements").length, 1);
  assert.equal(callsOf(gl, "drawElements")[0].type, gl.UNSIGNED_SHORT);

  // Past sixty-five thousand vertices a ring no longer indexes in sixteen bits, and drawing it with
  // the narrow type is a mesh that renders as nonsense rather than one that fails.
  const [large] = rings.prepare([ring({ radius: 2, segments: 256, tubeSegments: 255 })]);

  rings.draw(large.shape);

  const draws = callsOf(gl, "drawElements");

  assert.equal(draws.length, 2);
  assert.equal(draws[1].type, gl.UNSIGNED_INT);
});

test("geometry that is not a ring is refused when the rings are prepared", () => {
  const gl = createGlStub();
  const rings = createRingShapes(gl, { attribs: locations(gl, RING_ATTRIBUTES) });

  assert.throws(() => rings.prepare([ring({ radius: 1, tube: 1 })]), /thinner than the ring/);
  assert.throws(() => rings.prepare([ring({ radius: 0 })]), /positive number/);
  assert.throws(() => rings.prepare([ring({ segments: 2 })]), /at least three segments/);
});

test("disposing the rings gives back every radius that was built", () => {
  const gl = createGlStub();
  const rings = createRingShapes(gl, { attribs: locations(gl, RING_ATTRIBUTES) });

  rings.prepare([ring(), ring({ radius: 3.2 }), ring({ radius: 4.4 })]);
  rings.dispose();

  assert.equal(rings.size(), 0);
  assert.deepEqual(memoryOf(gl).outstanding, []);
});
