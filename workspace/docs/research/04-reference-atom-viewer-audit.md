# The 3D atom reference — audit

**Subject:** the three-dimensional atom viewer the author asked for, and the second reference that
supplies its interaction model.

**Status:** measured · **Recorded:** 2026-10-07 · **Measured by:** reading the reference's own
bundles, stylesheets and rendered DOM in a browser (the same method as `01-reference-site-audit.md`).

**The one-line summary:** the page is a single WebGL scene — a nucleus of protons and neutrons with
electrons orbiting it on rings — driven by one translucent bar pinned to the bottom centre of the
screen, and it is the *bar* and the *model* that we replicate, not its colours, its copy or its code.

---

## 1. What the reference is, and what is in scope

| | |
|---|---|
| The page in scope | `https://atomanimation.com/` — the site's root, and its 3D visualisation |
| Out of scope, by the author's instruction | `https://atomanimation.com/periodic-table` and `https://atomanimation.com/statistics` |
| Stack | Next.js (React) with three.js; the scene is declared in the page's own bundle, the geometry and material classes come from the vendored library |
| Its own element data | An element record carrying `protons`, `neutrons`, `electrons`, `symbol`, `name`, `atomicWeight`, `electronConfiguration` (short and full) and `shells` — the same facts our `data/elements.json` already holds |
| Rendered surface | One `<canvas>` (WebGL) filling the viewport, plus a top navigation (Home / Periodic table / Statistics) and the bottom bar described in §3 |

Everything below was measured from the live page: the DOM and the computed styles through a browser,
and the scene's parameters from the bundle that builds it.

## 2. The 3D model, as the reference actually builds it

The scene's configuration, read from the bundle that declares it:

| Parameter | Value |
|---|---|
| Model scale | `1.35`; the whole model group is scaled by it |
| Nucleon placement | Points on a **Fibonacci sphere** (golden angle `π(3−√5)`), one point per proton and neutron, at radius `clusterRadius`; the order is shuffled so the two colours are mixed rather than split into halves |
| Nucleon radius | `0.2 × modelScale` = `0.27`, a 32-segment sphere |
| Nucleon material | Standard, roughness `0.4`, metalness `0.2` |
| Proton colour | `#ff554d` (red-orange) |
| Neutron colour | `#aaaaaa` (grey) |
| Nucleus scale factor | `0.9` |
| Orbit rings | One torus per shell, radius = the shell's distance, tube `0.005 × modelScale`, basic material, white at `opacity 0.15` |
| Shell distances | `[2, 3.2, 4.4, 5.6, 6.8, 8, 9.2]` — seven, evenly spaced by `1.2`, matching the seven shells the data's electron configurations reach |
| Electron | Sphere of `0.1 × modelScale` = `0.135`, 16 segments, emissive `#33ccff` at intensity `0.5` |
| Electron motion | Each electron sits in *its ring's plane* at `(cos θ, sin θ, 0)` and advances `Δ × speed` per frame; the phase is randomised once per mount |
| Camera | Perspective, `fov 50`, at `(0, 5.6, 16.8)`, orbit controls with damping |
| Lights | Hemisphere light, sky white / ground `#bbbbbb`, intensity `1`; one directional light, intensity `1`, at `(10, 10, 5)` |
| Model rotation | Rotated on an axis by a velocity that decays `× 0.99` per frame — which is what "Shake Atom" feeds |
| Speed | A slider over `1…100` whose midpoint (`50`) is the reference's normal speed; `speedConstant: 1.5π` scales it |

**What this tells us.** The model is a Bohr-style picture, not a quantum one: shells are rings, one
electron per electron, and the electrons are placed by count rather than by orbital. That is the
correct choice for a viewer a reader is meant to understand at a glance, and it is the model we
replicate — with one deliberate difference: our nucleon layout will be **deterministic** (seeded by
the atomic number) where the reference reshuffles on every mount, so that the same element looks the
same on every visit and a test can hold it still.

## 3. The bottom bar, as measured

This is the element of the page the author asked for by name: a translucent, centred bar at the
bottom of the stage.

| Property | Measured value |
|---|---|
| Position | `absolute`, `bottom: 2rem`, `left: 50%` with `translateX(-50%)`; height `9rem`; a flex row; `gap: 1.2rem`; `z-index: 2` |
| Panel surface | `backdrop-filter: blur(15px)`, `background: #ffffff08` (3% white), `border: 1px solid #94a3b826`, `border-radius: 10px`, `box-shadow: 0 0 40px #3bc3e20d` |
| Labels | 0.9rem, weight 600, near-white with a 1px dark text shadow |
| Speed slider | Native `input[type=range]`, 160px wide, a track filled by `--slider-fill-percentage`, thumb `#3bc3e2` with a 4px halo, fill `#2fb7c9` |
| Contents, left to right | (1) the element card — atomic number, electron configuration, symbol with a charge superscript, name, atomic weight, and it opens the element's details; (2) the particle controls — three labelled steppers, **Protons / Neutrons / Electrons**, each `−` and `+`; (3) the speed slider; (4) the legend — one swatch per particle; (5) the action buttons, which in the live page read **Shake Atom**, **Reset View**, and a pause |
| Paused state | The bar carries a `paused` modifier class, and the slider has its own paused styling |
| Small screens | A `display: none` rule exists for the desktop bar, and a toggled menu takes over |

Other UI on the page, for completeness: a top navigation, an element **combobox** with previous/next
buttons (a custom listbox), and a modal that opens from the element card. The modal is out of scope:
our element pages are one click away and are the better answer.

## 4. What we replicate, and what we deliberately do not

**Replicated** — the information architecture and the interaction model, because that is what the
author asked for:

1. A full-bleed 3D stage as the page, not a widget inside a page.
2. A nucleus of protons and neutrons with electrons orbiting on rings, in the Bohr model.
3. Free protons / neutrons / electrons: any counts, including ones that are not an element.
4. A speed control, a shake, and a reset of the view.
5. A translucent bar pinned to the bottom centre carrying the element card, the three steppers, the
   speed, and the legend.
6. The element card as the page's anchor: symbol, name, atomic number, atomic weight, and the charge
   that the electron count implies.

**Not replicated** — and each has a reason:

| Left behind | Why |
|---|---|
| Their colours (`#ff554d`, `#33ccff`, `#aaaaaa`, the bar's tints) | Our palette is the site's identity. The particles get tokens of their own in `tokens.css`, chosen from our eleven group colours' world so the page reads as ChemiPedia. |
| Their copy, including the physics notes the bundle carries | Prose is ours (`WORKING_AGREEMENT.md` §4). We write the page's sentences and the bar's labels. |
| three.js, React and the Next.js machinery | ADR-004: zero runtime dependencies, no framework. The scene is hand-written WebGL2 behind a progressive-enhancement gate. |
| Their element dataset | We already hold every fact the model needs — `atomicNumber`, `atomicWeight`, `shells`, `symbol`, `name`, `electronConfiguration` — in `data/elements.json`. No new data, no new source. |
| A custom combobox and a details modal | A native `<select>` and a `<button>` group are keyboard- and screen-reader-native, and our element pages already explain each element in full. Recorded as a deliberate deviation. |
| Their logo, favicon and images | Brand rule: the reference's assets never enter this repository. |
| Their periodic-table and statistics pages | Out of scope by the author's instruction. |

**One thing we add that the reference has no answer for:** what the page shows when WebGL is absent,
when scripting is off, or when a reader has asked for reduced motion. Our page falls back to the
shell diagram the element pages already draw, built at build time, so the page is never blank.

## 5. What this means for the build

- The page is one **page family** (`pages/atoms.html`, `scripts/pages/atoms.js`,
  `styles/pages/atoms.css`) plus one component family for the scene and one for the bar.
- The renderer is a **layer of its own** — context, shaders, camera, geometry, instancing — because it
  is the only WebGL in the project and nothing else should learn from it.
- The atom model is **pure arithmetic** (where nucleons sit, how many electrons go on which ring,
  what the counts mean) and therefore testable in Node without a browser, which is where most of this
  feature's tests live.
- The palette lives in `tokens.css` like every other design value, and the renderer **reads it from
  the token layer at runtime** rather than carrying hex literals of its own. That keeps the one law
  that has held since Phase 1: a literal colour exists in exactly one file in the project.
