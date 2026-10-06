/**
 * The atom viewer, driven on the style guide.
 *
 * Development only, like the page it runs on: the build renders neither, and both are absent from the
 * built output, the sitemap and `robots.txt`. It exists so the one part of the site that draws in
 * three dimensions can be seen, timed and tuned before a page depends on it.
 *
 * **Why this is a module and not a script inside the guide's page.** The demonstration is a scene, a
 * camera, a readout and five controls — long enough that the guide would pass the project's line
 * ceiling with it inline, and it is the kind of code that deserves the same treatment as the site's
 * own: imports with no side effects, one exported entry point, and a file that can be read on its own.
 *
 * **What is measured, and why it is measured rather than stated.** The readout under the stage reports
 * the draw calls the layer actually issued and how long a frame's work took on the machine reading the
 * page. The context is therefore asked for and wrapped *before* the layer acquires it — a canvas hands
 * back the same context to everybody who asks — so the count is what the layer did rather than what it
 * was expected to do. This is the "numbers recorded, not asserted from memory" the plan asks for, and
 * it is recorded on the page rather than in a commit message.
 *
 * **What this is deliberately not.** The atom model. How many protons carbon has, where a nucleon
 * sits and how fast an electron moves are the next phase's subject, with a rule a test can hold; the
 * field below is a spiral of spheres and one electron per orbit, which is enough to prove the layer
 * and nothing more.
 */

import { channels } from "../scripts/lib/contrast.js";
import { createAtomView } from "../scripts/components/atom-view.js";
import { createOrbitCamera } from "../scripts/lib/orbit-camera.js";
import { rotationAbout } from "../scripts/lib/matrix4.js";

/** How often the readout is rewritten, in frames. Reporting every frame would be part of the cost. */
const REPORT_EVERY = 15;

/** How many frames the frame-time average covers: about a second at sixty a second. */
const AVERAGE_OVER = 60;

/**
 * Read every value the scene needs out of the token layer.
 *
 * The renderer is the one component whose palette cannot arrive through a stylesheet, because a
 * graphics card is not CSS. This is the bridge: a custom property's text becomes the number, the
 * three numbers or the four floats the layer's own arguments take.
 *
 * @returns {{ number: (name: string) => number, colour: (name: string) => number[],
 *   list: (name: string) => number[], stage: () => number[] }}
 */
function tokenReader() {
  const tokens = getComputedStyle(document.documentElement);
  const text = (name) => tokens.getPropertyValue(name).trim();
  const colour = (name) => channels(text(name)).map((channel) => channel / 255);

  return {
    number: (name) => Number.parseFloat(text(name)),
    colour,
    list: (name) => text(name).split(/\s+/).map(Number),
    stage: () => [...colour("--atom-stage"), 1],
  };
}

/**
 * Nucleons on a golden-angle spiral inside a cluster, and one electron on each orbit.
 *
 * @param {{ nucleons: number, shells: number }} counts
 * @param {object} value the token reader
 * @returns {object} the particle list the view takes
 */
function field({ nucleons, shells }, value) {
  const nucleonRadius = value.number("--atom-nucleon-radius");
  const electronRadius = value.number("--atom-electron-radius");
  const cluster = nucleonRadius * Math.cbrt(nucleons) * 1.5;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const positions = [];
  const radii = [];
  const colours = [];
  const glows = [];
  const proton = value.colour("--atom-proton");
  const neutron = value.colour("--atom-neutron");
  const electron = value.colour("--atom-electron");

  for (let index = 0; index < nucleons; index += 1) {
    const height = 1 - (2 * (index + 0.5)) / nucleons;
    const ring = Math.sqrt(Math.max(0, 1 - height * height));
    const turn = index * golden;

    positions.push(ring * Math.cos(turn) * cluster, height * cluster, ring * Math.sin(turn) * cluster);
    radii.push(nucleonRadius);
    colours.push(...(index % 2 === 0 ? proton : neutron));
    glows.push(0);
  }

  for (let shell = 0; shell < shells; shell += 1) {
    const distance = value.number("--atom-orbit-base") + value.number("--atom-orbit-step") * shell;

    positions.push(distance, 0, 0);
    radii.push(electronRadius);
    colours.push(...electron);
    glows.push(value.number("--atom-electron-glow"));
  }

  return { count: nucleons + shells, positions, radii, colours, glows };
}

/**
 * The orbits, one per shell, each at its own radius.
 *
 * @param {number} shells
 * @param {object} value the token reader
 * @returns {object[]}
 */
function orbits(shells, value) {
  const base = value.number("--atom-orbit-base");
  const step = value.number("--atom-orbit-step");

  return Array.from({ length: shells }, (unused, index) => ({
    radius: base + step * index,
    tube: value.number("--atom-orbit-tube"),
    segments: value.number("--atom-ring-segments"),
    tubeSegments: value.number("--atom-ring-tube-segments"),
    colour: value.colour("--atom-orbit"),
    opacity: value.number("--atom-orbit-opacity"),
  }));
}

/**
 * Count the draw calls a context is asked for, by wrapping it.
 *
 * @param {WebGL2RenderingContext} gl
 * @returns {() => number} how many calls have been made since the last time it was read
 */
function countDraws(gl) {
  let calls = 0;

  for (const method of ["drawElements", "drawElementsInstanced"]) {
    const original = gl[method].bind(gl);

    gl[method] = (...args) => {
      calls += 1;

      return original(...args);
    };
  }

  return () => {
    const counted = calls;

    calls = 0;

    return counted;
  };
}

/** Drive the viewer on the style guide's stage, if the guide is on the page. */
export function startAtomDemo() {
  const stage = document.querySelector("#atom-demo");

  if (!stage) {
    return;
  }

  const canvas = stage.querySelector("#atom-demo-canvas");
  const readout = stage.querySelector("#atom-demo-readout");
  const value = tokenReader();
  const camera = createOrbitCamera({
    distance: value.number("--atom-camera-distance"),
    azimuth: value.number("--atom-camera-azimuth"),
    polar: value.number("--atom-camera-polar"),
    damping: value.number("--atom-camera-damping"),
    fieldOfView: (value.number("--atom-camera-fov") * Math.PI) / 180,
    near: value.number("--atom-camera-near"),
    far: value.number("--atom-camera-far"),
    minDistance: value.number("--atom-camera-min-distance"),
    maxDistance: value.number("--atom-camera-max-distance"),
    minPolar: value.number("--atom-camera-tilt-limit"),
    maxPolar: Math.PI - value.number("--atom-camera-tilt-limit"),
  });
  const probe = canvas.getContext("webgl2");
  const takeDraws = probe ? countDraws(probe) : () => 0;
  const view = createAtomView(canvas, {
    sphere: {
      segments: value.number("--atom-sphere-segments"),
      rings: value.number("--atom-sphere-rings"),
    },
    pixelRatioLimit: value.number("--atom-pixel-ratio-limit"),
    lighting: {
      lightDirection: value.list("--atom-light-direction"),
      lightStrength: value.number("--atom-light-strength"),
      ambient: value.number("--atom-ambient"),
    },
    clearColour: value.stage(),
    loop: { longestStep: value.number("--atom-longest-step") },
  });

  let particles = field({ nucleons: 40, shells: 3 }, value);
  let rings = orbits(3, value);
  let angle = 0;
  let calls = 0;
  let frameMs = 0;
  let frames = 0;
  const frameTimes = [];

  /**
   * Put a new particle list and a new ring list on the layer.
   *
   * @param {number} nucleons
   * @param {number} shells
   */
  function load(nucleons, shells) {
    particles = field({ nucleons, shells }, value);
    rings = orbits(shells, value);
    view.setParticles(particles);
    view.setRings(rings);
    frameTimes.length = 0;
  }

  /** Write down what the last frames actually cost, on the page rather than in a comment. */
  function report() {
    const average = frameTimes.reduce((total, spent) => total + spent, 0) / frameTimes.length;

    readout.textContent =
      `${particles.count} particles and ${rings.length} orbits \u00b7 ${calls} draw ` +
      `${calls === 1 ? "call" : "calls"} \u00b7 ${frameMs.toFixed(2)} ms in the layer, ` +
      `${average.toFixed(2)} ms averaged`;

    Object.assign(readout.dataset, {
      particles: String(particles.count),
      orbits: String(rings.length),
      calls: String(calls),
      frameMs: frameMs.toFixed(3),
      averageMs: average.toFixed(3),
      frames: String(frames),
      window: String(frameTimes.length),
    });
  }

  /**
   * One frame: advance the scene, then draw it.
   *
   * The time measured is the layer's own work — the camera, the resize check, the uploads and the draw
   * — and not the browser's compositing, which this cannot see and does not own.
   *
   * @param {number} delta seconds since the previous frame
   */
  function step(delta) {
    const started = performance.now();

    angle += value.number("--atom-spin") * delta;
    camera.update(delta);
    view.resize();
    view.draw({ model: rotationAbout([0, 1, 0], angle), camera });

    calls = takeDraws();
    frameMs = performance.now() - started;
    frames += 1;
    frameTimes.push(frameMs);

    if (frameTimes.length > AVERAGE_OVER) {
      frameTimes.shift();
    }

    if (frames === 1 || frames % REPORT_EVERY === 0) {
      report();
    }
  }

  if (view.available()) {
    load(40, 3);
    view.start(step);
  } else {
    const note = document.createElement("p");

    note.className = "atom-demo__fallback";
    note.textContent =
      "This browser gave no WebGL2 context, so the stage cannot be drawn here. The atom page falls " +
      "back to the element's shell diagram.";
    canvas.hidden = true;
    stage.append(note);
    readout.textContent = "No WebGL2 context: nothing was drawn.";
    readout.dataset.calls = "0";
  }

  // The camera behaves here as it will on the page: a drag swings the aim, the wheel brings the eye
  // closer, and both move an aim that the damping then closes on rather than the view itself.
  let dragging = null;
  const sensitivity = value.number("--atom-drag-sensitivity");
  const zoomStep = value.number("--atom-zoom-step");

  canvas.addEventListener("pointerdown", (event) => {
    dragging = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }

    camera.orbit({
      azimuth: (event.clientX - dragging.x) * sensitivity,
      polar: (event.clientY - dragging.y) * sensitivity,
    });
    dragging = { x: event.clientX, y: event.clientY };
  });

  canvas.addEventListener("pointerup", () => {
    dragging = null;
  });

  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      camera.zoom(event.deltaY > 0 ? zoomStep : 1 / zoomStep);
    },
    { passive: false },
  );

  // The controls sit beside the stage rather than inside it, so they are looked up on the document.
  document.querySelector("#atom-demo-reset").addEventListener("click", () => camera.reset());
  document.querySelector("#atom-demo-heavy").addEventListener("click", () => load(118, 7));

  const pause = document.querySelector("#atom-demo-pause");

  pause.addEventListener("click", () => {
    const held = pause.getAttribute("aria-pressed") === "true";

    pause.setAttribute("aria-pressed", held ? "false" : "true");

    // The same step the loop was started with: a paused viewer resumes where it stopped rather than
    // with a second, quieter loop of its own.
    if (held) {
      view.start(step);
    } else {
      view.stop();
    }
  });
}
