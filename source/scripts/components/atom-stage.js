/**
 * The stage: the atom on the page, and the bar that drives it.
 *
 * The build writes the page — the diagram, the counts, the bar and its controls — and this is what
 * happens after it, in the browser: the scene is built on the canvas, the diagram steps aside once
 * there is a frame to show, and every control in the bar is wired to the model.
 *
 * Five things are worth the reading:
 *
 *   1. **The page is finished before this runs.** The canvas is revealed by the first frame that is
 *      actually drawn, and not before: a reader whose browser gives no WebGL2 context, or whose script
 *      never runs, keeps the diagram and the counts rather than a blank stage. The same is true of a
 *      `prefers-reduced-motion` preference, except that the still frame is drawn and a Play control
 *      offered — a preference is a default, not a veto.
 *   2. **The counts in the fields are the truth.** Every change reads the three fields, not a copy of
 *      them held beside the model, so what the page shows and what the stage draws cannot disagree.
 *   3. **One announcement per change.** The live region hears the model's own sentence — including the
 *      sentence it writes for a count that is not an element — and the canvas' accessible name is
 *      rewritten at the same moment.
 *   4. **The links a reader follows are placed with `lib/site-path.js`.** The element link is the one
 *      URL this file writes after the page has loaded, which is exactly the class of URL the build's
 *      rewriting cannot reach: correct at a domain root and 404 under the project path it is published
 *      at. `sitePath` is what keeps it inside the site.
 *   5. **The fragment chooses the element.** `/atoms/#iron` is one document, and the fragment says
 *      which atom that document opens on — the other half of the link every element page carries.
 *      A fragment that names no element is not an error: the page opens on the element it was built
 *      for, which is what a reader who arrived without one expects.
 */

import { buildAtom } from "../lib/atom-model.js";
import { atomScale, createAtomScene } from "./atom-scene.js";
import { atomSentence, countsFor } from "../lib/atom-words.js";
import { createAtomView } from "./atom-view.js";
import { createElementsRepository } from "../data/elements-repository.js";
import { channels } from "../lib/contrast.js";
import { ATOM_CONTROLS } from "./atom-bar.js";
import { sitePath } from "../lib/site-path.js";

/** What the stage says when the browser gives it no WebGL2 context. */
const NO_CONTEXT =
  "This browser cannot draw the three-dimensional view, so the element's shells are shown instead.";

/**
 * The element a URL's fragment names, or `null` when it names none.
 *
 * The fragment is a slug — `#iron` — because the element pages already have one URL-safe name per
 * element (`lib/slug.js`) and a second naming scheme is a second thing to keep in step. Anything
 * else, including a fragment this site wrote and a later change of slug broke, answers `null`, and
 * the caller falls back to the page's built state rather than failing: a stale bookmark should show
 * a reader an atom, not an error.
 *
 * The repository is the argument rather than a list of records, and the question is put as
 * `bySlug`: the page has a repository at this point anyway, and a list of records fetched out of it
 * to be searched here is a second way of asking a question the repository already answers.
 *
 * @param {string | null | undefined} hash the document's fragment, with or without its `#`
 * @param {{ bySlug: (slug: string) => object | null } | null | undefined} elements
 * @returns {object | null}
 */
export function elementFromFragment(hash, elements) {
  const slug = String(hash ?? "").replace(/^#/, "").trim().toLowerCase();

  if (slug === "" || !elements) {
    return null;
  }

  return elements.bySlug(slug) ?? null;
}

/**
 * The token layer, as `getComputedStyle` hands it over on the page.
 *
 * @param {Document} doc
 * @returns {object}
 */
function tokenReader(doc) {
  const tokens = doc.defaultView.getComputedStyle(doc.documentElement);
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
 * The three counts as they stand in the page's own fields.
 *
 * @param {Object<string, HTMLInputElement>} fields
 * @returns {{ protons: number, neutrons: number, electrons: number }}
 */
function countsIn(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [name, Number(field.value)]),
  );
}

/**
 * Bring the page up to date for the atom now on the stage: the card, the element link, the canvas'
 * name, the line under the stage and the words a screen reader hears.
 *
 * @param {object} options
 * @param {object} options.scene
 * @param {object | null} options.record
 * @param {{ protons: number, neutrons: number, electrons: number }} options.counts
 * @param {Document} options.doc
 * @returns {object} the model that was drawn
 */
function describe({ scene, record, counts, doc }) {
  const model = scene.atom();
  const sentence = atomSentence(record, counts);
  const link = doc.querySelector(`#${ATOM_CONTROLS.link}`);
  const name = doc.querySelector(`#${ATOM_CONTROLS.name}`);

  doc.querySelector("#atom-canvas").setAttribute("aria-label", `${sentence} Drawn in three dimensions.`);
  doc.querySelector("#atom-readout").textContent =
    `${model.particleCount} particles · ${model.shells.length} shells`;
  doc.querySelector("#atom-announce").textContent = sentence;

  if (record) {
    link.href = sitePath(`/elements/${record.slug}/`);
    link.textContent = record.symbol;
    name.textContent = `${record.name} · ${record.symbol}-${model.massNumber}`;
  } else {
    link.removeAttribute("href");
    link.textContent = "?";
    name.textContent = "Not an element";
  }

  return model;
}

/**
 * Start the atom on the page, if the page is on screen.
 *
 * @param {Document} [doc]
 * @returns {Promise<void>}
 */
export async function startAtomStage(doc = document) {
  const stage = doc.querySelector("#atom-stage");

  if (!stage) {
    return;
  }

  const canvas = doc.querySelector("#atom-canvas");
  const fallback = doc.querySelector("#atom-fallback");
  const readout = doc.querySelector("#atom-readout");
  const picker = doc.querySelector(`#${ATOM_CONTROLS.picker}`);
  const speed = doc.querySelector(`#${ATOM_CONTROLS.speed}`);
  const motion = doc.querySelector(`#${ATOM_CONTROLS.motion}`);
  const fields = {
    protons: doc.querySelector(`#${ATOM_CONTROLS.protons}`),
    neutrons: doc.querySelector(`#${ATOM_CONTROLS.neutrons}`),
    electrons: doc.querySelector(`#${ATOM_CONTROLS.electrons}`),
  };
  const tokens = tokenReader(doc);
  const view = createAtomView(canvas, {
    sphere: {
      segments: tokens.number("--atom-sphere-segments"),
      rings: tokens.number("--atom-sphere-rings"),
    },
    pixelRatioLimit: tokens.number("--atom-pixel-ratio-limit"),
    lighting: {
      lightDirection: tokens.list("--atom-light-direction"),
      lightStrength: tokens.number("--atom-light-strength"),
      ambient: tokens.number("--atom-ambient"),
    },
    clearColour: tokens.stage(),
    loop: { longestStep: tokens.number("--atom-longest-step") },
  });

  readout.hidden = false;

  if (!view.available()) {
    readout.textContent = NO_CONTEXT;

    return;
  }

  let elements;

  try {
    elements = await createElementsRepository();
  } catch (error) {
    readout.textContent = `The element data could not be read, so there is nothing to draw: ${error.message}`;

    return;
  }

  const scale = atomScale(tokens);
  const named = elementFromFragment(doc.defaultView.location.hash, elements);
  // The built page arrives showing one element, and a fragment naming another replaces it outright:
  // the counts, the fields, the picker and the card are all written from the record, so a reader who
  // followed `/atoms/#iron` sees iron and not carbon with iron's protons.
  let counts = named ? countsFor(named) : countsIn(fields);
  const record = () => elements.byNumber(counts.protons);
  const model = () =>
    buildAtom({
      record: record(),
      protons: counts.protons,
      neutrons: counts.neutrons,
      electrons: counts.electrons,
      scale,
    });
  const scene = createAtomScene({ view, tokens, atom: model(), speed: Number(speed.value) });
  const stillness = doc.defaultView.matchMedia("(prefers-reduced-motion: reduce)");
  let revealed = false;

  /** A reader who asked for reduced motion gets one still frame and a Play control to start it. */
  let paused = stillness.matches;

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

  /** Reveal the canvas and put the diagram away, once there is a frame to look at. */
  function reveal() {
    if (!revealed) {
      revealed = true;
      canvas.hidden = false;
      fallback.hidden = true;
    }
  }

  /**
   * One frame of the scene.
   *
   * @param {number} delta seconds since the previous one
   */
  function step(delta) {
    if (scene.step(delta)) {
      reveal();
    }
  }

  /** Put what is in the fields on the stage, tell the page what it is, and say it once. */
  function show() {
    settle();
    scene.setAtom(model());
    scene.setSpeed(Number(speed.value));
    describe({ scene, record: record(), counts, doc });
  }

  /** Draw the atom the way it is set to be drawn: moving, or held on one frame. */
  function draw() {
    if (paused) {
      step(1 / 60);
    } else {
      view.start(step);
    }
  }

  /** The state of the motion control, which is the only place it is written for a reader. */
  function sayMotion() {
    motion.textContent = paused ? "Play" : "Pause";
    motion.setAttribute("aria-pressed", paused ? "true" : "false");
  }

  sayMotion();
  draw();
  settle();
  describe({ scene, record: record(), counts, doc });

  // The camera behaves as it does on the guide: a drag swings the aim, the wheel brings the eye closer.
  let dragging = null;
  const sensitivity = tokens.number("--atom-drag-sensitivity");
  const zoomStep = tokens.number("--atom-zoom-step");

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

  for (const button of stage.querySelectorAll("[data-atom-step]")) {
    button.addEventListener("click", () => {
      const name = button.dataset.atomStep;
      const field = fields[name];
      const stepped = Number(field.value) + Number(button.dataset.atomBy);

      counts[name] = Math.min(Number(field.max), Math.max(0, stepped));
      show();
    });
  }

  for (const [name, field] of Object.entries(fields)) {
    field.addEventListener("change", () => {
      const typed = Number(field.value);

      if (Number.isInteger(typed)) {
        counts[name] = Math.min(Number(field.max), Math.max(0, typed));
        show();
      }
    });
  }

  picker.addEventListener("change", () => {
    const chosen = elements.byNumber(Number(picker.value));

    if (chosen) {
      counts = countsFor(chosen);
      show();
    }
  });

  speed.addEventListener("input", () => scene.setSpeed(Number(speed.value)));
  doc.querySelector(`#${ATOM_CONTROLS.shake}`).addEventListener("click", () => scene.shake());
  doc.querySelector(`#${ATOM_CONTROLS.reset}`).addEventListener("click", () => scene.resetView());

  motion.addEventListener("click", () => {
    paused = !paused;
    sayMotion();

    if (paused) {
      view.stop();
    } else {
      view.start(step);
    }

    doc.querySelector("#atom-announce").textContent = paused ? "Held on one frame." : "Turning again.";
  });
}
