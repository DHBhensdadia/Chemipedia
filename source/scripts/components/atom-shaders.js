/**
 * The three programs the atom viewer draws with, and the one place a program is built.
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
 * **Every number in the shaders is a uniform.** The light's direction, its strength, the sky and the
 * ground it falls between, how rough and how metallic a surface is and whether a particle glows all
 * arrive from the caller, which reads them from the token layer — so the GLSL contains structure and
 * no design value, and a change to how the atom is lit is a change in `tokens.css` rather than in a
 * shader.
 *
 * **The lighting happens in the camera's frame, not the world's.** The layer carries the light's
 * direction through the view matrix before uploading it, so a surface's own normal and the direction
 * the light comes from are named in the same space and neither has to be un-turned to be compared.
 * That is also what makes the sky in the hemisphere light sit *above the picture* rather than above the
 * world: orbit the camera under the atom and its underside is what goes dark, which is the reference's
 * own behaviour and the reason a reader who drags can always see the shape of a sphere.
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
out vec3 vView;
out vec3 vColour;
out float vGlow;

void main() {
  vec3 centre = (uModel * vec4(aOffset, 1.0)).xyz;
  vec3 turned = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNormal;
  vec4 seen = uView * vec4(centre + aPosition * aRadius, 1.0);

  vNormal = mat3(uView[0].xyz, uView[1].xyz, uView[2].xyz) * turned;
  vView = seen.xyz;
  vColour = aColour;
  vGlow = aGlow;

  gl_Position = uProjection * seen;
}`,
  fragment: `${VERSION_LINE}
precision highp float;

in vec3 vNormal;
in vec3 vView;
in vec3 vColour;
in float vGlow;

uniform vec3 uLightDirection;
uniform float uLightStrength;
uniform vec3 uSkyColour;
uniform vec3 uGroundColour;
uniform float uAmbient;
uniform float uRoughness;
uniform float uMetalness;
uniform float uSpecular;

out vec4 outColour;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 towardsEye = normalize(-vView);
  vec3 towardsLight = normalize(uLightDirection);
  float lit = max(dot(normal, towardsLight), 0.0);

  // The ambient light is a sky over a ground rather than one flat number: a surface takes the colour of
  // whichever it faces, which is what gives a sphere its dark underside and its bright crown without
  // anything having to be drawn for it.
  vec3 sky = mix(uGroundColour, uSkyColour, normal.y * 0.5 + 0.5) * uAmbient;

  // Metalness takes a share of the colour away from the diffuse and puts it into the highlight, which
  // is what leaves the highlight the colour of the surface rather than white.
  vec3 albedo = vColour * (1.0 - uMetalness);
  vec3 diffuse = albedo * (sky + lit * uLightStrength);

  // A highlight with a width rather than a point: the exponent is the roughness' own, and the factor
  // in front of it is what spreads the same energy over that width.
  float grain = uRoughness * uRoughness;
  float gloss = 2.0 / (grain * grain) - 2.0;
  vec3 between = normalize(towardsLight + towardsEye);
  float highlight =
    pow(max(dot(normal, between), 0.0), gloss) * ((gloss + 8.0) / (8.0 * 3.14159265));
  vec3 specular = mix(vec3(0.04), vColour, uMetalness) * highlight * uSpecular * lit;

  // A glow is not light: an electron is drawn as though it were emitting, so its own colour is added
  // where the light does not reach rather than lit by it — and a little more of it at the rim, where a
  // small sphere is its own edge, so that it reads as a point of light rather than a painted bead.
  float rim = pow(1.0 - clamp(dot(normal, towardsEye), 0.0, 1.0), 3.0);
  vec3 emitted = vColour * vGlow * (0.7 + 0.7 * rim);

  outColour = vec4(diffuse + specular + emitted, 1.0);
}`,
  attributes: ["aPosition", "aNormal", "aOffset", "aRadius", "aColour", "aGlow"],
  uniforms: [
    "uProjection",
    "uView",
    "uModel",
    "uLightDirection",
    "uLightStrength",
    "uSkyColour",
    "uGroundColour",
    "uAmbient",
    "uRoughness",
    "uMetalness",
    "uSpecular",
  ],
};

/**
 * The orbits: a translucent tube, drawn one ring at a time because each shell has its own radius and
 * its own plane.
 *
 * **The shell's plane arrives as its own matrix, and it is not the model's.** A ring is placed by the
 * atom's own turn and by the turn that stands its shell up, and those are two different turns: folding
 * the second into the model would put every ring back in one plane, which is the thing the second is
 * there to avoid. It is a second matrix rather than a second model matrix because the frame's own
 * matrix is then still written once per program and means one thing.
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
uniform mat4 uOrientation;

out vec3 vNormal;

void main() {
  mat3 turned = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) *
    mat3(uOrientation[0].xyz, uOrientation[1].xyz, uOrientation[2].xyz);
  vec3 seen = mat3(uView[0].xyz, uView[1].xyz, uView[2].xyz) * turned * aNormal;

  vNormal = seen;

  gl_Position = uProjection * uView * uModel * uOrientation * vec4(aPosition, 1.0);
}`,
  fragment: `${VERSION_LINE}
precision highp float;

in vec3 vNormal;

uniform vec3 uColour;
uniform float uOpacity;
uniform vec3 uSkyColour;
uniform vec3 uGroundColour;

out vec4 outColour;

void main() {
  // A ring is a hairline and never a solid: what is left of it once it is a fifth as opaque as it was
  // is only enough to say where it lies. It takes the same sky-over-ground the particles do, so a ring
  // is a little brighter where its own tube faces up and a little dimmer where it faces down — which is
  // all the shape a line a thousandth of a unit thick can carry.
  vec3 tint = uColour * mix(uGroundColour, uSkyColour, normalize(vNormal).y * 0.5 + 0.5);

  outColour = vec4(tint, uOpacity);
}`,
  attributes: ["aPosition", "aNormal"],
  uniforms: [
    "uProjection",
    "uView",
    "uModel",
    "uOrientation",
    "uColour",
    "uOpacity",
    "uSkyColour",
    "uGroundColour",
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
/**
 * The field the atom stands in: a grid drawn behind everything else.
 *
 * The reference draws its own grid as a pattern on the page behind a transparent canvas; this one is a
 * pass inside the scene instead, for one reason that is worth the extra program — the canvas here is
 * opaque, because a translucent ring blended into a transparent buffer comes out twice as faint as it
 * was asked to be, and the rings' look is measured. So the panel's ground is the scene's first draw
 * rather than a stylesheet's background, and `tokens.css` is still the only place its numbers live.
 *
 * **A full-screen triangle and no geometry at all.** The three corners come from `gl_VertexID`, so
 * there is no buffer to build, upload or bind: the one shape in this scene that is not a mesh. Lines
 * are placed from `gl_FragCoord` — screen space, like the reference's pattern, which does not move when
 * the camera does — and their width is one pixel at any distance between them because the width is
 * taken from the fragment's own `fwidth` rather than from a number.
 *
 * @type {{ vertex: string, fragment: string, attributes: string[], uniforms: string[] }}
 */
export const GRID_PROGRAM = {
  vertex: `${VERSION_LINE}
out vec2 vPixel;
out vec2 vFromCentre;

uniform vec2 uResolution;

void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));

  // The fragment is handed both of the coordinates it needs — the pixel it is, and where it stands in
  // the panel — so the resolution is a uniform of this stage alone and cannot be uploaded twice.
  vPixel = corner * uResolution;
  vFromCentre = corner * 2.0 - 1.0;
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}`,
  fragment: `${VERSION_LINE}
precision highp float;

in vec2 vPixel;
in vec2 vFromCentre;

uniform float uPitch;
uniform vec3 uLine;
uniform vec3 uStage;
uniform float uMajor;
uniform float uMajorStrength;
uniform float uFade;

out vec4 outColour;

void main() {
  vec2 cell = vPixel / uPitch;
  vec2 away = abs(fract(cell + 0.5) - 0.5);
  vec2 width = max(fwidth(cell), vec2(0.00001));
  vec2 line = 1.0 - clamp(away / width, 0.0, 1.0);
  vec2 index = floor(cell + 0.5);

  // Every nth line is the same line drawn stronger: the reference's pattern has one rule in ten, and
  // one rule among four reads the same way on a panel this size.
  vec2 major = 1.0 - min(mod(index, uMajor), vec2(1.0));
  float strength = max(
    line.x * mix(1.0, uMajorStrength, major.x),
    line.y * mix(1.0, uMajorStrength, major.y)
  );

  // The field is a little darker towards the corners, which is what makes a flat panel read as a space
  // with a middle rather than as paper with a picture on it.
  vec3 field = uStage * (1.0 - uFade * dot(vFromCentre, vFromCentre) * 0.5);

  outColour = vec4(mix(field, uLine, clamp(strength, 0.0, 1.0)), 1.0);
}`,
  attributes: [],
  uniforms: ["uResolution", "uPitch", "uLine", "uStage", "uMajor", "uMajorStrength", "uFade"],
};

/**
 * Build a program from one of the sources above.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {{ vertex: string, fragment: string }} source
 * @returns {WebGLProgram}
 * @throws {Error} when the driver refuses either shader, naming the line it objected to
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
