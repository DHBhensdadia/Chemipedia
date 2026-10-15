# HANDOFF.md — note to the next agent

**Written:** 2026-10-16 · **By:** the **Phase 18** session — the programme closed, delivered and
tagged · **After commit:** the Phase 18 close-out commit on `main` (`v1.2.0`; the branch merged
`--no-ff` as `ba3e783`)

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The site is live at `v1.2.0`** — <https://dhbhensdadia.github.io/Chemipedia/> — and this session
published it: the living paper (Phases 16–18) merged, pushed, deployed, and the live field verified
**in a browser** rather than by `curl` (the four sheets drawn, both drifts running, reduced motion
still at zero animations, **0 console errors, 0 failed requests, no response over 400** — 11 of 11
live checks; captures in `workspace/screenshots/live-v1.2.0-*`, local only).

- `source/styles/atmosphere.css` (273 lines) + `tokens.css` §22 — the field: four fixed
  pseudo-elements on `html`/`body` at `z-index: -1` — the wash with the page family's own bloom, the
  atom stage's lattice at paper strength, grain; two sheets drift inside the no-preference gate;
  print strips all four.
- `source/styles/motion.css` (69) + `tokens.css` §23 — the rise (movement only —
  **no opacity is animated anywhere**) and the cross-fade's 0.3 s.
- `source/scripts/components/pointer-light.js` (224) — the white light: fine pointers only, absent
  under reduce, off the shared frame loop the moment it arrives.
- `source/scripts/components/masthead-frost.js` (109) — the class fallback where scroll timelines
  are absent; where they run, `site-header.css` frosts the band itself.
- `source/scripts/router/router.js` — `commit(next, top)` / `mayFade()`; history moves never fade.
- The gates: `audit-atmosphere.mjs` **106 of 106**, `audit-motion.mjs` **62 of 62**; the four
  site-wide sweeps green (**a11y 0 defects / 29 informational across 20 pages, responsive 80 of 80,
  performance worst shift 0** — slowest cold loads 107 ms and 102 ms across the two closing runs,
  Lighthouse **a11y 100 / best-practices 100 on all eight pages**, SEO 100, performance recorded at
  a mean of 89); suite **732 pass, 0 fail**; print **8 sheets × 1**.
- The record: the **Phase 18** entry in `progress/PHASE_LOG.md` (the six gate runs, the
  documentation, the delivery and the live checks), `docs/research/06` §9–10, `docs/ARCHITECTURE.md`
  ADR-008's closing block, `RUN_STATE.md` ledger 18.1–18.3.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Nothing is outstanding and nothing is half-written.** Phases 0–18 are `COMPLETE`; the plan has
   no next phase. If a review returns a finding, it opens a new phase in
   `docs/IMPLEMENTATION_PLAN.md` §3 first — scope lives in the plan.
3. Confirm the start line: `node --test source/tests` → **732 passing**;
   `node source/tools/build.js` → **563 routes, 0 waiting**; with the dev server up on 4180,
   `node workspace/tools/visual/audit-motion.mjs` → **62 of 62 claims** and
   `node workspace/tools/visual/audit-atmosphere.mjs` → **106 of 106 claims**.
4. **Publishing is still the author's step** (`docs/GIT_WORKFLOW.md` §8): merges, pushes and tags
   happen on the word, not on readiness. Tags are never moved: `v1.2.0` on the Phase 18 close-out
   commit, `v1.1.0` on the release close-out, `v1.0.1` on `bd338dd`, `v1.0.0` on `e035c6f`.
5. Before believing anything about a deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this
   class of defect, which is why it reached production once.

## What is fragile or easy to get wrong

- **The reveal moves and never fades.** Keep it that way: an entrance that spends opacity draws text
  below the contrast every token promises for a stretch of the scroll, and the Lighthouse gate failed
  five pages for the first version. `tests/lib/motion.test.js` fails if opacity appears in the
  keyframes, and `audit-motion.mjs` holds a mid-rise section moved and fully opaque.
- **A contrast sweep must composite ancestors.** `audit-a11y.mjs` multiplies every ancestor's opacity
  into the text's alpha the way a browser composites it — that blind spot passed the pages Lighthouse
  failed. Do not weaken it.
- **Never alias a family token at `:root`.** A `var()` inside a custom property is substituted where
  the property is **declared**, so an alias froze the default hue before any `body[data-page]`
  override could apply: every computed property read correct and every page wore the same green.
  Only the pixel audit caught it. The family pair is read on the sheet that paints it.
- **The field's bound is not an opinion, and motion is optional by construction.** The caps in
  `docs/research/06` §6 were derived from `--ink-faint`'s shipped ratio; anything that raises them
  spends contrast the site does not have. The still composition is the page: reduced motion, print
  and no-script readers all get the same layers, held, and no animation may carry meaning — or spend
  a contrast the tokens never promised.
- **The palette is closed.** Every field hue resolves to a `--g-*` token — a test holds that. Neon,
  gradient text, glass behind prose and any imported colour are on the rejected list in
  `docs/research/06` §5.
- **The phone's family bloom is a known, recorded composition question** (`docs/research/06` §8): at
  375 px the masthead's paper band covers the bloom's core, so the family's tint is not readable at
  phone width. The delivery left the composition as it stands; it is not a defect to hotfix.
- **Print counts are measured by counting the page objects in the rendered PDF.** `mdls` does not
  index `$TMPDIR` on this machine; render with `page.pdf()` at A4 and Letter and count `/Type /Page`
  in the file (plain objects plus inflated streams).
- **A page family is only rendered if it is registered in `FAMILY_RENDERERS`** in
  `source/tools/build.js`; a missing entry renders the template with its placeholders still in it and
  no test catches it. Read the built document.
- **"Close to the reference" is a measurement, not an impression**, and a test that passes is not a
  page that works; when a function's argument has an interface, build the real one in the test.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the
  one recorded exception. Files stay under 400 lines: the over-ceiling list stands — **sixteen
  files** (twelve under `source/`, four in `workspace/tools/visual/`), recorded in `RUN_STATE.md` and
  `progress/PHASE_LOG.md`, with a named seam for each. Do not add a file to that list; split or
  record instead.
- **`source/tests/brand/brand.test.js` fails the suite** if **either** reference's name appears
  anywhere under `source/`, comments included. The audit's new subjects are the same class of thing:
  their names live in `workspace/` only, and nothing of theirs ships.
- **The preview is unreliable in two ways**: it may not composite, so no screenshot can be taken, and
  its window has no operating-system focus, so real key events are never delivered. Use
  `workspace/tools/visual`, and remember the dev server serves `dist/` — re-run
  `node source/tools/build.js` after any source change or the page you are looking at is the old one.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Commit with `git commit -F -` and a heredoc, and stage by explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.**

## Anything deliberately left in a half state

**Nothing.** The tree is clean; `main` carries the whole programme; `feature/living-paper` was
merged `--no-ff` as `ba3e783` and deleted after the tag. The deferrals — the "expanded explanation"
Phase 9 left out, the two schema fields no acceptable source supplies (`covalentRadius`,
`latticeParameters`), the typeface, and the over-ceiling files — stand recorded rather than in
flight.

`v1.0.0` stays on `e035c6f`, `v1.0.1` on `bd338dd`, `v1.1.0` on the release close-out, and
**`v1.2.0` on the Phase 18 close-out commit**; no tag was moved.
