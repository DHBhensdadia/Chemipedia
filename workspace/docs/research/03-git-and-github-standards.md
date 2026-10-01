# Research 03 — Git and GitHub standards

**Question:** what does a professional, single-developer Git history look like — and specifically,
what makes a history look *machine-generated* so we can avoid it?

**Date:** 2026-10-01
**Feeds:** `docs/GIT_WORKFLOW.md` (the operational rules) and every commit in the project.

---

## 1. The consensus on commit messages

The guidance from the widely cited sources is remarkably consistent, and it is essentially the
rules Chris Beams codified as "the seven rules of a great Git commit message":

1. Separate the subject from the body with a blank line.
2. Limit the subject line to 50 characters (tolerated to 72 as a hard ceiling — this is why Git's
   own tooling wraps at 72).
3. Capitalise the subject line.
4. Do not end the subject line with a period.
5. Use the **imperative mood** in the subject line — "Add", not "Added" or "Adds".
6. Wrap the body at 72 characters.
7. Use the body to explain **what and why**, not how.

The imperative-mood rule has a useful test attached to it: **a commit subject should complete the
sentence "If applied, this commit will ___."** "If applied, this commit will *build the periodic
table grid*" reads correctly; "will *built the grid*" does not. Apply this test to every subject
line before committing.

Sources converge on this from multiple directions: Medium and TheServerSide both state the 50/72
limits and the no-trailing-period rule; Thoughtbot emphasises explaining intent; the GitKraken
guide frames the body as the place for the reasoning.

## 2. Conventional Commits — and why we are not using it here

Conventional Commits (`feat:`, `fix:`, `chore(scope):`) is a documented, widely adopted
specification. Its value is machine-parseability: automated changelogs, semantic-version bumps,
tooling integration.

Its cost, in this specific project, is detectability. A `feat(periodic-table): add group isolation`
line is not merely machine-parseable, it is the single most recognisable signature of an
AI-generated or ticket-driven history. Several sources note it is best understood as "annotation on
top of the message" — the message itself still has to be good. Where the annotation adds no tooling
value, it only adds a fingerprint.

**Decision (ADR-003, proposed): plain imperative prose.** All the substance of the seven rules,
none of the prefix. The changelog need is already served by `progress/PHASE_LOG.md`.

**The one place prefixes earn their keep** is the commit *body*, where a short scoped paragraph is
natural English: "The table now renders from the repository rather than from a hard-coded list, so
the four colour modes share one code path." That is a real sentence, not a label.

## 3. What makes a history look AI-generated

Collected from the sources above plus general practice — this is the check-list we audit against:

| Tell | Why it reads as generated | Our rule |
|---|---|---|
| `feat:` / `chore:` / `refactor(scope):` prefixes on every line | Uniform annotation with no human variance | No type prefixes |
| `Co-Authored-By: <agent>` trailers | Direct attribution | **Never** — hard rule |
| `🤖 Generated with …` footers | Direct attribution | **Never** — hard rule |
| `Add phase 3`, `Implement phase 3 of plan` | Describes the *process*, not the *software* | Describe what the code now does |
| "Update files", "Fix bug", "Improve code", "Various changes" | No information; a human who cared would say what | Name the specific thing changed |
| One enormous commit per working session | A human commits as understanding firms up | Several coherent commits per phase |
| Identical message structure on all commits, including line length | No human variance at all | Vary naturally; let short commits be short |
| Committing generated output, lockfiles and build artefacts indiscriminately | Suggests a pipeline, not a person | Commit authored source; ignore build output |
| A pristine, straight-line history with no work-in-progress | Real work has visible iterations | Let the history show genuine refinement |

## 4. Branching and history shape

For a single-developer project the sensible, professional pattern is:

- `main` is always working. Nothing broken lands on it.
- Short-lived branches for substantial units: `feature/periodic-table-engine`,
  `feature/glossary`, `fix/#12-mobile-table-overflow`, `docs/working-agreement`.
- Merge with `--no-ff` so the phase remains visible as a group in `git log --graph`. This is the
  honest history of a project built in phases, and it is what a reviewer expects to see.
- Delete the branch after merge; keep the merge commit.

Alternative considered and rejected: trunk-based development with direct commits to `main`. It is
faster, but it hides the phase structure that this project's reviewing and resumption model
depends on, and it removes the safety net of being able to abandon a bad approach cleanly.

## 5. Author identity

The author is:

```
Devansh <dhbhensdadia@gmail.com>
GitHub: https://github.com/DHBhensdadia
```

For GitHub to attribute commits to that profile, the **email in the commit must match a verified
email on the GitHub account**. This is the single most common reason commits appear as an
unlinked grey avatar, so it is verified before the first push, not after.

Identity is set **repo-locally** (`git config --local`), never globally, so the settings cannot
leak into an unrelated project on the same machine.

Two distinct fields must both be correct: `user.name`/`user.email` set the *author*, and the
*committer* is taken from the same values unless overridden. Both must be the author. A commit
authored by one identity and committed by another is exactly the kind of anomaly that reveals a
tool in the loop.

## 6. Practical hygiene

- **`.gitignore` first, before the first commit.** Editor and OS artefacts (`.DS_Store`, `Thumbs.db`,
  `.vscode/`, `.idea/`), build output, and logs. Never rely on remembering.
- **Review what you are about to commit**: `git diff` for unstaged, `git diff --cached` for staged.
  A `git status --short` before every commit is not ceremony; it is how an unintended file is caught.
- **Stage specifically.** `git add -A` in a shared checkout can sweep up someone else's work. Add
  the paths you changed, by name.
- **Never commit secrets.** No tokens, no keys, no `.env`, no personal absolute paths. Check the
  diff before staging, not after pushing.
- **Do not rewrite published history.** No force-push to `main`, no rebasing a pushed branch,
  without the author's explicit in-the-moment instruction. Amending an unpushed local commit is fine.
- **Tags for milestones.** `v0.1.0` at the end of Phase 0, then a tag per closed phase or per
  meaningful release, and `v1.0.0` at delivery. Annotated tags (`git tag -a`) carrying a one-line
  summary, because they are part of the history a reviewer reads.

## 7. The commit checklist to run before every commit

1. `git status --short` — is every listed file mine, and intended?
2. `git diff` — does the change actually do what I am about to claim it does?
3. Does the subject complete "If applied, this commit will ___"?
4. Is it ≤ 72 characters, capitalised, imperative, with no trailing period?
5. Is it free of any AI attribution, emoji, or tool name?
6. Does it describe the software, not the process?
7. Does the repository still build and pass its tests at this commit?
8. Is `docs/MIND_MAP.md` updated if files were added, renamed, moved or deleted?

---

## Sources

- Chris Beams, *How to Write a Git Commit Message* — the seven rules, via
  `https://gist.github.com/julienbourdeau/e605e4b8b47da97c249a0f72598529c8`
- TheServerSide, *Git commit message conventions and best practices*
- Thoughtbot, *The art of writing meaningful Git commit messages* (2025)
- GitKraken, *How to Write a Good Git Commit Message*
- PullNotifier, *8 Git Commit Message Best Practices* (Dec 2025)
- Conventional Commits specification v1.0.0 — `https://www.conventionalcommits.org/en/v1.0.0/`
- Stack Overflow, *Git Commit Messages: 50/72 Formatting*
