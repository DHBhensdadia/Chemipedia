# HANDOFF.md — note to the next agent

**Written:** 2026-10-07 · **By:** the session that built the atom model and its live scene on
`feature/atom-3d` — Phase 13 of the feature, and the first picture of a real element · **After commit:**
`3cf6661` on `feature/atom-3d`

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The plan is delivered and the site is live** at <https://dhbhensdadia.github.io/Chemipedia/>, and
**a new feature is under way**: the atom viewer, as Phases 12–15 on the branch `feature/atom-3d` (cut
from `main` at `a22c0d2`). **Phases 12 and 13 — the renderer, and the atom model and its
scene — are complete and proved in a browser**; phases 14 and 15 (the page with its bar, then the
delivery) are not started. Nothing is merged or pushed.

- The renderer exists and draws: `source/scripts/components/atom-view.js` and the three modules under
  it, with its numbers recorded in `docs/research/05-atom-renderer-measurements.md` — 4 draw calls for
  43 particles and 3 orbits in its own Phase 12 reading, 8 for 382 particles and 7 rings in this
  phase's, at 0.10–0.30 ms of the scene's own work against a 16.70 ms vsync-bound frame.
- The atom itself exists and moves: `source/scripts/lib/point-sphere.js`, `source/scripts/lib/
  atom-model.js` and `source/scripts/components/atom-scene.js`, driven on `/styleguide/` by a picker over
  all 118 records with three free count fields, a speed, a shake and a reset. The heaviest atom the
  feature allows — 382 particles, 7 rings, 8 draw calls — costs **0.258 ms a frame** at 1280 × 800
  against a 16.70 ms cadence, and all 118 records draw as themselves. Both readings, and the run's full
  output, are in the same file.
- No page uses any of it yet: there is no `/atoms/` route, template, sheet or behaviour.
- `node --test source/tests` → **636 passing, 0 failing**, with nothing installed.
- `node source/tools/build.js` → **562 routes** plus the not-found page, **0 waiting**.
- Every page is rendered at build time; the browser only attaches behaviour to markup it finds.
- Every page carries a title, a description, a canonical link, Open Graph metadata and JSON-LD; the
  build writes a 562-`loc` `sitemap.xml` and a `robots.txt` naming it.
- Four gates, all exit 0: accessibility **0 defects over 19 pages**, responsive **76 of 76**, worst
  layout shift **0** with a slowest cold load of 38–41ms across runs, Lighthouse **100 / 100 / 100** for
  accessibility, best-practices and SEO (performance 89 mean, recorded not gated).
- The repository is `github.com/DHBhensdadia/Chemipedia`, `main` and the tags are pushed, and
  `.github/workflows/pages.yml` is the whole deployment: every push to `main` rebuilds, runs the
  suite and republishes. Pages is enabled with **Source: GitHub Actions**, set through the API
  (`POST /repos/:owner/:repo/pages` with `build_type=workflow`) rather than by hand.
- The live address is a **project site**, served from the path `/Chemipedia/`, which is the one
  thing about this deployment that a local run cannot show you. It broke once — every URL was
  rooted at the domain instead of at that path — and the fix is `bd338dd`.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **You are on `feature/atom-3d` unless someone has merged it.** Phases 12 and 13 are closed (see their
   entries in `progress/PHASE_LOG.md` and the numbers in `docs/research/05`). Start **Phase 14** in
   `docs/IMPLEMENTATION_PLAN.md` §3: the route `/atoms/` with `nav: { label: "Atoms", order: 2 }`, the
   page family with its `atomsPageValues` and `startAtoms` halves, its template and sheets, and the
   translucent bar pinned to the bottom centre with the element card, the three steppers, the speed and
   the legend. **The scene it drives is finished and measured** — do not rebuild it, drive it.
3. Anything about the feature that the plan does not settle is a decision for the author — the
   stage's look, the bar's contents and the page's copy were all asked about once already and are
   recorded; do not re-open them silently.
4. Before believing anything about the deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this
   class of defect, which is why it reached production once.

## What is fragile or easy to get wrong

- **A page that can only be computed in the browser is blank to a crawler and to a reader with the
  script off.** This was the home page until Phase 11 and it cost a 0.315 layout shift. Every family
  now computes its markup through a `*Values` function the build calls, and a `start*` function that
  only attaches. Keep it that way: add to `FAMILY_RENDERERS`, never to a script.
- **Accessibility outranks fidelity to the reference's own values.** Its tertiary ink is 3.06:1 on
  our paper and its isolation dims text to 1.5:1. Both are deliberately changed, both are recorded in
  `DESIGN_SYSTEM.md`, and a test holds the fading tokens above a ceiling derived from the eleven
  group fills. Do not "restore" a value to match the reference without re-running `audit-a11y.mjs`.
- **`audit-a11y.mjs` composites an element's own `opacity` before it checks contrast.** It did not,
  once, and that is exactly why it missed the faded tile ink that Lighthouse then caught. If you
  change how a colour is applied, check the sweep still models it.
- **The atom viewer adds the project's only WebGL, and it is written by hand (ADR-004).** Almost all
  of it is arithmetic under `source/scripts/lib/` — matrices, the camera, the sphere's buffers, the
  frame loop, the point distribution and the atom model — and that is deliberate: those
  modules are testable in Node and are where the feature's tests live. Only the drawing calls need a
  browser, and they are proved on `/styleguide/` before `/atoms/` exists.
- **A draw call that succeeds can paint nothing, and a transcript cannot see it.** This happened here:
  the particle draw used a vertex array that carried the per-particle buffers and not the sphere's own
  `aPosition`/`aNormal`, so every sphere collapsed to a point at its centre while the call was issued
  exactly as designed. Every unit test passed. What caught it was reading the drawing buffer in a
  browser and classifying its pixels against the token colours (`tools/visual/atom-pixels.mjs`).
  **When you add to the scene, ask what the pixels say, not what the calls say** — and keep the
  regression test that now holds each draw to one vertex array carrying everything it reads.
- **The scene owns the clock, not the model.** An electron's place is its ring's phase plus that ring's
  angular speed times a time the **scene** accumulates, so a speed change scales an accumulation and
  nothing jumps to a different moment. Keep it that way: a model that knew what time it is could not be
  drawn at two speeds.
- **A reader's zero is not an error.** All three counts can reach zero in the controls, and the extreme
  found a real defect: `buildAtom` with no protons and no neutrons asked `pointSphere` for a cluster of
  radius zero and threw, so a reader's own zero would have been an error on a page. An empty atom is now
  an empty set of points and the scene draws a stage with nothing on it — no instanced call, no ring. No
  unit test had ever asked for nothing, which is the lesson: **run a new control at its ends.**
- **The readout describes drawn frames only.** Changing the atom does not report, because the new atom's
  particle and ring counts beside the previous frame's draw-call count is a number that was never true.
  The renderer audit's `calls = orbits + 1` claim caught exactly that, one frame wide.
- **The scene's palette comes from `tokens.css` at runtime.** The renderer reads its colours through
  `getComputedStyle` rather than carrying hex literals, because the one law that has held since
  Phase 1 is that a literal design value exists in exactly one file. A dark stage inside a paper-light
  page is a palette decision under ADR-006, not a second theme: the shell, the band and the footer
  stay light.
- **The page is content first, and the canvas is an enhancement.** The element card, the counts, the
  page's prose and the element's shell diagram — the component the element pages already use — are
  written at build time; the WebGL canvas replaces the diagram only after it has a context and a first
  frame. A reader with no WebGL, no script, or `prefers-reduced-motion: reduce` must see a finished
  page, and that path was verified rather than assumed.
- **The second reference is not the first one.** Its periodic-table and statistics pages are out of
  scope by the author's instruction, and its palette, copy, dataset and assets are measurements in
  `docs/research/04` and never shipped. `source/` names neither reference.
- **Every URL belongs to one of two sides, and only one of them is rewritten.** The build rewrites the
  paths it writes into a finished document (`rootedAt`, from the origin's own path), which reaches
  markup and nothing else. A URL the *browser* writes after load, and a URL a *data fetch* asks for,
  cannot be reached that way and must go through `scripts/lib/site-path.js`, which reads the site's
  path off its own module's address. Adding a runtime link anywhere else will reintroduce exactly the
  defect this session fixed: correct locally, 404 in production.
- **The origin is configuration.** `SITE_ORIGIN` defaults to a reserved `.example` address that
  cannot resolve, and the build says so on every run. A confident, wrong canonical is worse than
  none — never hard-code one.
- **`sitemap.xml` is written from the routes the build actually wrote**, not from the manifest,
  which declares pages whose templates may not exist. A sitemap that lists a page the site does not
  serve is a sitemap that lies.
- **The not-found document claims no canonical** and is in neither crawl file. It declares the
  favicon like every other document, because a page that declares none makes the browser request one
  and fail — which is the reference's own defect, still live.
- **A family whose template is not named after its sheet has to ask for the sheet by name.** The
  build appends `styles/pages/<template>.css`, so `contact` declares `styles/pages/about.css`.
  Declaring it twice links it twice — this bug has been found in the built HTML once already.
- **A page's behaviour is a name, not a script.** A page earns an entry in `app.js`'s
  `PAGE_BEHAVIOUR` or it runs nothing after a swap, and an attachment must tolerate being made twice.
- **The router's swap has four rules that are easy to break.** Incoming scripts are refused, the
  running ones are carried across, the arriving body's `data-page` must be copied onto the live body
  before `startPage` is called, and a failure must be handed back to the browser rather than
  half-swapped. `tests/router/router.test.js` holds all four.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the
  one recorded exception. Files stay under 400 lines: the build's own split into `tools/document.js`
  is what that law forced in this phase.
- **The preview is unreliable in two different ways.** It may not composite, so no screenshot can be
  taken; and its window has no operating-system focus, so `focus`, `blur` and real key events are
  never delivered. Use the Playwright pages in `workspace/tools/visual`.
- **The harness compares *boxes*, not tastes.** A crop that matches in size with a few per cent of
  differing pixels is a typeface or copy difference — read `fontFamily` and the measured text before
  changing any CSS. The 1280px home capture's 2.31% is that class, and its grid matches the
  reference's to a hundredth of a pixel.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears anywhere
  under `source/`, comments included. Call it "the reference".
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Write commit messages with `git commit -F -` and a heredoc, and stage by
  explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.** The map
  now also covers `.github/`, which is repository configuration rather than a third place.
- **The guides drifted once and were corrected in the final phase.** `guides/04` still had
  `(pending)` rows from Phases 2–6 and `guides/02` named files that were never created. They now
  describe what ships, they name real exports, and they are worth re-reading before you trust any
  prose about this codebase — including this file. If you change a page family's rendering or its
  exports, grep the guides for the old name in the same commit.

## Anything deliberately left in a half state

Nothing is half-done in the tree, and the site is published. `v1.0.0` stays on `e035c6f` — the
release whose publication exposed the subpath defect — and `v1.0.1` is on `bd338dd`, which fixes it;
neither tag was moved, because a pushed tag is a statement the history has already made.

The atom viewer is built from the record to the drawn frame and nothing above it: on `feature/atom-3d`,
the plan, the reference audit and Phases 12 and 13 are committed — the whole drawing layer, the point
distribution, the model, the scene, their tests, the style-guide demonstration and the recorded
measurements — and **no page uses any of it**. Phases 14 and 15 remain: the page with its bottom bar
and its navigation entry, then the sweeps, the documentation and the delivery. The feature closes with a merge to `main` (`--no-ff`), a green
Pages run, the live page checked in a browser, and `v1.1.0` — none of which has happened.

Two things are deliberately left, and both are recorded rather than forgotten: the Pages runs print
Node 20 deprecation notices for five actions that GitHub is already forcing onto Node 24 (cosmetic,
and a one-line bump per action when someone is not mid-deployment-fix), and the three deferrals from
earlier phases — the "expanded explanation" Phase 9 left out, the two schema fields no acceptable
source supplies (`covalentRadius`, `latticeParameters`), and the typeface, which is not the
reference's and is recorded as a Phase 1 deviation.
