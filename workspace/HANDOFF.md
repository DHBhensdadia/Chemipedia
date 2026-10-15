# HANDOFF.md — note to the next agent

**Written:** 2026-10-15 · **By:** the **Phase 16** session — the living paper built, bounded and
audited · **After commit:** the Phase 16 close-out commit on `feature/living-paper` (`main` is
unchanged at `0ba6b04`; `v1.1.0` stays on the release line)

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The site is live at `v1.1.0`** — <https://dhbhensdadia.github.io/Chemipedia/> — unchanged: nothing
was merged, pushed or deployed this session.

**On `feature/living-paper` (local only — not merged, not pushed), Phase 16 is `COMPLETE`:**

- `source/styles/tokens.css` §22 — the field's whole vocabulary: the blooms (hues as `--g-*`
  references, anchors, alphas cut under their own derived ceilings), the lattice at the table's own
  28 px pitch and 1.1 %, the grain at 1 % effective, the drift's timings and travel, the family map,
  and the narrow query's 0.88 wash.
- `source/styles/atmosphere.css` (260 lines) — the four sheets as fixed pseudo-elements on
  `html`/`body`; `html` carries no background so the canvas keeps propagating; the family fields key
  off `body[data-page]` (nine names, four default templates); two animations, both inside the
  no-preference gate; print strips all four.
- `source/tests/lib/backdrop.test.js` — **fourteen tests**, including the plan's overlap bound: every
  family × four reference viewports, the texture charged at its worst on every sample, floor
  **4.575 : 1**.
- `workspace/tools/visual/audit-atmosphere.mjs` — the field's own gate: **106 of 106 claims,
  exit 0**; worst real on-field text **4.79 : 1**; the kill switch moving 4–7 LSB; print bare; the
  no-script reading; three phone frames at 0 px; a lived-in drift window at **120 frames / 16.7 ms
  median / 0 long tasks / 0 shift**. It runs against the dev server on 4180.
- `source/styleguide/index.html` — **the living paper** section: a swatch per bloom and per family
  field, each the composite the tokens actually draw; the pages each family covers read off the
  atmosphere sheet; all **54** `--field-*` tokens listed with their computed values; a live
  reduced-motion line.
- The record: `docs/research/06` §8 (the vignette cut, the as-shipped numbers, the alias trap, the
  phone observation), the Phase 16 entry in `progress/PHASE_LOG.md`, and `RUN_STATE.md` ledger rows
  16.1–16.2.

Suite **695 pass, 0 fail**; build 563 routes; sweeps unchanged (accessibility 0 defects across 20
pages, responsive 80 of 80, performance worst shift 0); print re-measured at **1 sheet** on the four
Phase 10 pages, A4 and Letter.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Nothing is outstanding and nothing is half-written.** Phase 16 is closed; **Phase 17 — the
   motion and the depth — is the next work item** on the same approved programme
   (`docs/IMPLEMENTATION_PLAN.md` §3). Read its deliverables and exit criteria before starting.
3. **The delivery still waits.** Merging, pushing and tagging (`v1.2.0` at the end) each wait for the
   author (`docs/GIT_WORKFLOW.md` §8); the word given for the `v1.1.0` delivery does not carry over.
   Tags are never moved: `v1.1.0` on the release close-out, `v1.0.1` on `bd338dd`, `v1.0.0` on
   `e035c6f`.
4. Confirm the start line: `node --test source/tests` → **695 passing**;
   `node source/tools/build.js` → **563 routes, 0 waiting**; with the dev server up on 4180,
   `node workspace/tools/visual/audit-atmosphere.mjs` → **106 of 106 claims**.
5. Before believing anything about a deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this
   class of defect, which is why it reached production once.

## What is fragile or easy to get wrong

- **Never alias a family token at `:root`.** A `var()` inside a custom property is substituted where
  the property is **declared**, so `--field-bloom-1-hue: var(--field-family-hue)` on `:root` froze the
  default hue before any `body[data-page]` override could apply: every computed property read
  correct, every token test passed, every page wore the same green — and only the pixel audit caught
  it. The family pair is read on the sheet that paints it, and `tests/lib/backdrop.test.js` holds both
  halves. Do not weaken either.
- **The field's bound is not an opinion.** The caps in `docs/research/06` §6 were derived from
  `--ink-faint`'s shipped ratio; anything that raises those alphas spends contrast the site does not
  have. Derive and measure — never eyeball it, and never verify a moving field from one still frame.
  The audit's kill switch (zero the family pair; the anchor must move) exists so a pale family cannot
  pass vacuously on a page whose bloom never painted.
- **Motion is optional by construction.** The still composition is the page: reduced motion, print
  and no-script readers all get the same layers, held. Nothing may be hidden by CSS that only a
  script can reveal, and no animation may carry meaning.
- **The palette is closed.** Every field hue resolves to a `--g-*` token — a test holds that. Neon,
  gradient text, glass behind prose and any imported colour are on the rejected list in
  `docs/research/06` §5; the review is against that list, not only against the gates.
- **The phone's family bloom is a known, recorded composition question** (`docs/research/06` §8): at
  375 px the masthead's paper band covers the bloom's core, so the family's tint is not readable at
  phone width. Phase 17 decides whether the bloom should follow the masthead's height; it is not a
  defect to hotfix.
- **Print counts are measured by counting the page objects in the rendered PDF.** `mdls` does not
  index `$TMPDIR` on this machine; render with `page.pdf()` at A4 and Letter and count `/Type /Page`
  in the file (plain objects plus inflated streams).
- **A page family is only rendered if it is registered in `FAMILY_RENDERERS`** in
  `source/tools/build.js`; a missing entry renders the template with its placeholders still in it and
  no test catches it. Read the built document.
- **"Close to the reference" is a measurement, not an impression**, and a test that passes is not a
  page that works; when a function's argument has an interface, build the real one in the test.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the
  one recorded exception. Files stay under 400 lines: the over-ceiling list stands — now fifteen
  files, recorded in `RUN_STATE.md` and `progress/PHASE_LOG.md`, with a named seam for each. Do not
  add a file to that list; split or record instead.
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

**Nothing.** The tree is clean; `main` is unchanged and clean of this work; `feature/living-paper`
carries the finished Phase 16. The deferrals — the "expanded explanation" Phase 9 left out, the two
schema fields no acceptable source supplies (`covalentRadius`, `latticeParameters`), the typeface, and
the over-ceiling files — stand recorded rather than in flight.

`v1.0.0` stays on `e035c6f`, `v1.0.1` on `bd338dd`, `v1.1.0` on the release close-out; no tag was
moved.
