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
| Model scale | `1.35`, and it is **baked into every radius** rather than carried by the group: the nucleon's sphere is `0.2 × 1.35`, the electron's `0.1 × 1.35`, the ring's tube `0.005 × 1.35`, the ring's radius `shellDistance × 1.35`. The model group itself carries a rotation and no scale |
| Nucleon placement | Points on a **Fibonacci sphere** (golden angle `π(3−√5)`), one point per proton and neutron, at radius `clusterRadius`; the order is shuffled so the two colours are mixed rather than split into halves |
| Cluster radius | `0.2 × 1.35 × ∛(nucleonCount) × 0.9` — that is, **0.9 nucleon radii per cube root of the count**, so the nucleons *overlap* rather than merely touching: on a shell of `3.27 r` with 48 spheres of radius `r`, each sphere's share of the surface is a circle of `0.94 r` |
| Nucleon radius | `0.2 × modelScale` = `0.27`, a 32-segment sphere |
| Nucleon material | Standard, roughness `0.4`, metalness `0.2` |
| Proton colour | `#ff554d` (red-orange) |
| Neutron colour | `#aaaaaa` (grey) |
| Nucleus scale factor | `0.9`, and it scales the *cluster's own radius* and nothing else |
| Orbit rings | One torus per shell, in the shell's own plane: `torusGeometry(ringRadius, 0.005 × 1.35, 16, 64)` — sixteen segments around the tube, sixty-four around the ring — in `meshBasicMaterial`, white, double-sided, `opacity 0.15`. **Basic means unlit**: the rings take no light at all and are the same brightness everywhere |
| Ring radius | `shellDistance × modelScale × (1 + 0.15 × clusterRadius)` — the whole ladder is carried outward by a share of the nucleus' own radius, which is how a heavier atom's rings stay around its heavier nucleus |
| Shell distances | `[2, 3.2, 4.4, 5.6, 6.8, 8, 9.2]` — seven, evenly spaced by `1.2`, matching the seven shells the data's electron configurations reach; past the seventh, each next ring is `1.2 ×` the last rather than `+ 1.2` |
| Shell planes | **One plane per shell.** Each shell is a group with its own rotation, holding its ring and its electrons: shell 1 `(π/2, 0, 0)`, shell 2 `(0, 0, 0)`, shell 3 `(π/4, π/4, 0)`, and shell *k* from the fourth on `((k−3)g, (k−3)g/2, (k−3)g/4)` with `g` the golden angle. Rings in one plane read as a plate with dots on it; these read as an atom |
| Electron | Sphere of `0.1 × modelScale` = `0.135`, 16 segments, emissive `#33ccff` at intensity `0.5` |
| Electron motion | Each electron sits in *its ring's plane* at `(cos θ, sin θ, 0)` — the plane the torus is generated in — and advances `Δ × speed` per frame; the phase is randomised once per mount, and the ring's own angular speed falls off as `1/(k)` down the shells |
| Camera | Perspective, `fov 50`, at `(0, 5.6, 16.8)` — `17.71` from the target, and half the frame's height at the target's depth is `17.71 · tan 25° = 8.258` — with orbit controls and damping |
| Lights | Hemisphere light, sky white / ground `#bbbbbb`, intensity `1`; one directional light, intensity `1`, at `(10, 10, 5)`. three.js carries a hemisphere light's up direction *into the camera's frame*, so the sky is the top of the picture rather than the top of the world |
| Model rotation | The group opens at `Euler(π/4, π/0.6, 0)`, which as a single turn is about `(0.5525, −0.7701, −0.3190)` by `1.2867` radians. It then turns only while a velocity lasts, decaying `× 0.99` per frame — which is what "Shake Atom" feeds (a shake sets a random axis and `10 + 8·random` radians a second) |
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

## 6. The second reading, and what it changed

**Recorded 2026-10-07, after the author reviewed the built page and asked for a closer copy of this one.**
Three things were named: too much gap between the nucleons, a nucleus that looked too large, and a scene
that read as "electrons wandering around" rather than as the reference's. All three were measurable,
and all three are the *same* class of mistake — our first reading had taken the reference's colours and
counts and skipped its geometry.

**What was read again.** The page's own bundle, this time for the scene graph rather than the palette:
the cluster radius' formula, the ring radius' formula, the per-shell rotations, the initial rotation, the
light's frame, and the materials. §2's table above carries all of it now.

**What the numbers said, in nucleon radii and in fractions of the frame.** Every figure below is either
the reference's own arithmetic or a pixel measurement of both pages in the same browser at the same
viewport (the reference at 1280×800, ours at 1100×544, ours opening on titanium to match the reference's
own default element):

| | Reference | Ours, before | Ours, now |
|---|---|---|---|
| Cluster radius (per nucleon radius) | `0.9 · ∛N` | `1.5 · ∛N` | `0.9 · ∛N` |
| Iron's nucleons, centre to nearest centre | `0.76` diameters | `1.27` diameters | `0.76` |
| Oganesson's nucleons | `0.59` | `0.98` | `0.59` |
| Nucleus width, measured, as a share of the frame's height | 0.1237 | **0.1599** | **0.1360** |
| The atom's whole width, measured, same share (the electron box) | 0.5863 | 0.4430 | 0.6710 |
| Nucleus ÷ the atom around it | 0.211 | **0.361** | **0.203** |
| Rings' planes | one per shell | one plane for all of them | one per shell |
| Innermost ring ÷ half the frame's height (titanium) | 0.370 | 0.252 | 0.360 |
| Nucleus + a nucleon ÷ the same half-height (titanium) | 0.1396 | 0.1700 | 0.1399 |
| Proton pixels, mean brightness ÷ their own colour | 0.62 | 0.52 | 0.51 |
| Proton pixels, brightest ÷ their own colour | 1.09 | 1.22 | 0.87 |

**The fixes, in the order the complaints came.**

1. **The gaps.** The cluster radius is the reference's `0.9 ∛N` now, and the mean distance from a nucleon
to its nearest neighbour is under one diameter for every element but helium — for iron it is `0.76`,
where before it was `1.27`, which is a fifth of a sphere's width of daylight at every contact. Held by
`tests/lib/atom-model.test.js` against all 118 records rather than asserted in a sentence.
2. **The size.** Two things were wrong. The nucleus was packed too loosely *and* the rings were placed
against a fixed base radius that never grew, so a heavy nucleus swelled inside a cage that stayed put:
uranium's first ring stood at 2 units and its nucleus at 1.35, where the reference's ratio is roughly
three to one. The rings now carry the reference's own spread (`1 + 0.15 · clusterRadius`), and the camera
stands `13.1` from the origin rather than `17` — the reference's own `17.71 ÷ 1.35`, since our radii are
its radii before its model scale. The measured nucleus went from 0.36 of the atom around it to 0.20,
against the reference's 0.211.
3. **The look.** The rings lie in a plane each, which is the single biggest change and the one that makes
the picture read as an atom rather than as a disc. The light gained a hemisphere (a sky over a ground,
which gives every sphere a lit crown and a dark underside) and a specular highlight whose width is
`--atom-light-roughness` — the reference's own `0.4` — with `metalness 0.2` tinting that highlight and
taking 20% of the colour out of the diffuse. The spheres went from 24 to 32 segments. The electron's own
colour was raised from a pale blue to a clear one and its glow now peaks at its rim.

**What is still not the same, and why.**

| Still different | Why it stays |
|---|---|
| Our palette: `#e57860`, `#cfc5bc`, `#7fd2e8` | The reference's `#ff554d`, `#aaaaaa` and `#33ccff` are recorded here and shipped nowhere. The electron was *raised* toward its family — a same-hue, brighter, more saturated blue — rather than replaced by its colour. |
| Our rings carry a sky-over-ground tint; theirs are flat white | Theirs is an unlit material and a hairline; ours takes the same ambient the particles do, so a ring is a little brighter where its own tube faces up. A deliberate effect, and the one shading difference that survives. |
| Our electron's glow is stronger at its rim | A rim is not a thing the reference has; it is what makes a 9-pixel sphere read as a point of light on a 544-pixel stage. |
| The atom turns on its own | The reference's atom is still until it is shaken. A slow turn is ours, and the first frame now opens in the reference's *own* orientation, so the still picture is theirs and only the movement is not. |
| The stage is a 34rem panel inside a page | This site's pages are pages; a full-viewport canvas would be a different site. Recorded in Phase 14's deviations. |

## 7. The stage's own background, as measured

The author asked for the reference's grid behind our scene, so it was measured the same way everything
else here was: the live page's computed styles, then the pattern's own pixels with the canvas hidden.

| Property | Measured value |
|---|---|
| The field | `background: rgb(26, 31, 38)` — `#1a1f26`, a dark blue-grey, on the `<main>` element, **behind** the canvas |
| The canvas | `background: rgba(0, 0, 0, 0)` in the DOM and cleared transparent in GL, which is what lets the field show through it |
| The pattern | An inline SVG data URI on the same element: a 100 × 100 tile, `fill='#9C92AC'` at `fill-opacity='0.03'`, the graph-paper path from Hero Patterns — a 1px rule every 10px, and one heavier rule every 100px |
| The rule's own colour | Sampled from a screenshot with the canvas hidden: the field reads `rgb(30, 34, 42)` and a rule `rgb(30, 37, 46)` — **three to four units per channel**, which is a line a reader sees only because nothing else on the page competes with it |

**What we did with it, and why it is not a stylesheet here.** Our stage is a panel inside a page rather
than a full viewport, so the grid is drawn at the panel's scale — 28 CSS pixels between lines, every
fourth one stronger — and it is drawn **by the scene**, as its own first pass, rather than as a page
pattern behind a transparent canvas. That is a measured decision and not a preference: the canvas here
is opaque because a translucent ring blended into a transparent buffer and composited afterwards comes
out at a third of the opacity it was asked for, and the rings' opacity is one of the numbers recorded in
`05-atom-renderer-measurements.md`. The reference can afford a transparent canvas because its rings are
flat and unlit; ours is lit, and it is measured.

The field is ours rather than the reference's `#1a1f26`: a lifted deep pine, so the page around the
panel still reads as paper and the grid has somewhere to sit. Its numbers are five tokens in
`tokens.css` §21, and the measurements in this section are why they are those numbers.
