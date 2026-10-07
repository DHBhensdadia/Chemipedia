# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is not sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-07 (the session that closed **Phase 14** — the page, the bar, the way in
from every element page, and the two site-wide sweeps — on `feature/atom-3d`; Phases 12, 13 and 14
are `COMPLETE`, and Phase 15, the delivery, has not started)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | **Phases 12, 13 and 14 are `COMPLETE`** — the renderer, the model and its scene, and the page a reader can reach — and **Phase 15 — Quality, delivery and the second reference's line — is `NOT_STARTED`**. What remains is the four gates over the new page (accessibility, responsive, performance and Lighthouse, three of which have already been re-run by hand with `/atoms/` in their lists), the documentation the plan names (`DESIGN_SYSTEM.md`, `ARCHITECTURE.md`'s **ADR-007**, `BRAND_GUIDELINES.md`, `DATA_SOURCES.md`, the guides and the README's route count), and the delivery itself: a `--no-ff` merge to `main`, a push, a green Pages run, a live check of `/atoms/` and the `v1.1.0` tag — none of which has happened. The atom viewer's four phases (12–15) are planned in `docs/IMPLEMENTATION_PLAN.md` §3; phases 0–11 are `COMPLETE`, and the site is published |
| **Branch** | `feature/atom-3d`, cut from `main` at `a22c0d2`, with the plan itself as its first commits. Nothing is merged or pushed yet. `main` is untouched by the feature |
| **Objective (this feature)** | A page at `/atoms/`, in the navigation as **Atoms** between *Periodic Table* and *Elements*, that draws the chosen element as a three-dimensional atom: a nucleus of protons and neutrons, electrons orbiting on rings, free counts on all three particles, a speed control, a shake and a reset — and a translucent bar pinned to the bottom centre carrying the element card, the three steppers, the speed and the legend. Hand-written WebGL2 (ADR-004), a deep pine stage inside a paper-light page (ADR-006), the element's shell diagram built at build time as the fallback, and a new token group in `tokens.css` as the only place any of its values live. The reference it replicates, and what we deliberately leave behind, are measured in `docs/research/04-reference-atom-viewer-audit.md` |
| **Work item (previous phase)** | Phase 11 closed on four sweeps that measure rather than inspect, seven accessibility defects found and fixed (two by our own sweep, four by Lighthouse, one by the browser's own contrast maths), one performance defect found and fixed at its cause, per-page metadata with the two crawl files, a Pages workflow, and 482 green tests. **All twelve phases are `COMPLETE`**, and the deployment the plan asked for is now **live** at `https://dhbhensdadia.github.io/Chemipedia/` — the author's one-time push ran on request, the live address then exposed a defect no local run could (`bd338dd`), and the corrected build was redeployed and verified |
| **Status (this feature)** | **Phase 14 is `COMPLETE`**, and the feature is now a page a reader can reach. `/atoms/` is declared with `nav: { label: "Atoms", order: 2 }` — *Periodic Table*, **Atoms**, *Elements*, *Glossary*, *Calculators* — the build writes 563 routes, and the page arrives finished before any script runs: the hero, the element's shell diagram, the counts in words and the whole bar, with the canvas replacing the diagram only once a frame has actually been drawn. `tools/visual/audit-atom.mjs` asks **54 questions** and they all hold with **0 console messages and 0 failed requests** — the stage paints in the token layer's colours, every control changes the render by pixel hash, the bar is walked **by the keyboard alone** (15 controls in document order, forwards and backwards, a visible ring on the dark stage, and a count typed and submitted turning the stage into iron), a paused loop is byte-identical frame to frame, a reduced-motion reader gets a still frame and a working Play, a reader with no WebGL2 keeps the diagram and the reason, a reader with no scripting keeps the whole built bar, `/atoms/#uranium` opens on uranium, and the one link an element page carries into the viewer is followed by a real click and lands on that element. Every element page now carries that link — *See Iron in three dimensions* at `/atoms/#iron` — and `/atoms/` has joined the two site-wide sweeps: **0 defects and 29 informational lines across 20 pages**, and **80 of 80** page-and-width combinations fit. Three defects were found by measuring rather than by reading: a repository passed where a list was expected (which the unit test could not see because it was handed the same wrong thing), the bar's one link at **1.47:1** on the dark glass, and the route manifest crossing the project's 400-line ceiling — the last split into `router/routes.js` (362) and `router/route-sheets.js` (64). Suite: **658 pass, 0 fail**. Phase 13 is `COMPLETE`: the point distribution, the model and the scene are committed and green, and the phase's exit criteria are measured rather than asserted — `tools/visual/audit-atom-scene.mjs` puts all 118 records through the guide's own picker, hashes frames across an element change and a count change, renders every extreme the plan names, classifies the stage's pixels against the token layer's colours, and records the heaviest atom the feature allows at 1280 x 800: 382 particles and 7 rings in 8 draw calls at **0.258 ms** a frame against a 16.70 ms cadence, with 0 console messages and 0 failed requests. Neither the model nor the scene is on a page yet. Phase 13's pure half is in and proved: `scripts/lib/point-sphere.js` (the golden-angle spiral, deterministic, centred, rescaled so the radius asked for is the cluster's outer edge) and `scripts/lib/atom-model.js` — a record plus three counts becomes every nucleon's place and kind, a nucleus radius, one ring per shell taken from the record's own `shells`, and each electron's phase — 27 tests over the real 118 records and the scale read out of `tokens.css`. On top of it `scripts/components/atom-scene.js` brings the model to life: one instanced draw for the whole atom, one ring per shell, the electrons on the scene's own clock so a speed change cannot make them jump, an impulse shake with an exponential decay, and 19 tests through a recording canvas. What is left of the phase is the style guide driving it and the recorded frame time. Phase 12 is `COMPLETE` and **proved in a browser rather than in a stub**: the layer draws a moving frame on the style guide's stage with **0 console messages and 0 failed requests**, and its own numbers are recorded in `docs/research/05-atom-renderer-measurements.md` — 43 particles and 3 orbits in **4 draw calls** at 0.10 ms in the layer, 125 and 7 in **8 draw calls** at 0.20 ms, against a 16.70 ms vsync-bound cadence on an Apple M4 through ANGLE. The suite is **577 pass, 0 fail**; the accessibility sweep still reports **0 defects across 19 pages** and the responsive sweep **76 of 76**. Measuring found the one defect no unit test could: the particle draw used a vertex array that left the sphere's own attributes unbound, so every sphere collapsed to a point at its centre and the frame showed only the orbits — and the fix carries a regression test that was run against the defective revision and failed there. No page uses the layer yet |
| **Objective achieved** | The replica is a finished product. Every page is rendered at build time rather than assembled by the browser, so a crawler and a reader whose script did not run both see the site. Every page carries a title, a description, a canonical link, Open Graph metadata and JSON-LD, and the build writes `sitemap.xml` from the routes it actually wrote plus a `robots.txt` naming it. Twenty pages now pass an accessibility sweep with 0 defects (nineteen at publish, before `/atoms/` existed) and all 80 page-and-width combinations fit their viewport (76 of 76 at publish), the worst layout shift on any page is 0, and Lighthouse scores accessibility, best-practices and SEO at 100 across seven sampled pages |
| **Status** | `COMPLETE` and **published**. The live site answers 200 for `/`, a stylesheet, a module, the icon, `data/elements.json`, an element page, `sitemap.xml` and `robots.txt`, all under `/Chemipedia/`, and the domain root answers 404 — which is the point of the path. Locally, as the branch stands today: `node --test source/tests` → **658 pass, 0 fail** (497 when the site was published). The build writes **563 routes** plus the not-found page and reports **0 waiting** (562 at publish). Three of the four gates have been re-run with `/atoms/` in their page lists — accessibility **0 defects / 29 informational lines across 20 pages**, responsive **80 of 80**, and the performance and Lighthouse sweeps are Phase 15's to re-run; their publish-time readings were **worst shift 0, slowest cold load 38–41ms, 0 long tasks** and **accessibility 100, best-practices 100, SEO 100, performance 89 mean (82–98, recorded not gated)**. A clone into an empty directory builds and passes the suite with nothing installed |
| **Current commit** | on `feature/atom-3d`, clean: the plan first — the second reference's audit, then the four phases with the checkpoint and the handoff — then Phase 12 in five commits (the arithmetic `e748de5`, the camera `19bc719`, the meshes `f557ea3`, the four modules the layer is `adcbbe5`, the browser proof `cb570b3`), Phase 13 in five (`c3b2aaf`..`86da30b`), and Phase 14 in two: the route, the page, the bar and the navbar item in `861307d`, and the close-out commit with the way in from every element page, the fragment, the keyboard and fragment claims, the two site-wide sweeps and the split the line ceiling forced. `main` is at `a22c0d2`, which is the publish close-out: the deployment fix `bd338dd` (every URL the site writes stays inside the path it is published under), tagged `v1.0.1`, plus its documentation. `v1.0.0` stays where it is, on `e035c6f` — the release whose publication exposed the defect |
| **Next action** | **Phase 15, starting with the gates the plan names**: run `audit-performance.mjs` and `audit-lighthouse.mjs` with `/atoms/` in their page lists (accessibility and responsive have already been re-run with it — 0 defects over 20 pages, 80 of 80), then write the documentation (`DESIGN_SYSTEM.md`'s token group, `ARCHITECTURE.md`'s **ADR-007** — raw WebGL2, progressive enhancement, palette from tokens, no library —, `BRAND_GUIDELINES.md`'s line on the second reference, `DATA_SOURCES.md`'s "no new data and why", the guides and the README's 563 routes). Delivery is the author's: a `--no-ff` merge to `main`, a push, a green Pages run, a live check of `/atoms/` and `v1.1.0` — **do not merge, push or tag without being asked** |

## Files expected to change in the next work item

```
Phase 12  source/scripts/lib/matrix4.js            ✅ the 4x4 arithmetic              e748de5
          source/scripts/lib/orbit-camera.js       ✅ the camera, pure                19bc719
          source/scripts/lib/primitive-geometry.js ✅ a sphere's and a ring's buffers  f557ea3
          source/scripts/components/frame-loop.js  ✅ when a frame is drawn           adcbbe5
          source/scripts/components/atom-shaders.js ✅ the GLSL, and createProgram    adcbbe5
          source/scripts/components/atom-meshes.js ✅ the vertices and the buffers    adcbbe5
          source/scripts/components/atom-view.js   ✅ the WebGL2 layer                adcbbe5
          source/styleguide/atom-demo.js           ✅ the layer, driven on the guide  cb570b3
          source/styles/tokens.css                 ✅ §21 the scene's palette and numbers cb570b3
          source/tests/components/webgl-stub.js    ✅ the recording stub both layers are judged through
          source/tests/{lib,components}/*.test.js  ✅ one per module
Phase 13  source/scripts/lib/point-sphere.js       ✅ even points on a sphere        c3b2aaf
          source/scripts/lib/atom-model.js         ✅ record + counts = the model    7223652
          source/scripts/components/atom-scene.js  ✅ the model, alive               b1e7761
          source/styleguide/atom-demo.js           ✅ the scene, driven on the guide  3cf6661
          workspace/tools/visual/audit-atom-scene.mjs ✅ 33 questions, all held       3cf6661
Phase 14  source/pages/atoms.html                  ✅ the template                 861307d
          source/scripts/pages/atoms.js            ✅ the page, as the build writes it 861307d
          source/scripts/components/atom-bar.js    ✅ the bar's markup               861307d
          source/scripts/components/atom-stage.js  ✅ the page in a browser          861307d
          source/scripts/lib/atom-words.js         ✅ the sentences both halves read  861307d
          source/styles/pages/atoms.css            ✅ the page's own sheet            861307d
          source/styles/components/atom-*.css      ✅ the stage's and the bar's sheets 861307d
          source/styles/tokens.css                 ✅ §21: the stage, the glass and the bar 861307d
          source/scripts/router/routes.js          ✅ the route and nav 2; 401 → 362 lines, split  this commit
          source/scripts/router/route-sheets.js    ✅ new: the sheet sets the routes share      this commit
          source/scripts/app.js                    ✅ the behaviour entry             861307d
          source/scripts/pages/element-detail.js   ✅ the one link into the viewer, on all 118   this commit
          source/styles/pages/element-detail.css   ✅ the pill that link is drawn as            this commit
          workspace/tools/visual/audit-atom.mjs    ✅ 54 questions, including the keyboard and the fragment
          workspace/tools/visual/audit-{a11y,responsive}.mjs ✅ /atoms/ in the lists: 20 pages, 80 of 80
Phase 15  the four gates over `/atoms/`           performance and Lighthouse still to run
          the documentation, and the delivery      ADR-007, DESIGN_SYSTEM, BRAND, DATA_SOURCES, guides,
                                                    README, then merge, push, Pages, live check, v1.1.0
```

The plan is delivered end to end, and the site is live. If a later phase reopens a page, the pieces
to touch are the page's family module, its template, its sheet, its entry in the route manifest and
its tests; `docs/MIND_MAP.md` §4 answers "which file owns this" for every case, and every new file
must appear there in the same commit. Anything that writes a URL — markup a page or a component
builds, a data file a repository reads, a link the browser writes after a page has loaded — must be
checked against a deployment served from a path, not only against the development server at a root.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0–3.5 Table engine and its capture | `COMPLETE` | See the Phase 3 entry; every box measured against the reference | `bf1d8e3`..`2f06018`, `1db2fc7` |
| 4.0–4.6 Home page and the harness | `COMPLETE` | See the Phase 4 entry; table crop 2.28% at 1280px with no box differing in size | `7587a66`..`7837dce` |
| 5.0–5.6 Routing and the element pages | `COMPLETE` | See the Phase 5 entry; 278 tests, the router verified in a browser | `4763e89`..`2cd6460` |
| 6.0–6.6 Elements index and attribute rankings | `COMPLETE` | See the Phase 6 entry; the index's card grid and the ranking pages' skeletons measured live | `6cd3b14`..`44e3493` |
| 7.0–7.6 The four alternate table views | `COMPLETE` | See the Phase 7 entry; 369 tests, four pages captured and pixel-diffed | `a0b0df8`..`d1a4ad4` |
| 8.0–8.6 Element group pages | `COMPLETE` | See the Phase 8 entry; the table region 0.53% / 1.98% / 0.73% of the reference's and identical in size | `a49dd6d`..`54832b4` |
| 9.0–9.8 The glossary | `COMPLETE` | See the Phase 9 entry; 413 tests, the index 4.66% / 4.53% / 5.55% of the reference's and a term page 3.60% / 3.84% / 5.11% | `5a05a1f`..`73fbb47` |
| 10.0–10.7 Calculators and secondary pages | `COMPLETE` | See the Phase 10 entry; 458 tests, the calculator audited live, print measured by page count at A4 and Letter | `df4d60e`..`b9999d3`, `dc59554` |
| 11.0 The accessibility sweep, and the 443 contrast failures it found | `COMPLETE` | `tools/visual/audit-a11y.mjs` measures 19 pages for landmarks, heading order, names, captions, contrast against the surface each colour is composited over, the table's roving tab stop and reduced motion, exiting non-zero on a defect. `--ink-faint` `#5b726e`; the legend counts are ringed rather than washed | `f1cef8e`, `969cbdf` |
| 11.1 The responsive sweep over four widths | `COMPLETE` | `tools/visual/audit-responsive.mjs`: 19 pages at 375 / 768 / 1024 / 1440 → **76 of 76** fit, exit 0. Found the orbital-configuration rows spilling 68px at 375px | `7269c9f`, `04a9e45` |
| 11.2 Per-page metadata, and the two crawl files | `COMPLETE` | `tools/document.js` writes canonical, Open Graph, a `summary` Twitter card, JSON-LD per page (a `Thing` naming the element on its own page), a 562-`loc` `sitemap.xml` from the routes actually written, and `robots.txt`. `SITE_ORIGIN` with a reserved `.example` default | `bf44dd7` |
| 11.3 The build split the 400-line law forced | `COMPLETE` | `tools/document.js` owns what a document looks like; `build.js` owns what is on the site. Behaviour unchanged: same 562 routes, same sitemap | `3b3b09f` |
| 11.4 The home page's blocks drawn at build time | `COMPLETE` | `homePageValues` computes the table, both diagrams and the finder; `startHome` only attaches. Layout shift **0.315 → 0**; 118 tiles and 236 diagram cells present with the script off; no duplicate id | `06c5e76` |
| 11.5 The performance sweep, and the shift it found | `COMPLETE` | `tools/visual/audit-performance.mjs`: six pages cold, reporting timings, bytes, shift and long tasks; exits non-zero over a 0.1 shift or a 2000ms load. Worst shift 0, slowest load 38–41ms across runs, 0 long tasks | `8869b4c` |
| 11.6 Lighthouse, and the four defects it found | `COMPLETE` | `tools/visual/audit-lighthouse.mjs` over seven pages, gating accessibility at 1.0 and best-practices at 0.95. Fixed the faded tile ink (4.32:1), the drained tiles (1.5:1), the element page's orphaned list items and three label-content-name mismatches | `5cc54d1`, `964bf80` |
| 11.7 The deployment, and the reference's metadata audited | `COMPLETE` | `.github/workflows/pages.yml` computes its own origin, builds, tests and hands `dist/` to Pages. `research/01` §5 records the reference's metadata live: no JSON-LD, a 404ing favicon, a 404ing `/sitemap.xml` | `b741a49`, `1c431ee` |
| Publish — the push, and the deployment it corrected | `COMPLETE` | The author's one-time step ran on request: `git remote add origin`, `main` and both tags pushed, every commit attributed on GitHub to `DHBhensdadia` with `Devansh <dhbhensdadia@gmail.com>` and a single contributor in the API's own count. Pages enabled with `build_type=workflow` — the first run failed in `configure-pages` for want of a Pages site, and its rerun was green. The live address then showed the defect a local root cannot: every URL was rooted at the domain instead of at `/Chemipedia/`. Fixed in `bd338dd`: the finished document is rewritten once at build time, the data fetch and the browser's own link read the site's path from `scripts/lib/site-path.js`. Verified: 497 tests, a simulated subpath build of 563 documents with no URL outside the site and none doubled, 118 tiles from the live data, and a live client-side navigation. | `e035c6f` (the push), `bd338dd` (the fix), tagged `v1.0.1` |
| 11.8 Documentation close-out, and the `guides/` audit it turned up | `COMPLETE` | README, `MIND_MAP.md`, `research/01` §5, this file, `HANDOFF.md`, the Phase 11 entry — and all four guides audited against the source, which found three of them drifted: 18 `(pending)` rows and functions that were never exported, a file tree naming three files that do not exist, and a page trace that had the element page hydrating when it runs no script at all. MIND_MAP completeness: 168 files under `source/`, 0 missing | `ec80c43`, plus the close-out commit |
| 12.0 The plan, the branch and the second reference's audit | `COMPLETE` | `docs/IMPLEMENTATION_PLAN.md` §2 row 17 and §3's four phases, `docs/research/04` (the reference's scene parameters and the bottom bar's geometry, measured from its own bundles and stylesheets), `MIND_MAP.md`, this file and `HANDOFF.md`. Branch `feature/atom-3d` cut from `main` at `a22c0d2`; no source file exists yet | this branch's first two commits |
| 12.1 The 4x4 arithmetic | `COMPLETE` | Column-major throughout, the product's order asserted, every malformed argument refused. 13 tests | `e748de5` |
| 12.2 The orbit camera | `COMPLETE` | Spherical state with an aim the camera eases toward at a frame-rate-independent rate; polar limits strictly inside the poles. 10 tests | `19bc719` |
| 12.3 The two meshes | `COMPLETE` | A sphere and a tube, generated rather than loaded, every triangle wound counter-clockwise from outside, index width named rather than truncated. 10 tests. Named `primitive-geometry.js` rather than `sphere-geometry.js`, and the ring is a tube rather than a flat band — a band vanishes when the camera looks along an orbit's plane | `f557ea3` |
| 12.4 The layer | `COMPLETE` | The GLSL and `createProgram`; the meshes and their buffers; the frame loop, injectable and tested without a canvas; the WebGL2 view, where everything hangs on `available()` and a program that will not build is a viewer that says so. 46 tests through a recording WebGL stub. `atom-meshes.js` and `frame-loop.js` came out of `atom-view.js` to bring it under the line ceiling | `adcbbe5` |
| 12.5 Proved on the style guide, and the numbers recorded | `COMPLETE` | `styleguide/atom-demo.js` drives the layer on the stage; `tools/visual/audit-atom-renderer.mjs` asks 25 questions and they all hold with **0 console messages and 0 failed requests**. Numbers in `docs/research/05`. Measuring found a defect the stub could not — the particle draw used a vertex array that left the sphere's own attributes unbound, so every sphere collapsed to a point at its centre — fixed with a regression test proved against the defective revision | `cb570b3` |
| 13.1 The point distribution a nucleus is built on | `COMPLETE` | `scripts/lib/point-sphere.js` and its 11 tests: the count asked for, an empty set at zero rather than an error, the furthest point on the radius with nothing outside it, the centroid on the origin, nearest-neighbour spacing even to within 14%, a mean distance above 0.97 so it is a ball and not a shell, and the refusals | `c3b2aaf` |
| 13.2 The atom model | `COMPLETE` | `scripts/lib/atom-model.js` (348 lines) held by **28 tests** in `tests/lib/atom-model.test.js` and `tests/lib/atom-electrons.test.js` over the shared `tests/lib/atom-fixtures.js`: a nucleus of the count it was given with nothing outside its own radius, protons spread through the point order, an orbit clearing the nucleus from hydrogen to oganesson, one ring per shell with Kepler's three-halves asserted as a ratio, the textbook shell capacity as a fallback and the record's own value winning, the isotope and the charge in words and the honest sentence where neither applies, and the refusals. Suite: **636 pass, 0 fail**; `node --check` clean on every module | `7223652` |
| 13.3 The atom, alive on the layer | `COMPLETE` | `scripts/components/atom-scene.js` (289 lines): the two lists the layer takes, one instanced draw a frame, the cells of `pointSphere`'s own scale, the electrons moved on the scene's clock, the atom's slow turn from `--atom-spin`, the shake as an impulse decaying as `e^(−decay · dt)`, and one token reader feeding both the model's scale and the draw, so a nucleus cannot be built at one size and drawn at another. **20 tests** in `tests/components/atom-scene.test.js`, `atom-motion.test.js` and `atom-camera.test.js` over the shared `tests/components/atom-harness.js`, which reads `tokens.css` itself: on a machine with no WebGL2 a scene draws nothing and still answers, a shake measured over one second turns the atom more than four times its idle rate and is back inside five per cent four seconds later, a speed of three moves the electrons three times as far, and changing the speed mid-flight does not move them at the instant it changes. Suite: **636 pass, 0 fail** | `b1e7761` |
| 13.4 The style guide driving the model, and the scene's numbers recorded | `COMPLETE` | `styleguide/atom-demo.js` drives the model and the scene from a picker over all 118 records, three free count fields, a speed, a shake and a reset; `tools/visual/audit-atom-scene.mjs` asks 33 questions and they all hold with **0 console messages and 0 failed requests** — all 118 elements drawn as themselves, five elements and three count changes proved to be different frames by hash, every extreme the plan names, and the heaviest atom the feature allows (382 particles, 7 rings, 8 draw calls) at **0.258 ms** a frame against a 16.70 ms cadence at 1280 x 800. The run is recorded in `docs/research/05`. Measuring found a defect the unit tests could not: `buildAtom` with no protons and no neutrons asked `pointSphere` for a cluster of radius zero and threw, so a reader's three zeros were an error on a page — fixed with an empty point set, held by a model test and a scene test. Suite: **636 pass, 0 fail** | `3cf6661` |
| 14.1 The route, the navbar item and the order | `COMPLETE` | `/atoms/` declared with `nav: { label: "Atoms", order: 2 }`; *Periodic Table* stays at 1 and *Elements*, *Glossary* and *Calculators* move to 3, 4 and 5, which `tests/router/navigation.test.js` now holds as the author's order. The build renders 563 routes | `861307d` |
| 14.2 The page, the bar and the three fallbacks | `COMPLETE` | `pages/atoms.js` writes a finished page — hero, the element's shell diagram, the counts in words and the whole bar — and `components/atom-stage.js` replaces the diagram with the scene once a frame is drawn; `lib/atom-words.js` holds the sentences both halves use. Protons stop at 118 and the free counts go past every element, and the card names the element when the counts name one and says so plainly when they do not. `tools/visual/audit-atom.mjs` asks 38 questions and all hold with **0 console messages**: the stage paints in the token layer's colours, every control changes the render by pixel hash, the live region and the canvas' name follow the counts, a paused loop is still, a reduced-motion reader gets a still frame and a working Play control, a reader with no WebGL2 keeps the diagram and is told why, a reader with no scripting keeps the whole built bar, and three widths fit with no overflow. Suite: **656 pass, 0 fail** | `861307d` |
| 14.3 The way in, the fragment, the two sweeps and the split | `COMPLETE` | Every element page carries one link into the viewer under its shell diagram — `/atoms/#<slug>`, named for the element — and `elementFromFragment` opens the page on the element a fragment names, falling back to the built element when it names none; both are held by tests, and the browser audit follows the link with a real click through the router. `/atoms/` joined the site-wide sweeps: **0 defects / 29 informational across 20 pages** and **80 of 80** page-and-width combinations, both exit 0. The page's own audit now asks **54** questions, all held, with 0 console messages and 0 failed requests — including the keyboard walk of the bar and the ring on the dark stage. Measuring found two defects (a repository passed where a list was expected; the bar's link at 1.47:1) and the working agreement found a third (`routes.js` at 401 lines, split into 362 + `router/route-sheets.js`). Suite: **658 pass, 0 fail** | this commit |
Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Four decisions from Phase 11 join the set:

| Decision | Why |
|---|---|
| **Everything a reader is meant to read is written at build time.** | The home page was the last exception and it cost a 0.315 layout shift and a table-less page for a crawler and for a reader whose script did not run. Every family is now rendered by the build from the same functions the browser would have used, and a page's behaviour only **attaches** to markup that is already there. |
| **Where the reference's own value fails AA, accessibility wins and the deviation is recorded.** | The reference's tertiary ink is 3.06:1 on our paper and its isolation dims text to 1.5:1. We darkened the ink and drain the fill instead of the tile, and both costs are written down in `DESIGN_SYSTEM.md` and in the Phase 11 deviations table rather than quietly absorbed. |
| **A canonical link is configuration, and the default cannot resolve.** | `site-origin.js` reads `SITE_ORIGIN` and falls back to a reserved `.example` address, and the build says on every run that the placeholder is in place. A confident, wrong canonical is worse than none, and the workflow passes the real origin in. |
| **The deployment is a workflow; publication is the author's step.** | `docs/GIT_WORKFLOW.md` §8 makes publishing deliberate and author-approved. The workflow, the routing fallback and the README's steps are the deliverable; the push was not claimed until it happened, and it happened on the author's instruction. |
| **A site that declares where it lives must place every URL inside that path.** | The live address is a project site, served from `/Chemipedia/`. A path written from the site's own root is right locally and leaves the site in production, and two of them cannot be rewritten after the fact: a request for a data file, and a link the browser writes after the page has loaded. So the deployment's path is read once in the build (`tools/site-origin.js` → `rootedAt` in `tools/document.js`) and once in the browser (`scripts/lib/site-path.js`, off the module's own address) — and a deployment served from a path is a case the suite covers, not a hope. |
| **Derive a claim rather than assert it.** | Unchanged, and now applied to nine families: the fading ceiling is derived from the eleven group fills by `lowestAlphaForAA` rather than chosen, and a test holds every fading token above it. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| **The deployed address is not a domain root** | It is a project site served from `/Chemipedia/`, so a URL written from the site's own root leaves the site and 404s — which is what the first deployment did | The path is read from the origin once (`tools/site-origin.js`), the finished document is rewritten once (`rootedAt`), the data fetch and the browser's own link go through `scripts/lib/site-path.js`, and a subpath-simulated build is part of the recovery steps below. `v1.0.1` is the fix; `v1.0.0` is the release that exposed it, deliberately left where it is. |
| **Deprecation notices on every Pages run** | `checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `upload-artifact@v4` and `deploy-pages@v4` target Node 20 and are being forced onto Node 24; `ubuntu-latest` moves to Ubuntu 26 on 2026-10-19 | Cosmetic today: both jobs succeeded in both runs with the notices on them. Bumping the action versions is one line each and is deliberately not bundled into a deployment fix. |
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures in headless Chrome. Phase 11 closed on its four sweeps rather than on a capture, because the only page whose markup changed was compared numerically. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers; every keyboard check this project has run went through them. |
| Three pages have no reference to compare with | About, Contact and the downloads page cannot be pixel-diffed against anything | Accepted since Phase 10: the evidence for those three is the accessibility, keyboard, overflow and link checks rather than a diff. |
| Our group band wraps to two rows at desktop | Twelve group names do not fit the shell's 1100px in one row | Recorded as a deliberate deviation in `progress/PHASE_LOG.md`. Visible again in this phase's 768px home capture as the legend wrapping, where the reference's does not. |
| Nine glossary deviations, one of them an undelivered deliverable | The plan's deliverables list an expanded explanation on a term page; the reference has none, and 418 paragraphs of new prose have no source to audit against | Recorded at the top of its deviations table in `progress/PHASE_LOG.md`. The phase's exit criteria do not ask for it. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds all of them under fakes, and this phase re-checked the roving tab stop after an in-page navigation. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The typeface is not the reference's | Every page's text measures a few per cent differently, which inflates the harness's crop numbers | A Phase 1 deviation, recorded. It is the class of difference the 1280px home capture's 2.31% belongs to. |
| Lighthouse's performance score moves between runs | A recorded number can look like a regression when the machine is busy | `audit-lighthouse.mjs` records performance and SEO rather than gating them, and the Phase 11 entry states both readings (89 and 92 mean) with the reason. Only accessibility and best-practices gate. |

## Deliberately unfinished

**The site's twelve phases are all `COMPLETE`**, and the published site is untouched by this branch.
**The feature's last phase is not**: Phases 12, 13 and 14 are `COMPLETE` and the working tree is clean
at Phase 14's close-out commit, and **Phase 15 — the four gates over `/atoms/`, the documentation and
the delivery — has not been started**.

What that leaves, in the order the plan asks for it:

1. **The performance and Lighthouse sweeps over the new page**, and `/atoms/` added to their page
   lists first. The accessibility and responsive sweeps already cover it.
2. **The documentation the plan names**: `DESIGN_SYSTEM.md` (the token group and the stage's rules),
   `ARCHITECTURE.md`'s **ADR-007** (raw WebGL2, progressive enhancement, the palette read from tokens,
   no library), `BRAND_GUIDELINES.md` (the second reference: what we take and what never enters the
   repository), `DATA_SOURCES.md` (no new data, and why), the guides, and the README's route count.
3. **The delivery**, which is the author's: a `--no-ff` merge to `main`, a push, a green Pages run, a
   live check of `/atoms/` in a browser, and `v1.1.0`. **Nothing is pushed, merged or tagged.**

Four deferrals stand, each recorded where it belongs:

1. **The plan's "expanded explanation" on a term page** — not delivered in Phase 9, because 418
   paragraphs would have no source to audit them against.
2. **Two schema fields** that no acceptable source supplies (`covalentRadius`, `latticeParameters`) —
   see `docs/DATA_SOURCES.md`.
3. **The typeface** — not the reference's, recorded as a Phase 1 deviation.
4. **Ten files over the 400-line ceiling, inherited rather than fixed.** Seven under `source/`:
   `styles/tokens.css` (795), `styles/pages/element-detail.css` (520, of which this feature's link is
   about twenty lines), `tests/pages/glossary.test.js` (473), `styles/components/periodic-table.css`
   (457), `tests/components/periodic-table.test.js` (444), `tests/router/router.test.js` (427) and
   `scripts/components/periodic-table.js` (418). Three more in `workspace/tools/visual/`, which ships
   to no page: `compare.mjs` (505), `audit-atom.mjs` (502) and `audit-atom-scene.mjs` (424). Phase 14
   split the one file it pushed over the ceiling (`router/routes.js`, now 362 lines plus
   `router/route-sheets.js` at 64); the rest is a two-file refactor each, and they are recorded in
   `progress/PHASE_LOG.md` rather than quietly kept.

The one-time push is no longer on this list: it ran on the author's instruction on 2026-10-06, and
the site it published is live.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 658 passing
node source/tools/build.js        # renders 563 routes, 0 waiting
SITE_ORIGIN=https://<owner>.github.io/<repo> node source/tools/build.js   # the deployed shape
node source/tools/serve.js --port 4180   # the site
```

That third command is the one worth running before believing anything about a deployment: it renders
the same 562 routes for an address that is not a domain root, and a document that names the domain
root instead of its own path is visible in the output with one `grep`. The live site is
<https://dhbhensdadia.github.io/Chemipedia/>.

And the four gates, from `workspace/tools/visual` after `npm install` (the first two were re-run with
`/atoms/` in their lists in Phase 14; the last two are Phase 15's to re-run, and `/atoms/` has to be
added to their lists before they are believed):

```bash
node audit-a11y.mjs         # 0 defects across 20 pages
node audit-responsive.mjs   # 80 of 80 fit
node audit-performance.mjs  # shift 0, load 38–41ms, no long task
node audit-lighthouse.mjs   # accessibility 100, best-practices 100, seo 100
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 11 for the evidence behind each number, and at
Phase 14 for the feature's.

The atom viewer's own audits run the same way, against a server on 4188:

```bash
node source/tools/build.js                 # the page is served from dist/
node source/tools/serve.js --port 4188     # in another shell (background it)
BASE=http://127.0.0.1:4188 node audit-atom.mjs        # 54 claims, the page itself
BASE=http://127.0.0.1:4188 node audit-atom-scene.mjs  # 33 claims, the style guide driving the scene
```
