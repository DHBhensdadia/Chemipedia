/**
 * The atom viewer, driven on the style guide.
 *
 * Development only, like the page it runs on: the build renders neither, and both are absent from the
 * built output, the sitemap and `robots.txt`. It exists so the one part of the site that draws in
 * three dimensions can be seen, timed and tuned before a page depends on it.
 *
 * **Why this is a module and not a script inside the guide's page.** The demonstration is a scene, four
 * model controls, a readout and five buttons — long enough that the guide would pass the project's line
 * ceiling with it inline, and it deserves the treatment the site's own code gets: imports with no side
 * effects, one exported entry point, a file that can be read on its own.
 *
 * **It drives the real thing.** Phase 12's proof put a throwaway field of spheres and one electron per
 * orbit on this stage, which was enough to judge the layer. What runs here now is `atom-model.js` and
 * `atom-scene.js` — the two modules a page will run — over the real records, fetched through the same
 * repository every page reads: pick any of the 118 elements, or type the three counts, and the picture
 * is built from that record's own shells.
 *
 * **What is measured, and why.** The readout reports the draw calls the layer actually issued and what a
 * frame's work cost on this machine. The context is asked for and wrapped *before* the layer acquires it —
 * a canvas hands back the same context to everybody who asks — so the count is what the layer did rather
 * than what it was expected to do: "numbers recorded, not asserted from memory".
 */

import { channels } from "../scripts/lib/contrast.js";
import { buildAtom, neutronsFor } from "../scripts/lib/atom-model.js";
import { atomScale, createAtomScene } from "../scripts/components/atom-scene.js";
import { createAtomView } from "../scripts/components/atom-view.js";
import { createElementsRepository } from "../scripts/data/elements-repository.js";

/** How often the readout is rewritten, in frames. Reporting every frame would be part of the cost. */
const REPORT_EVERY = 15;

/** How many frames the frame-time average covers: about a second at sixty a second. */
const AVERAGE_OVER = 60;

/** The heaviest atom this guide will build: 118 protons, and the neutrons of uranium's own weight. */
const HEAVY = { protons: 118, neutrons: 146, electrons: 118 };

/** The element the stage opens on, so the first frame is an atom rather than a bare nucleus. */
const OPENS_ON = 6;

/**
 * Read every value the scene needs out of the token layer.
 *
 * The renderer's palette cannot arrive through a stylesheet, because a graphics card is not CSS: this is
 * the bridge — a custom property's text becomes the number, the three numbers or the four floats the
 * layer's own arguments take.
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
 * @param {WebGL2RenderingContext} gl a context, wrapped so its draw calls can be counted
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

/**
 * The neutrons of the isotope a record's own weight names: the rounded weight less the atomic number.
/**
 * The counts an element opens on: as many electrons as protons, and the weight's neutrons.
 *
 * @param {object} record
 * @returns {{ protons: number, neutrons: number, electrons: number }}
 */
function countsFor(record) {
  return { protons: record.atomicNumber, neutrons: neutronsFor(record), electrons: record.atomicNumber };
}

/**
 * Fill the element picker from the records: every element, named by symbol, valued by atomic number.
 *
 * @param {object} elements the elements repository
 * @param {HTMLSelectElement} picker
 */
function fillElementSelect(elements, picker) {
  for (const element of elements.all()) {
    const option = document.createElement("option");

    option.value = String(element.atomicNumber);
    option.textContent = `${element.symbol} \u00b7 ${element.name}`;
    picker.append(option);
  }
}

/** Drive the viewer on the style guide's stage, if the guide is on the page. */
export async function startAtomDemo() {
  const stage = document.querySelector("#atom-demo");

  if (!stage) {
    return;
  }

  const canvas = stage.querySelector("#atom-demo-canvas");
  const readout = stage.querySelector("#atom-demo-readout");
  const picker = document.querySelector("#atom-demo-element");
  const fields = {
    protons: document.querySelector("#atom-demo-protons"),
    neutrons: document.querySelector("#atom-demo-neutrons"),
    electrons: document.querySelector("#atom-demo-electrons"),
  };
  const speed = document.querySelector("#atom-demo-speed");
  const value = tokenReader();
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

  if (!view.available()) {
    const note = document.createElement("p");

    note.className = "atom-demo__fallback";
    note.textContent =
      "This browser gave no WebGL2 context, so the stage cannot be drawn here. The atom page falls " +
      "back to the element's shell diagram.";
    canvas.hidden = true;
    stage.append(note);
    readout.textContent = "No WebGL2 context: nothing was drawn.";
    readout.dataset.calls = "0";
    readout.dataset.frames = "0";

    return;
  }

  let elements;

  try {
    elements = await createElementsRepository();
  } catch (error) {
    readout.textContent = `The element data could not be read, so there is nothing to draw: ${error.message}`;

    return;
  }

  // One reader, one scale: a model built against one nucleon radius and drawn against another would be
  // a nucleus of the wrong size in a cluster of the right one.
  const scale = atomScale(value);
  const counts = { ...countsFor(elements.byNumber(OPENS_ON)) };

  /**
   * The atom these counts make: the record when the proton count names one, and no record when it does
   * not, which is `buildAtom`'s own rule rather than a second one written here.
   *
   * @returns {object}
   */
  function model() {
    return buildAtom({
      record: elements.byNumber(counts.protons),
      protons: counts.protons,
      neutrons: counts.neutrons,
      electrons: counts.electrons,
      scale,
    });
  }

  fillElementSelect(elements, picker);

  const scene = createAtomScene({ view, tokens: value, atom: model(), speed: Number(speed.value) });
  let calls = 0;
  let frameMs = 0;
  let frames = 0;
  const frameTimes = [];

  /** Point every control at the counts, so the page and the picture cannot disagree. */
  function settle() {
    for (const [name, field] of Object.entries(fields)) {
      field.value = String(counts[name]);
    }

    picker.value = String(counts.protons);

    if (!picker.value) {
      picker.selectedIndex = -1;
    }
  }

  /** Write down what the last frames actually cost, on the page rather than in a comment. */
  function report() {
    const atom = scene.atom();
    const average = frameTimes.length
      ? frameTimes.reduce((total, spent) => total + spent, 0) / frameTimes.length
      : 0;
    const words = atom.labels.name ? `${atom.labels.name} \u00b7 ${atom.labels.isotope}` : "Not an element";

    readout.textContent =
      `${words} \u00b7 ${atom.particleCount} particles and ${atom.shells.length} orbits \u00b7 ` +
      `${calls} draw ${calls === 1 ? "call" : "calls"} \u00b7 ${frameMs.toFixed(2)} ms in the scene, ` +
      `${average.toFixed(2)} ms averaged`;

    Object.assign(readout.dataset, {
      element: atom.labels.symbol ?? "",
      kind: atom.labels.kind,
      charge: String(atom.labels.charge),
      protons: String(atom.protons),
      neutrons: String(atom.neutrons),
      electrons: String(atom.electrons),
      particles: String(atom.particleCount),
      orbits: String(atom.shells.length),
      calls: String(calls),
      frameMs: frameMs.toFixed(3),
      averageMs: average.toFixed(3),
      frames: String(frames),
      window: String(frameTimes.length),
    });
  }

  /**
   * Build the atom these controls describe and put it on the stage.
   *
   * It deliberately does not rewrite the readout: every number there describes a frame that was drawn,
   * so reporting here would put the new counts beside the last frame's draw calls. The next frame does.
   */
  function show() {
    settle();
    scene.setAtom(model());
    scene.setSpeed(Number(speed.value));
    frames = 0;
    frameTimes.length = 0;
  }

  /**
   * One frame: the whole scene, then the measurement of what it cost.
   *
   * The time measured is the scene's own work — the camera, the electrons' places, the resize check,
   * the uploads and the draw — and not the browser's compositing, which this cannot see and does not
   * own.
   *
   * @param {number} delta seconds since the previous frame
   */
  function step(delta) {
    const started = performance.now();

    scene.step(delta);

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

  show();
  view.start(step);

  // The camera behaves here as it will on the page: a drag swings the aim, the wheel brings the eye
  // closer, and both move an aim the damping then closes on rather than the view itself.
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

    scene.orbit({
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
      scene.zoom(event.deltaY > 0 ? zoomStep : 1 / zoomStep);
    },
    { passive: false },
  );

  // The controls sit beside the stage rather than inside it, so they are looked up on the document.
  picker.addEventListener("change", () => {
    Object.assign(counts, countsFor(elements.byNumber(Number(picker.value))));
    show();
  });

  // On every keystroke rather than on blur: the atom is rebuilt in a few tenths of a millisecond, so
  // there is nothing to gain by making a reader press Tab to see what they typed. A count has to be a
  // whole number of zero or more, and a field holding anything else — a half typed away, or a minus
  // sign — is left alone rather than handed to a model that would refuse it.
  for (const [name, field] of Object.entries(fields)) {
    field.addEventListener("input", () => {
      const typed = Number(field.value);

      if (!Number.isInteger(typed) || typed < 0) {
        return;
      }

      counts[name] = typed;
      show();
    });
  }

  speed.addEventListener("input", () => {
    scene.setSpeed(Number(speed.value));
  });

  document.querySelector("#atom-demo-reset").addEventListener("click", () => scene.resetView());
  document.querySelector("#atom-demo-shake").addEventListener("click", () => scene.shake());

  document.querySelector("#atom-demo-heavy").addEventListener("click", () => {
    Object.assign(counts, HEAVY);
    show();
  });

  const pause = document.querySelector("#atom-demo-pause");

  pause.addEventListener("click", () => {
    const held = pause.getAttribute("aria-pressed") === "true";

    pause.setAttribute("aria-pressed", held ? "false" : "true");

    // The same clock the loop was started with: a paused viewer resumes where it stopped rather than
    // with a second, quieter loop of its own.
    if (held) {
      view.start(step);
    } else {
      view.stop();
    }
  });
}
