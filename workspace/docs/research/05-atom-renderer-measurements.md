# The atom renderer, measured

The plan's Phase 12 asks for two things that cannot be asserted from memory: that the layer draws a
moving frame in a browser with no console errors and no failed requests, and that its **draw-call and
frame-time numbers are recorded**. This is the record. It is one run of one script on one machine, and
it says so: a frame time is a fact about a graphics card, not about the code.

**Where the numbers come from.** `tools/visual/audit-atom-renderer.mjs`, run against the
development-only stage on `/styleguide/` (`BASE=http://127.0.0.1:4188 node audit-atom-renderer.mjs`),
with its pixel reading in `tools/visual/atom-pixels.mjs` — shared, because the atom page's own audit
will ask the same question of the same layer.
The script asks its own questions and exits non-zero on any that fail, on any console message at all,
and on any failed request — so the recorded run passing is the page being clean, not a filter over it.

**The machine and the card.**

| | |
|---|---|
| Renderer | `WebGL 2.0 (OpenGL ES 3.0 Chromium)` |
| Device | `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)` |
| Browsers | headless Chrome via Playwright, `channel: "chrome"` |
| Viewport | 1280 × 900 at `deviceScaleFactor: 3`, which is what makes the layer's ratio cap a real test rather than a formality |

**The scene.** The style guide's demonstration: nucleons on a golden-angle spiral inside a cluster,
one electron per orbit, orbits at the token layer's radii. This is deliberately *not* the atom model —
that is Phase 13's, with counts from an element record. What is measured here is the layer.

## The numbers

| | 40 nucleons, 3 orbits | 118 nucleons, 7 orbits |
|---|---|---|
| Particles | 43 | 125 |
| Draw calls a frame | **4** | **8** |
| The layer's own work, last frame | 0.10 ms | 0.20 ms |
| The layer's own work, averaged over 60 frames | 0.11–0.12 ms | 0.12–0.19 ms |
| Lit pixels of the stage | 0.87 % (2 953 sampled of 341 322) | 2.3 % (7 848 sampled) |
| Proton / neutron / electron pixels found | 1 125 / 1 690 / 43 | — |

The draw calls and the frame times are stable from run to run; the pixel counts move a little,
because the scene is turning and a sphere one frame further round covers a slightly different
number of pixels. They are quoted from the one recorded run below rather than averaged over runs.

**Draw calls scale as designed.** One instanced call carries every particle, whatever the atom is made
of; each orbit is one small mesh. 43 particles and 3 orbits are 4 calls; 125 and 7 are 8. There is no
per-particle call to grow, so the cost of a heavier atom is the same shape as a light one.

**The browser's own frame cadence over the same run:** median **16.70 ms**, mean 16.55 ms, worst
16.80 ms over 90 frames — i.e. vsync-bound at 60 frames a second with the layer using about 0.7 % of a
frame's budget. The layer is nowhere near being the constraint at this size, which is what makes the
instanced design a decision rather than a hope.

## The defect this found, and the test it left behind

The first measured run reported **0 proton, 213 neutron and 30 electron pixels**, and a lit share of
0.15 %. The neutrons were the orbits — pale, and close enough in hue to the neutron colour to be
classified as one — and **no particle was painted at all**. The scene was drawing a valid frame, of the
rings only.

The cause: the particles were drawn from a vertex array that carried the per-particle buffers
(`aOffset`, `aRadius`, `aColour`, `aGlow`) and **not** the sphere's own `aPosition` and `aNormal`. An
attribute that is not enabled in the array being drawn reads as zero, so every sphere collapsed to a
point at its own centre. The draw call was issued exactly as the design intended and painted nothing.

**Why the unit tests passed.** They held the layer to its *call sequence* — one instanced draw, four
sub-buffer uploads, the right uniforms — and the call sequence was right. A transcript cannot see that
the picture is empty.

**What changed.** One vertex array now carries the sphere and the instances together
(`atom-meshes.js`), and the stub records **which array was bound** when each attribute was pointed at,
so a test can make the claim the browser made:

> the draw uses one vertex array that carries the sphere and the particles together

That test was run against the defective revision and **failed**, then against the fix and passed.
Alongside it, the audit now reads the drawing buffer inside a frame and classifies the pixels against
the token layer's own colours — proton, neutron, electron — which is what turns "a frame was drawn"
into "the atom is on the stage, in our colours". A particle is lit, so a pixel is matched to a colour
times some brightness rather than to the colour itself.

## The recorded run

```
The atom renderer, on http://127.0.0.1:4188/styleguide/

  WebGL 2.0 (OpenGL ES 3.0 Chromium) — ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)

A drawn stage

  ok   the canvas is on the page
  ok   two frames a quarter of a second apart differ: the scene is moving

  43 particles and 3 orbits · 4 draw calls · 0.10 ms in the layer, 0.12 ms averaged
  readout: {"particles":"43","orbits":"3","calls":"4","frameMs":"0.100","averageMs":"0.115"}

  ok   the frame issues at least one call for the particles and one per orbit
  ok   the particles are one call and each orbit is one more
  ok   a frame's own work costs less than one sixtieth of a second
The stage has an atom on it

  0.87% of the stage is something other than its own colour (2953 of 341322 sampled pixels)
  classified: 1125 proton, 1690 neutron, 43 electron pixels

  ok   the frame holds a drawn picture rather than an empty stage
  ok   the proton colour from the token layer is on the stage
  ok   the neutron colour from the token layer is on the stage
  ok   the electron colour from the token layer is on the stage

  browser frames: median 16.70 ms, mean 16.55 ms, worst 16.80 ms over 90 frames

Every control changes the render

  ok   the heavy field holds 118 nucleons and 7 electrons
  ok   seven orbits are drawn for it
  ok   a heavier atom is a different picture
  ok   and it is still one call for the particles and one per orbit

  125 particles and 7 orbits · 8 draw calls · 0.20 ms in the layer, 0.15 ms averaged

  ok   three times the particles paint more of the stage (7848 lit pixels against 2953)
  ok   the wheel brings the camera closer
  ok   a drag swings the camera

Paused is paused

  ok   with the loop stopped, nothing changes
  ok   and the layer is not stepping at all
  ok   pressing play starts it moving again

Three widths, one drawing surface

  ok   at 375px the surface is the box at the capped ratio of two, not the device's 3 (650x1088)
  ok   at 768px the surface is the box at the capped ratio of two, not the device's 3 (1436x1088)
  ok   at 1440px the surface is the box at the capped ratio of two, not the device's 3 (2196x1088)

A browser with no WebGL2

  ok   the stage says it could not be drawn
  ok   and claims no draw calls
  ok   and leaves a note in place of the canvas

Every claim held.
```

## What this does not say

- **Nothing about the atom's appearance as an atom.** The style guide's field is a spiral of spheres;
  whether a nucleus reads as a nucleus is the model's question, and it is measured when the page
  exists.
- **Nothing about a phone.** These are one desktop card at one device ratio. The surface rule is
  checked at three widths, but the frame times are a desktop's.
- **Nothing about the page.** There is no `/atoms/` yet; this is the layer under it, proved before
  anything depends on it.

## Phase 13 — the model and the scene, measured

The plan's Phase 13 asks for the same discipline one level up: that **every element and every extreme
renders on the style guide without an error**, that **switching element, and changing a count, changes
the picture — verified by comparing frames** rather than by reading the code, and that **the frame time
at 1280 x 800 is measured for the heaviest atom the page allows**. This is the record of one run of
`tools/visual/audit-atom-scene.mjs` (`BASE=http://127.0.0.1:4188 node audit-atom-scene.mjs`), on the
machine in the table above, with the same rule as the renderer's own audit: it exits non-zero on any
failed claim, any console message at all, and any failed request. **33 claims, all held, 0 console
messages, 0 failed requests.**

What the stage is now: `atom-model.js` builds the atom from a real record, `atom-scene.js` drives it on
the layer, and the guide's controls put any of the 118 elements, or any three counts, through the same
two modules a page will run.

### The numbers

| | Carbon, on opening | Oganesson-264, the heaviest the feature allows | The guide's own ceiling (118 / 300 / 200) |
|---|---|---|---|
| Particles | 18 | 382 | 618 |
| Orbits | 2 | 7 | 8 |
| Draw calls | 3 | 8 | 9 |
| The scene's work, last frame | 0.20 ms | 0.30 ms | 0.10 ms |
| The scene's work, averaged over 60 frames | 0.29 ms | **0.258 ms** | 0.245 ms |
| The browser's own cadence | — | **median 16.70 ms, mean 16.52 ms, worst 16.80 ms over 90 frames** | — |

Two things worth reading off it. The heaviest atom the feature allows costs **0.258 ms a frame** on
this machine — sixteen times under the 16.70 ms the display gives it — so the picture is not what a
page has to budget for; and the guide's ceiling of 618 particles costs no more than the 382 do, which
is what one instanced call for every particle and one small mesh per ring is supposed to look like.

### The exit criteria, measured

- **Every element draws as itself.** All 118 records through the page's own picker, each held against
  the record read in Node as well as in the page: its symbol, one ring per shell the record actually
  has, a particle for every proton, neutron and electron, and the neutrons that record's own weight
  names. 118 of 118.
- **A new element is a new picture.** Hydrogen, carbon, iron, uranium and oganesson: five frames
  hashed, five distinct.
- **A new count is a new picture.** Six neutrons to thirty, then the electrons taken away: a different
  frame each time.
- **Every extreme draws too.** No protons and nothing at all (0 particles, 0 orbits), a nucleus with no
  neutrons, a carbon ion with no electrons (0 orbits), one proton too many — 119 protons, drawn as a
  picture of the counts rather than of an element, with the picker showing nothing rather than an
  element that is not there — and the guide's own ceilings. Each renders, each says which kind of thing
  it is, and each is a different picture from the one before it.
- **The stage paints in the token layer's colours.** Proton, neutron and electron pixels all classified
  in the frame at the heaviest atom, which is what a scene that uploaded the wrong buffers could not do.
- **A machine without WebGL2** gets a stage that says so, claims no draw calls, and reports no frames
  rather than a counter that never moves.

### The defect this found

The extremes found one, and it was in the **model** rather than in the layer: `buildAtom` with no
protons and no neutrons threw — "a sphere's radius must be a positive number" — because it asked
`pointSphere` for a cluster of radius zero. A reader can reach that state by typing zero into all three
fields, so a refusal there is a reader's own zero becoming an error on a page. The fix returns an
**empty** set of points for an empty nucleus; the empty stage it makes draws no instanced call and no
ring at all, and both halves are held by tests, in `tests/lib/atom-model.test.js` and
`tests/components/atom-scene.test.js`.

The renderer's own audit found a second, smaller one the moment the guide stopped being a throwaway
field: the readout rewrote the new atom's particle and ring counts beside the **previous** frame's draw
call count, so its long-standing claim that the calls are the particles once plus the orbits once failed
for one frame. The readout now describes drawn frames only — changing the atom no longer reports, and
the next frame does, which is one frame later at worst.

### The recorded run

```text
The atom model and its scene, on http://127.0.0.1:4188/styleguide/

  ok   the picker offers all 118 elements (118 found)

  the stage opens on Carbon · C-12 · 18 particles and 2 orbits · 3 draw calls · 0.20 ms in the scene, 0.29 ms averaged
  readout: {"element":"C","particles":"18","orbits":"2","calls":"3","frameMs":"0.200","averageMs":"0.293"}

  ok   the stage holds a drawn picture rather than an empty ground
  ok   the proton colour from the token layer is on the stage
  ok   the neutron colour from the token layer is on the stage
  ok   the electron colour from the token layer is on the stage

Every element draws as itself

  ok   all 118 elements draw as themselves

A new element is a new picture

  ok   five elements are five different frames (5 distinct)

A new count is a new picture

  ok   thirty neutrons are a different picture from six
  ok   taking the electrons away is a different picture again

Every extreme draws too

  ok   no protons, nothing at all: no-protons, 0 particles, 0 orbits
  ok   no protons, nothing at all: a different picture from the one before it
  ok   a nucleus with no neutrons: element, 12 particles, 2 orbits
  ok   a nucleus with no neutrons: a different picture from the one before it
  ok   a carbon ion with no electrons: element, 12 particles, 2 orbits
  ok   a carbon ion with no electrons: a different picture from the one before it
  ok   one proton too many: not-an-element, 414 particles, 6 orbits
  ok   one proton too many: a different picture from the one before it
  ok   the guide's own ceilings: element, 618 particles, 8 orbits
  ok   the guide's own ceilings: a different picture from the one before it

Counts that name no element

  ok   119 protons is drawn as a picture of the counts, not as an element
  ok   and it claims no symbol
  ok   the picker shows nothing rather than an element that is not there

The heaviest atom, at 1280 x 800

  ok   the heaviest atom is 382 particles
  ok   seven rings
  ok   eight draw calls: one for every particle and one per ring
  ok   all three particle colours are painted

  Oganesson · Og-264 · 382 particles and 7 orbits · 8 draw calls · 0.30 ms in the scene, 0.26 ms averaged
  scene: 0.300 ms this frame, 0.258 ms averaged over 60 frames
  browser: median 16.70 ms, mean 16.52 ms, worst 16.80 ms over 90 frames

  ok   the scene's own work stays under 8 ms a frame (0.258)
The guide's own ceiling, for the record


  Oganesson · Og-418 · 618 particles and 8 orbits · 9 draw calls · 0.10 ms in the scene, 0.25 ms averaged
  scene: 0.100 ms this frame, 0.245 ms averaged


Controls that move the view

  ok   a drag swings the camera
  ok   pressing Shake leaves the scene drawing rather than stopped
  ok   with the loop stopped, nothing changes

A browser with no WebGL2

  ok   the stage says it could not be drawn
  ok   and reports no frames rather than a stuck counter
  ok   and leaves a note in place of the canvas

All claims held, 0 console message(s)
```

### What this does not say

- **Nothing about how the atom reads to a person.** Whether a nucleus reads as a nucleus, whether a
  ring is legible at the back of the stage, whether the count controls belong where they are — that is
  the page's question, and it is judged when the page exists.
- **Nothing about a phone.** One desktop card at 1280 x 800, at a device ratio of one. The surface
  rule is checked at three widths in the renderer's own run above, but these frame times are a
  desktop's.
- **The "heaviest atom the feature allows" is a statement about the feature's rules.** The guide's own
  inputs go further — 300 neutrons and 200 electrons are on offer there because a reader tuning the
  picture wants the headroom — which is exactly why its ceiling is measured in the same run.
