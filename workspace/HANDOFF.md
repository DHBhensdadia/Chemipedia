# HANDOFF.md — note to the next agent

**Written:** 2026-10-06 · **By:** the session that closed Phase 11 — quality, accessibility,
performance and delivery — and tagged `v1.0.0` · **After commit:** the Phase 11 close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The plan is delivered.** All twelve phases are `COMPLETE`, the working tree is clean, and the
release is tagged `v1.0.0`.

- `node --test source/tests` → **482 passing, 0 failing**, with nothing installed.
- `node source/tools/build.js` → **562 routes** plus the not-found page, **0 waiting**.
- Every page is rendered at build time; the browser only attaches behaviour to markup it finds.
- Every page carries a title, a description, a canonical link, Open Graph metadata and JSON-LD; the
  build writes a 562-`loc` `sitemap.xml` and a `robots.txt` naming it.
- Four gates, all exit 0: accessibility **0 defects over 19 pages**, responsive **76 of 76**, worst
  layout shift **0** with a 38ms slowest cold load, Lighthouse **100 / 100 / 100** for
  accessibility, best-practices and SEO (performance 89 mean, recorded not gated).
- `.github/workflows/pages.yml` is the whole deployment. **Nothing is live**: there is no git
  remote. Publishing is the author's one-time step (`docs/GIT_WORKFLOW.md` §8) and is the one thing
  the plan asks for that has not happened.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. There is no next phase. If you are here to work, ask the author what they want built, or pick up
   one of the three recorded deferrals at the end of `RUN_STATE.md`.
3. If the site should go live, the author's step is `git remote add origin <url>`, then
   `git push -u origin main && git push --tags`, then enable Pages with **Source: GitHub Actions**.
   Nothing else needs configuring — the site is static and the build has no dependencies.

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

Nothing is half-done in the tree. One thing is deliberately not done, and it is the author's:
**the site is not published.** The Pages workflow, the routing fallback and the README's publishing
steps are committed and the tag is local; the push needs a remote, which does not exist.

Three deferrals stand from earlier phases: the trade-off that left the "expanded explanation" out of
Phase 9, the two schema fields no acceptable source supplies (`covalentRadius`, `latticeParameters`),
and the typeface, which is not the reference's and is recorded as a Phase 1 deviation.
