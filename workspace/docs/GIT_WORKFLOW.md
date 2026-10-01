# Git Workflow — ChemiPedia

The operational rules. The reasoning behind them, and the sources, are in
`docs/research/03-git-and-github-standards.md`.

> **This file is mandatory reading at the start of every session** (`AGENTS.md` §0.6). You will be
> committing. Getting the history wrong is not a cosmetic failure; the history is part of the
> deliverable and it is the primary piece of evidence that this project is the author's own work.

---

## 1. Identity — already configured

```bash
git config --local user.name  "Devansh"
git config --local user.email "dhbhensdadia@gmail.com"
```

- Set **repo-locally**. Never `--global`.
- Verify before your first commit of a session: `git config --local --list | grep user`.
- The **author** and the **committer** must both be this identity.
- The email must match a verified email on `https://github.com/DHBhensdadia`, or GitHub will not
  link the commits to the profile.

### Forbidden, absolutely

- `Co-Authored-By:` trailers naming any agent, assistant, model or tool.
- `🤖 Generated with …` or any emoji footer.
- Any mention of Freebuff, Codebuff, Claude, Copilot, ChatGPT, an LLM, an AI agent, or "generated".
- Any trailer that suggests a tool participated in the commit.

If you find one of these already committed, **do not rewrite published history**. Report it to the
author and record it in `RUN_STATE.md`.

## 2. Message format

```
<Imperative subject, capitalised, ≤ 72 chars, no trailing period>

<Optional body, wrapped at 72 characters. Explain what changed and why it
matters. Say what the software now does that it did not do before, and why
that was the right call. Do not narrate your process. Do not list files.>
```

**The test:** the subject must complete the sentence *"If applied, this commit will `___`."*

Good:

```
Build the periodic table grid from the element repository

The table previously carried a hard-coded list of tiles, which made it
impossible to reuse for the orbital and electronegativity views. It now
renders from the shared repository and takes its colour mapping as an
argument, so all four views share one code path.
```

```
Correct the lanthanide row offset on narrow viewports
```

```
Add unit tests for the colour scale interpolation
```

Bad — and why:

| Message | Problem |
|---|---|
| `Add phase 3` | Describes the process, not the software. |
| `Update files` | No information at all. |
| `feat(table): add group isolation` | Prefix is a generated-history tell. |
| `Fixed the bug where tiles overlapped` | Past tense; also vague about the fix. |
| `WIP` | Not a stable checkpoint; do not commit it. |
| `Implement the entire periodic table, glossary, and calculator` | Too large; should be several commits. |

Rules in brief: imperative, capitalised, ≤ 72 characters, no trailing period, blank line, body
wrapped at 72, explain *why*, never mention the tooling, never mention a phase number.

## 3. What to commit, and how much

**Several coherent commits per phase.** A phase is decomposed into its natural units, and each
unit is committed when it is stable. Illustrative decomposition for the table engine phase:

```
Add the element repository with indexed lookups
Add unit tests for element and group lookups
Render the periodic table grid from element data
Add colour modes for group, block and state
Add keyboard navigation to the table grid
Add the group isolation interaction
```

That is six commits for one phase. Each is one idea, each builds, each is revertible.

**Atomic.** One commit = one logical change. It must build and pass its tests on its own. If you
cannot describe it in one sentence without "and", it is two commits.

**Small enough to resume from, not so small it is noise.** Never leave a large amount of unrelated,
unfinished work uncommitted when a stable checkpoint can reasonably be created.

**Never commit:** generated build output (unless ADR-001 §3 says otherwise), `node_modules`, editor
and OS artefacts, logs, secrets, absolute personal paths, or `TODO` placeholders for work the
phase promised.

## 4. The pre-commit checklist

Run all eight. Do not skip step 1 or 5.

```
1.  git status --short          → is every file mine and intended?
2.  git diff                    → does the change do what I am about to claim?
3.  Subject completes "If applied, this commit will ___".
4.  ≤ 72 chars, capitalised, imperative, no trailing period.
5.  Zero AI attribution, zero emoji, zero tool names.
6.  Describes the software, not the process. No phase numbers.
7.  Build and tests pass at this commit.
8.  docs/MIND_MAP.md updated if any file was added, renamed, moved or deleted.
```

## 5. Staging

Stage **by path**, never with `git add -A` or `git add .`:

```bash
git add source/scripts/components/periodic-table.js source/styles/components/periodic-table.css
```

This is a shared checkout. A blanket add will eventually sweep up a file you did not write and did
not read. If you need to see what is already staged: `git diff --cached`.

Do not commit, push, or open a pull request unless the author has asked for it in that session.

## 6. Branches

- `main` is always in a working state.
- Short-lived branches per phase or per substantial unit:
  `feature/periodic-table-engine`, `feature/glossary`, `fix/mobile-table-overflow`,
  `docs/working-agreement`, `refactor/data-layer`.
- Merge with `--no-ff` so the phase stays visible as a group:
  ```bash
  git checkout main
  git merge --no-ff feature/periodic-table-engine
  ```
- Delete the branch after merging.

## 7. Tags

Annotated, at the close of a phase or a meaningful milestone:

```bash
git tag -a v0.1.0 -m "Foundation: repository layout, working system, development server"
```

Phase 0 closes with `v0.1.0`; delivery closes with `v1.0.0`.

## 8. Publishing to GitHub

The repository is authored locally first. Publishing is a deliberate, author-approved step:

```bash
# one-time, run by the author
git remote add origin git@github.com:DHBhensdadia/chemipedia.git
git branch -M main
git push -u origin main
git push --tags
```

After the first push, never force-push `main` and never rebase a pushed branch without the
author's explicit, in-the-moment instruction. Amending an unpushed local commit is fine.

If the commits arrive on GitHub as an unlinked grey avatar rather than the author's profile, the
cause is almost always a mismatch between the commit email and the account's verified emails. Fix
the identity, not the history.

## 9. When something goes wrong

| Situation | Do this |
|---|---|
| Committed to the wrong branch, not yet pushed | `git reset --soft` to where you meant to be, recommit. Say so in `RUN_STATE.md`. |
| A commit message is wrong, not yet pushed | `git commit --amend` to fix the message. |
| Committed a secret | Stop. Rotate the secret first, then tell the author. Do not rewrite history alone. |
| Something is broken on `main` | Fix forward with a `fix/...` branch, or revert the offending commit with `git revert`. Do not reset a shared branch. |
| Not sure whether a file is yours | Leave it uncommitted and ask. Never discard another writer's work. |
