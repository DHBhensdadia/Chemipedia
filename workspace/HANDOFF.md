# HANDOFF.md — note to the next agent

**Written:** 2026-10-01 · **By:** design system and shell session · **After commit:** `cc2151f` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The site has a visual language and a shell. `node source/tools/serve.js`, then look at it.

- `styles/tokens.css` — **every** design value in the project. No colour lives anywhere else.
- `styles/base.css`, `styles/layout.css` — element defaults, and the primitives a page is assembled
  from: the content column, the vertical rhythm, the dotted rule.
- `scripts/lib/contrast.js` — the rule that picks the foreground for a group fill, with a test that
  walks every group colour the stylesheet declares.
- `scripts/lib/html.js` — escaping, so nothing reaches markup unescaped.
- `router/routes.js` — the site's **whole static inventory**, with the title, description and
  navigation placement of each. The build renders the ones whose template exists and reports the
  rest.
- `router/navigation.js` — the navigation, the three contextual submenus and the footer's five
  columns. A test proves every path it names is a declared route.
- `components/` — wordmark, search field, masthead, submenu band, footer, as string builders, so the
  chrome is in the HTML before any script runs.
- `styleguide/index.html` — every token and the shell on one screen. Development only; served from
  the source tree at `/styleguide/`, never built, never deployed.
- 51 tests, all passing, still with nothing to install.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. Start **Phase 2 — the data layer**. Check the licence of the dataset you choose and record it in
   `docs/DATA_SOURCES.md` before writing the transform, not after.
3. Note that the shell's links point at pages that do not exist yet. That is deliberate: the
   manifest declares the whole inventory so nothing needs editing as phases land. The build reports
   how many routes are waiting on templates — keep that number falling.

## What is fragile or easy to get wrong

- **Branding.** Watch the edges of what you copy. This session's near miss was a footer sentence
  that echoed the reference's own footer almost exactly; it was caught by reading their page
  side by side with ours, not by the scan, because the scan only knows the forbidden strings.
- **No literal values.** A colour, size, radius, duration or easing goes in `tokens.css`. The
  breakpoints are the one exception, because a media query cannot read a custom property; they are
  written down there and echoed in the queries.
- **Headings are regular weight.** The design sets its biggest type at weight 400 with -0.02em of
  tracking. Bold headings are a regression, and they were the one real mismatch this phase found.
- **Components are string builders.** They are handed their links and must not look anything up;
  that is what keeps them reusable and what keeps the router out of the chrome.
- **The route manifest is the single source of truth for URLs.** Adding a page means adding an
  entry, not a link.
- **The style guide is development-only.** It must never enter `dist/`, the sitemap or `robots.txt`.
- **Capture needs one step.** Resize the preview so it fills the panel before screenshotting, or the
  tool reports that the webview is not being composited and nothing can be captured. It cost time
  once; it is written into `docs/TESTING_STRATEGY.md` §4.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** An apostrophe in a commit message body breaks the heredoc path. Write the
  message to a file and use `git commit -F -`, as this session did.
- **The light theme is deliberate.** It is ADR-006, verified under a dark preference.

## Anything deliberately left in a half state

Nothing is half-done. Two things are deferred on purpose and recorded in the phase log:
`legend-chips` waits for the element data its counts come from, and `scripts/app.js` waits for a
phase with behaviour to install. Neither exists as a stub, because a stub is what the working
agreement forbids.
