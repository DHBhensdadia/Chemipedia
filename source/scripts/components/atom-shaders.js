/**
 * The two programs the atom viewer draws with, and the one place a program is built.
 *
 * A shader is the only part of this project that is not JavaScript, so it is kept to what the scene
 * cannot express any other way: how light lands on a sphere, and how a ring's tube is shaded. Both are
 * written for **WebGL2's GLSL ES 3.00** — `#version 300 es`, which has to be the very first line of a
 * source, so the template literals below start with it and nothing may be put above them.
 *
 * Two decisions worth stating:
 *
 * **The particles are drawn in one instanced call, not one call each.** A sphere is uploaded once at
 * unit radius and each instance carries its own offset, radius, colour and glow; the shader scales the
 * unit sphere by the instance's radius, which for a sphere is a uniform scale and therefore leaves the
 * normals alone. Ninety spheres are then one draw call.
 *
 * **Every number in the shaders is a uniform.** The light's direction, its strength, the ambient floor
 * and whether a particle glows all arrive from the caller, which reads them from the token layer — so
 * the GLSL contains structure and no design value, and a change to how the atom is lit is a change in
 * `tokens.css` rather than in a shader.
 *
 * **Each program carries the names of its own attributes and uniforms.** Those names are half of the
 * shader's interface, and the other half is on the JavaScript side: a buffer bound to a name the
 * shader does not declare draws nothing, and a uniform looked up under a name that is not there is
 * silently null. Keeping the names beside the source they belong to is what lets a test compare the
 * two lists against the buffers that are actually bound.
 *
 * A program that does not compile is a failure the layer above stops for: it means the scene would be
 * drawn black, and a black canvas is far harder to diagnose than an exception naming the line of
 * GLSL. The exception is raised here and caught there.
 */

/** @param {string} source */
const VERSION_LINE = "#version 300 es";

/**
 * The particles: unit spheres placed and coloured one instance at a time.
 *
 * The sphere is scaled by the instance's radius rather than the mesh's own — which is a uniform scale,
 * so the normals survive it — and the unit sphere's vertices are also its normals, so scaling the
 * position and scaling the normal come to the same point.
 *
 * @type {{ vertex: string, fragment: string, attributes: string[], uniforms: string[] }}
 */
export const SPHERE_PROGRAM = {
  vertex: `${VERSION_LINE}
in vec3 aPosition;
in vec3 aNormal;
in vec3 aOffset;
in float aRadius;
in vec3 aColour;
in float aGlow;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

out vec3 vNormal;
out vec3 vColour;
out float vGlow;

void main() {
  vec3 centre = (uModel * vec4(aOffset, 1.0)).xyz;
  vec3 turned = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNormal;

  vNormal = turned;
  vColour = aColour;
  vGlow = aGlow;

  gl_Position = uProjection * uView * vec4(centre + aPosition * aRadius, 1.0);
}`,
  fragment: `${VERSION_LINE}
precision highp float;

in vec3 vNormal;
in vec3 vColour;
in float vGlow;

uniform vec3 uLightDirection;
uniform float uLightStrength;
uniform float uAmbient;

out vec4 outColour;

void main() {
  vec3 normal = normalize(vNormal);
  float lit = max(dot(normal, normalize(uLightDirection)), 0.0);

  // A glow is not light: an electron is drawn as though it were emitting, so its own colour is added
  // where the light does not reach rather than lit by it.
  vec3 shaded = vColour * (uAmbient + lit * uLightStrength) + vColour * vGlow;

  outColour = vec4(shaded, 1.0);
}`,
  attributes: ["aPosition", "aNormal", "aOffset", "aRadius", "aColour", "aGlow"],
  uniforms: ["uProjection", "uView", "uModel", "uLightDirection", "uLightStrength", "uAmbient"],
};

/**
 * The orbits: a translucent tube, drawn one ring at a time because each shell has its own radius.
 *
 * @type {{ vertex: string, fragment: string, attributes: string[], uniforms: string[] }}
 */
export const RING_PROGRAM = {
  vertex: `${VERSION_LINE}
in vec3 aPosition;
in vec3 aNormal;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

out vec3 vNormal;

void main() {
  vNormal = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNormal;

  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}`,
  fragment: `${VERSION_LINE}
precision highp float;

in vec3 vNormal;

uniform vec3 uColour;
uniform float uOpacity;
uniform vec3 uLightDirection;
uniform float uAmbient;
uniform float uLightStrength;

out vec4 outColour;

void main() {
  // A ring is a hint of an orbit rather than a solid: it is lit only enough to keep its shape, and
  // both how much light it takes and how transparent it is are the caller's to set.
  float lit = max(dot(normalize(vNormal), normalize(uLightDirection)), 0.0);

  outColour = vec4(uColour * (uAmbient + lit * uLightStrength), uOpacity);
}`,
  attributes: ["aPosition", "aNormal"],
  uniforms: [
    "uProjection",
    "uView",
    "uModel",
    "uColour",
    "uOpacity",
    "uLightDirection",
    "uLightStrength",
    "uAmbient",
  ],
};

/**
 * Build a program from a pair of sources.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {{ vertex: string, fragment: string }} sources
 * @returns {WebGLProgram}
 * @throws {Error} when a shader does not compile or the pair does not link, quoting the driver's own
 *   message — which names the line, and is the only useful thing anyone can say about GLSL
 */
export function createProgram(gl, { vertex, fragment }) {
  const build = (type, source, label) => {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);

      gl.deleteShader(shader);

      throw new Error(`The ${label} shader did not compile: ${log}`);
    }

    return shader;
  };

  const vertexShader = build(gl.VERTEX_SHADER, vertex, "vertex");
  const fragmentShader = build(gl.FRAGMENT_SHADER, fragment, "fragment");
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Once linked, the shader objects are only taking up room: the program owns everything it needs.
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);

    gl.deleteProgram(program);

    throw new Error(`The shader program did not link: ${log}`);
  }

  return program;
}
