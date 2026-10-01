# HANDOFF.md — note to the next agent

**Written:** 2026-10-01 · **By:** foundation build session · **After commit:** `112ebfe` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The site builds and serves. `source/` holds a working pipeline and nothing decorative:

- `scripts/router/routes.js` — the route manifest. Every published URL is declared here; the build
  renders this list and nothing else.
- `tools/build.js` — renders each declared route into `dist/`, wrapping the authored fragment in one
  shared document skeleton, and copies the browser-facing directories across.
- `tools/site-paths.js` — the one place that knows which file a URL owns. The build and the server
  both use it, so they cannot disagree.
- `tools/serve.js` — a plain-Node development server that behaves like a static host: directory-style
  URLs, a redirect to the canonical form, the built not-found document for a miss, and a build on
  start when `dist/` is missing.
- `pages/home.html` — a foundation placeholder, deliberately unstyled. The design system comes next.
- `pages/404.html`, `assets/brand/favicon.svg`.
- `tests/` — 22 tests, all passing, on Node's built-in runner with nothing to install.

Commands: `node source/tools/serve.js` (add `--rebuild`), `node source/tools/build.js`,
`node --test source/tests`. `dist/` is generated and ignored by git.

## Phase 0 is closed

Tagged `v0.1.0`. Every line of the close-out checklist is ticked and the evidence is in
`progress/PHASE_LOG.md`: 22 tests passing, every module parsing, brand and attribution scans clean,
the development server's responses for a page, an icon, a miss, a non-canonical URL, a non-GET
method and two traversal attempts, and screenshots at 1280 / 768 / 375 px taken and looked at.

**Capture needs one step first.** A preview that is not filling the panel produces no frames and
the capture fails. Resize the preview so that it fills the panel, then set the width you want.
This cost real time this session and is now step zero of the visual recipe in
`docs/TESTING_STRATEGY.md` §4. A failed capture is a failed check, never a passed one.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. Start **Phase 1** — design system and global shell: `styles/tokens.css` from the values in
   `docs/DESIGN_SYSTEM.md`, then `base.css`, the layout primitives, the header, submenu and footer,
   and the development-only style guide at `source/styleguide/`. The build must then link
   `tokens.css` and `app.js` from the document skeleton, which is the one edit to `tools/build.js`.
3. Fix the measure first. The 1280 px screenshot shows body text running the full viewport width,
   about 160 characters a line, because no stylesheet exists yet. The shell and the measure are what
   make the page read as designed rather than unstyled, and they belong at the top of the phase.

## What is fragile or easy to get wrong

- **Branding.** Very easy to leak the reference brand into a `<title>`, an alt attribute, a CSS
  comment or a JSON field. Run the scan in `WORKING_AGREEMENT.md` §4 before every milestone commit.
- **Scope.** The learning and games sections are *deleted features*, not unfinished ones. Do not
  stub them, link to them, or leave a footer column looking short.
- **The route manifest.** A URL exists only if it is declared there. Adding a page means adding a
  manifest entry; the tests will fail if the entry names a template that is not on disk.
- **Templates are fragments.** `source/pages/*.html` carry no `<head>`, no `<body>` and no doctype —
  the build owns all of that. There is no `source/index.html`; the home template is
  `source/pages/home.html`.
- **Screenshots.** Capture before you claim. Measured layout is a substitute, not a replacement, and
  a phase is not closed on geometry evidence once a designed surface exists.
- **Attribution.** Repo-local git identity is `Devansh <dhbhensdadia@gmail.com>`. Do not change it,
  and never add an AI co-author or "generated with" trailer.
- **Shell quoting.** An apostrophe inside a commit message body breaks the heredoc-through-shell
  path. Write the message to a file and use `git commit -F -`, as the previous sessions did.
- **The light theme is deliberate.** Do not "fix" the missing dark mode. It is ADR-006.
- **The mind map.** Update it in the same commit as the file it describes, or it stops being usable.

## Anything deliberately left in a half state

Nothing. The working tree is clean, Phase 0 is closed and tagged, and the next session starts from a
standstill rather than from a repair.
