# The atom renderer, measured

The plan's Phase 12 asks for two things that cannot be asserted from memory: that the layer draws a
moving frame in a browser with no console errors and no failed requests, and that its **draw-call and
frame-time numbers are recorded**. This is the record. It is one run of one script on one machine, and
it says so: a frame time is a fact about a graphics card, not about the code.

**Where the numbers come from.** `tools/visual/audit-atom-renderer.mjs`, run against the
development-only stage on `/styleguide/` (`BASE=http://127.0.0.1:4188 node audit-atom-renderer.mjs`).
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
| Lit pixels of the stage | 0.87 % (2 963 sampled of 341 322) | 2.3 % (7 898 sampled) |
| Proton / neutron / electron pixels found | 1 074 / 1 543 / 44 | — |

**Draw calls scale as designed.** One instanced call carries every particle, whatever the atom is made
of; each orbit is one small mesh. 43 particles and 3 orbits are 4 calls; 125 and 7 are 8. There is no
per-particle call to grow, so the cost of a heavier atom is the same shape as a light one.

**The browser's own frame cadence over the same run:** median **16.70 ms**, mean 16.59 ms, worst
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

  43 particles and 3 orbits · 4 draw calls · 0.10 ms in the layer, 0.11 ms averaged
  readout: {"particles":"43","orbits":"3","calls":"4","frameMs":"0.100","averageMs":"0.115"}

  ok   the frame issues at least one call for the particles and one per orbit
  ok   the particles are one call and each orbit is one more
  ok   a frame's own work costs less than one sixtieth of a second
The stage has an atom on it

  0.87% of the stage is something other than its own colour (2963 of 341322 sampled pixels)
  classified: 1074 proton, 1543 neutron, 44 electron pixels

  ok   the frame holds a drawn picture rather than an empty stage
  ok   the proton colour from the token layer is on the stage
  ok   the neutron colour from the token layer is on the stage
  ok   the electron colour from the token layer is on the stage

  browser frames: median 16.70 ms, mean 16.59 ms, worst 16.80 ms over 90 frames

Every control changes the render

  ok   the heavy field holds 118 nucleons and 7 electrons
  ok   seven orbits are drawn for it
  ok   a heavier atom is a different picture
  ok   and it is still one call for the particles and one per orbit

  125 particles and 7 orbits · 8 draw calls · 0.20 ms in the layer, 0.19 ms averaged

  ok   three times the particles paint more of the stage (7898 lit pixels against 2963)
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
