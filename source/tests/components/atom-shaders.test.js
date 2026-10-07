import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createProgram,
  GRID_PROGRAM,
  RING_PROGRAM,
  SPHERE_PROGRAM,
} from "../../scripts/components/atom-shaders.js";
import { INSTANCE_ATTRIBUTES, MESH_ATTRIBUTES } from "../../scripts/components/atom-meshes.js";
import { callsOf, createGlStub } from "./webgl-stub.js";

/** Both programs, so every claim below is made about both of them. */
const PROGRAMS = [
  ["sphere", SPHERE_PROGRAM],
  ["ring", RING_PROGRAM],
  ["grid", GRID_PROGRAM],
];

/**
 * The names a source declares with one keyword, in the order they appear.
 *
 * @param {string} source
 * @param {string} keyword
 * @returns {string[]}
 */
function declared(source, keyword) {
  return [...source.matchAll(new RegExp(`^${keyword} \\w+ (\\w+);`, "gm"))].map((match) => match[1]);
}

/**
 * How many times a name appears in a source.
 *
 * @param {string} source
 * @param {string} name
 * @returns {number}
 */
function mentions(source, name) {
  return [...source.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
}

test("every source asks for GLSL ES 3.00 on its very first line", () => {
  for (const [name, program] of PROGRAMS) {
    for (const [stage, source] of [
      ["vertex", program.vertex],
      ["fragment", program.fragment],
    ]) {
      // The version has to be the first thing in the file, before any whitespace at all: a blank line
      // or an indent above it is a shader that does not compile, with a message about line 1 that
      // names nothing useful.
      assert.equal(source.split("\n")[0], "#version 300 es", `${name} ${stage}`);
      assert.ok(!source.startsWith("\uFEFF"), `${name} ${stage} has a byte-order mark`);
    }
  }
});

test("the sources are written in ES 3.00 and use nothing from ES 1.00", () => {
  for (const [name, program] of PROGRAMS) {
    for (const source of [program.vertex, program.fragment]) {
      // An input is what a shader reads from the stage before it — except for the one program whose
      // geometry comes from the vertex' own index, and that one has to say so rather than merely have
      // no inputs, or this rule would stop being a rule.
      assert.ok(
        /^in \w+ /m.test(source) || (source === program.vertex && program.attributes.length === 0 && /gl_VertexID/.test(source)),
        `${name} declares nothing to read and does not build its geometry from the vertex index either`,
      );

      // Every one of these is an ES 1.00 spelling that ES 3.00 removed outright. A shader containing
      // one does not compile, so this is the cheapest way to catch a line copied from an old example.
      assert.doesNotMatch(source, /\bvarying\b|\battribute\b|\btexture2D\b|gl_FragColor/, name);
    }

    assert.equal(
      program.attributes.length === 0,
      /gl_VertexID/.test(program.vertex),
      `${name}: a program with no attributes has to be one that uses the vertex index`,
    );

    assert.match(
      program.fragment,
      /^precision (low|medium|high)p float;$/m,
      `${name} should state its float precision`,
    );
    assert.match(program.fragment, /^out vec4 \w+;$/m, `${name} should write to its own output`);
  }
});

test("the names each program publishes are exactly the names it declares", () => {
  for (const [name, program] of PROGRAMS) {
    assert.deepEqual(declared(program.vertex, "in"), program.attributes, `${name} attributes`);

    const written = [...declared(program.vertex, "uniform"), ...declared(program.fragment, "uniform")];

    assert.deepEqual(
      [...written].sort(),
      [...program.uniforms].sort(),
      `${name} uniforms: a name the layer looks up but the shader does not declare is silently null`,
    );
  }
});

test("every attribute a program declares is one its vertex shader actually reads", () => {
  for (const [name, program] of PROGRAMS) {
    for (const attribute of program.attributes) {
      // A declaration alone is not a use: a driver drops an attribute the shader never reads, and the
      // layer then binds nothing. One mention is the declaration, so two is the floor.
      assert.ok(
        mentions(program.vertex, attribute) >= 2,
        `${name}: ${attribute} is declared but never read, and would be optimised away`,
      );
    }
  }
});

test("every attribute a mesh binds is declared by the program that draws it", () => {
  // Each mesh is drawn by one program: the spheres and the field's single triangle by the first two
  // lists below, the rings by theirs. A mesh's attributes have to be in the program that draws it — and
  // the field, which has no mesh at all, declares none.
  for (const name of MESH_ATTRIBUTES) {
    for (const [programName, program] of [
      ["sphere", SPHERE_PROGRAM],
      ["ring", RING_PROGRAM],
    ]) {
      assert.ok(
        program.attributes.includes(name),
        `the meshes bind ${name}, which the ${programName} program does not declare`,
      );
    }
  }

  assert.deepEqual(
    GRID_PROGRAM.attributes,
    [],
    "the field's triangle comes from the vertex index, so it binds nothing",
  );

  for (const part of INSTANCE_ATTRIBUTES) {
    assert.ok(
      SPHERE_PROGRAM.attributes.includes(part.name),
      `the particles bind ${part.name}, which the sphere program does not declare`,
    );
  }
});

test("the particles the layer uploads are the attributes the shader expects, one per kind", () => {
  assert.deepEqual(
    INSTANCE_ATTRIBUTES.map((part) => [part.name, part.from, part.size]),
    [
      ["aOffset", "positions", 3],
      ["aRadius", "radii", 1],
      ["aColour", "colours", 3],
      ["aGlow", "glows", 1],
    ],
  );
});

test("a program that compiles is returned with the shader objects already given back", () => {
  const gl = createGlStub();
  const program = createProgram(gl, { vertex: "vertex", fragment: "fragment" });

  assert.ok(program);
  assert.equal(callsOf(gl, "deleteShader").length, 2, "a linked program owns what it needs");
  assert.equal(callsOf(gl, "deleteProgram").length, 0);
});

test("a shader that does not compile is refused, with the driver's own message", () => {
  const gl = createGlStub({ fails: "compile" });

  assert.throws(
    () => createProgram(gl, { vertex: "vertex", fragment: "fragment" }),
    /The vertex shader did not compile: 0:1\(10\): error: stub refusal/,
  );

  assert.equal(callsOf(gl, "deleteShader").length, 1, "the shader that failed should be released");
  assert.equal(callsOf(gl, "createProgram").length, 0, "no program should have been built");
});

test("a pair that does not link is refused, and the program it made is released", () => {
  const gl = createGlStub({ fails: "link" });

  assert.throws(
    () => createProgram(gl, { vertex: "vertex", fragment: "fragment" }),
    /did not link: stub refusal: link failed/,
  );

  assert.equal(callsOf(gl, "createProgram").length, 1);
  assert.equal(callsOf(gl, "deleteProgram").length, 1);
  assert.equal(callsOf(gl, "deleteShader").length, 2);
});
