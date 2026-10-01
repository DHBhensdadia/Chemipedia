# HANDOFF.md — note to the next agent

**Written:** 2026-10-01 · **By:** foundation build session · **After commit:** `90abe82`

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

## The one thing that is not finished

**The screenshots.** The browser tool cannot composite frames in this session, so the 1280 / 768 /
375 px captures could not be taken. Three lines of the Phase 0 close-out checklist are therefore
unticked, work item 0.5 is `IN_PROGRESS`, and the phase is not marked complete. That is deliberate:
this project does not tick a visual check it cannot evidence.

Retry the capture before doing anything else. `preview_open` on `http://localhost:4173/`, then
`preview_screenshot`. If it works, tick the three lines, commit the corrected record, tag `v0.1.0`,
and close the phase. If it still does not, ask the author to confirm the rendition from the Preview
tab and close the phase on that confirmation, recording that it is what happened.

No styling exists yet, so nothing about this phase's appearance was ever being judged against the
reference. From Phase 1 that changes and the gate becomes mandatory.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. Resolve the open gate above.
3. Start **Phase 1** — design system and global shell: `styles/tokens.css` from the values in
   `docs/DESIGN_SYSTEM.md`, then `base.css`, the layout primitives, the header, submenu and footer,
   and the development-only style guide at `source/styleguide/`. The build must then link
   `tokens.css` and `app.js` from the document skeleton, which is the one edit to `tools/build.js`.

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
- **Screenshots.** Do not close a phase on geometry measurements once a designed surface exists.
  Measured layout is a substitute, not a replacement.
- **Attribution.** Repo-local git identity is `Devansh <dhbhensdadia@gmail.com>`. Do not change it,
  and never add an AI co-author or "generated with" trailer.
- **Shell quoting.** An apostrophe inside a commit message body breaks the heredoc-through-shell
  path. Write the message to a file and use `git commit -F -`, as the previous sessions did.
- **The light theme is deliberate.** Do not "fix" the missing dark mode. It is ADR-006.
- **The mind map.** Update it in the same commit as the file it describes, or it stops being usable.

## Anything deliberately left in a half state

Only the screenshot gate, described above. The working tree is clean and every other Phase 0 exit
criterion is met and evidenced in `progress/PHASE_LOG.md`.
