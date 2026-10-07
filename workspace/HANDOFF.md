# HANDOFF.md — note to the next agent

**Written:** 2026-10-07 · **By:** the session that answered the author's review of the built atom page —
a second, closer reading of the reference's own scene graph, and the geometry and light that came out of
it, the defect the author found by using the site, the field they then asked for, and **the delivery
itself** · **After commit:** the release close-out, tagged `v1.1.0` (`ad58ee2` is the merge, `cd18435`
the atom and its stage, `c3ff53a` the head a swap used to leave behind)

Rewrite this file at the end of every session. It must never be older than the last commit. The two
sections below were rewritten after the author's second review — the navigation defect and the stage's
grid — and both are committed.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The site is live at `v1.1.0`** — <https://dhbhensdadia.github.io/Chemipedia/> — and the atom viewer
is published in it: merged, pushed, deployed, verified in a browser and tagged. `feature/atom-3d` is
deleted; `main` is the released line.

- `/atoms/` draws any element's atom in three dimensions: a nucleus, electrons on their shells, a
  camera a reader can swing, and a translucent bar pinned to the bottom of the stage driving it. It is
  hand-written WebGL2 (ADR-007), it adds no dependency and no data, and a reader without it gets the
  element's own shell diagram rather than a blank stage. Every element page links into it at
  `/atoms/#<slug>`.
- **All four gates pass with the new page included**: accessibility 0 defects / 29 informational lines
  across **20** pages; responsive **80 of 80**; performance **worst layout shift 0, slowest cold load
  35–40 ms, 0 long tasks** across seven pages (two runs, the second on the final build); Lighthouse
  **100 / 100 / 100** for accessibility, best-practices  and SEO with performance **78** recorded and not gated.
- **A client-side navigation no longer arrives unstyled.** It did until this session: the router swapped
  the body and left the head, so a page reached by a click wore the page it came from's stylesheets —
  the defect the author reported as "it looks like only HTML until I refresh". `router/page-head.js`
  now puts the arriving page's sheets in place and waits for them before the swap, carries a shared
  sheet across as the element it already is rather than re-fetching it, and takes the same canonical
  link and metadata. Verified in a browser: identical sheets, identical computed styles on every
  element, and identical screenshots on three of four navigations (the fourth is the atom turning).
- **The stage has the reference's grid**, drawn by the scene rather than by a stylesheet: 28 CSS pixels
  between lines, every fourth one stronger, the field a shade darker towards the corners. Five tokens,
  and `audit-atom.mjs` still holds all 57 of its claims with the frame at 16.70 ms and 0 long tasks.
- **The page keeps the browser's cadence on its heaviest atom**: median **16.70 ms** a frame with
  oganesson turning, the same as the same page held still, worst frame 16.80 ms over ninety, no long
  task. `audit-atom.mjs` asks **57** claims and they all hold with 0 console messages and 0 failed
  requests; the scene and renderer audits ask 33 and 25.
- **The page is now a measured copy of the reference's proportions rather than an impression of them.**
  The author's review named three things — nucleons too far apart, a nucleus too large, a scene that read
  as *electrons wandering around* — and all three turned out to be the same mistake: the first reading
  had taken the reference's palette and counts and skipped its geometry. The cluster is packed at the
  reference's own `0.9 ∛N` nucleon radii (iron's nucleons went from 1.27 diameters apart to 0.76), each
  shell lies in a plane of its own, the rings stand off the nucleus by its own share, the camera came in
  from 17 to 13.1, and the light is a sky over a ground with a roughness and a metalness. The nucleus
  went from 0.36 of the atom around it to **0.20**, against the reference's **0.211** — measured in a
  browser, both pages, `docs/research/04` §6.
- `node --test source/tests` → **681 passing, 0 failing**, with nothing installed (673 at the atom
  commit alone, 681 once the swap's eight head tests land).
- `node source/tools/build.js` → **563 routes** plus the not-found page, **0 waiting**.
- The documentation is closed out: **ADR-007**, `DESIGN_SYSTEM` §1.7 and §7, `BRAND_GUIDELINES` §9,
  `DATA_SOURCES` §7, all four guides, the README, the measurements file, the phase log and
  `RUN_STATE.md`. The second reference's name is now **enforced** by the brand scan rather than
  checked by hand.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Nothing is outstanding on the plan.** The feature's four phases are `COMPLETE`, the site is
   published at `v1.1.0`, the Pages run was green and the live page was verified in a browser. The
   next work item is whatever the author asks for; the known remainder is the standing deferrals and
   the over-ceiling files below.
3. **A later delivery still waits for the author's word** (`docs/GIT_WORKFLOW.md` §8), and an existing
   tag is never moved: `v1.1.0` is on the close-out commit, `v1.0.1` on `bd338dd`, `v1.0.0` on
   `e035c6f`.
4. Before believing anything about a deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this class
   of defect, which is why it reached production once.

## What is fragile or easy to get wrong

- **"Close to the reference" is a measurement, not an impression.** The viewer shipped looking nothing
  like it and every gate passed, because no gate asked a question the geometry could fail: the packing,
  the ring spread and the planes were literal numbers nobody had compared. They are compared now — as
  the distance from each nucleon to its nearest neighbour, as the nucleus' width against the atom's, and
  as tokens whose comments say which of the reference's numbers they are. **A look is a set of numbers;
  find them in the reference's own bundle rather than reproducing it by eye.**
- **A test that passes is not a page that works.** The feature was taught this three times, and it
  wrote the third one down: a function written to take a list of records was handed the elements
  **repository**, so the page threw and the canvas never appeared — while the unit test passed, because
  it was handed the same wrong thing. The test now builds a real repository off disk. **When a
  function's argument has an interface, build the real one in the test.**
- **A passing build is not a rendered page.** A page family is only rendered if it is registered in
  `FAMILY_RENDERERS` in `source/tools/build.js`; a missing entry renders the template with its
  placeholders still in it and **no test catches it**. Read the built document.
- **A colour is only as readable as what it is painted on.** The bar's symbol link measured 1.47:1 on
  first run because a link's colour is the site's ink and the stage is dark. Anything added to a dark
  surface must name its own colour, and `audit-a11y.mjs` is what tells you.
- **The 3D cannot be verified in Node.** The arithmetic is pure and tested there; the drawing is not,
  and a draw call that succeeds can paint nothing — which is exactly what happened. **Ask what the
  pixels say, not what the calls say**, and run the feature's three browser audits after any change to
  the layer.
- **A page that can only be computed in the browser is blank to a crawler and to a reader with the
  script off.** Every family computes its markup through a `*Values` function the build calls, and a
  `start*` function that only attaches.
- **The scene owns the clock, not the model**, and the renderer's palette comes from `tokens.css` §21
  at runtime, because a graphics card cannot read a stylesheet. No design value exists outside that
  file.
- **Every URL belongs to one of two sides, and only one of them is rewritten.** The build rewrites the
  paths it writes into a finished document; a URL the *browser* writes after load, or a data fetch
  asks for, must go through `scripts/lib/site-path.js`.
- **A fragment is not part of a route.** `/atoms/#iron` is one page with an element named in it; the
  page reads it itself, through `elementFromFragment(hash, repository)` — which takes the repository,
  not a list.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the one
  recorded exception. Files stay under 400 lines, and fourteen of them do not: **eleven under `source/`**
  (`styles/tokens.css` 824, `styles/pages/element-detail.css` 520, `tests/lib/atom-model.test.js` 518,
  `tests/router/router.test.js` 484, `tests/pages/glossary.test.js` 473,
  `styles/components/periodic-table.css` 457, `tests/components/periodic-table.test.js` 444,
  `scripts/components/atom-view.js` 441, `scripts/lib/matrix4.js` 421,
  `tests/components/atom-view.test.js` 412, `scripts/components/periodic-table.js` 418) and three
  workspace tools that no page ships (`audit-atom.mjs` 596, `compare.mjs` 505, `audit-atom-scene.mjs`
  424). They are recorded in `progress/PHASE_LOG.md` rather than fixed, with a named seam for each.
  **Do not add a file to that list; split or record instead.**
- **`source/tests/brand/brand.test.js` fails the suite** if **either** reference's name appears
  anywhere under `source/`, comments included — the first reference's and the atom viewer's own. Call
  them "the reference" and "the second reference".
- **The preview is unreliable in two ways**: it may not composite, so no screenshot can be taken, and
  its window has no operating-system focus, so real key events are never delivered. Use
  `workspace/tools/visual`, and remember the dev server serves `dist/` — re-run
  `node source/tools/build.js` after any source change or the page you are looking at is the old one.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Commit with `git commit -F -` and a heredoc, and stage by explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.** The last
  completeness check found **216** files under `source/`, 0 unlisted —
  `scripts/router/page-head.js`, `scripts/components/atom-field.js` and their tests are the newest
  entries.

## Anything deliberately left in a half state

**Nothing is half done.** The tree is clean, the branch is merged into `main` and deleted, the site is
published at `v1.1.0`, and the working tree holds no uncommitted change. The deferrals and the
over-ceiling files below are recorded rather than in flight.

`v1.0.0` stays on `e035c6f` — the release whose publication exposed the subpath defect — and `v1.0.1`
is on `bd338dd`, which fixes it; neither tag was moved.

Three deferrals from earlier phases stand, plus the over-ceiling files: the "expanded explanation"
Phase 9 left out, the two schema fields no acceptable source supplies (`covalentRadius`,
`latticeParameters`), the typeface, which is not the reference's, and fourteen files over the 400-line
ceiling — all recorded where they belong rather than forgotten.
