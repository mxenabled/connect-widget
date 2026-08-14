---
name: adr-review
description: Review a pull/merge request's new code against the connect-widget Architecture Decision Records (ADRs). Use when asked to "ADR review", "review this PR against the ADRs", "check ADR compliance", or before approving a PR/MR in the connect-widget (GitHub) or the sibling GitLab repo that follows the same standards. Reviews styling (CSS Modules / MUI), testing (Vitest/MSW/Cypress), folder structure (screaming architecture), PR size, and undocumented architecture choices.
---

# ADR Review

Review the **new code** in a pull request (GitHub) or merge request (GitLab) against
the connect-widget Architecture Decision Records and report any violations.

The connect-widget ADRs are the single **canonical** source of truth. Two repos are
expected to follow them: `connect-widget` (GitHub) and a sibling GitLab repo. This
skill can review either — it always evaluates against the connect-widget ADRs.

## Scope: what to review

Review **only the code the PR adds or changes** (the diff), not the whole repo. ADR
0002 states that a PR is judged on whether its *new* code adheres to the ADRs; you
are not auditing pre-existing code except where the PR modifies it. When a PR edits a
line that was already non-conforming, note that conforming it would be ideal but is
not blocking unless the PR is making that area worse.

## Step 1 — Load the canonical ADRs (always do this first)

The ADRs evolve, so read them live rather than relying on this skill's summary. Load
them from the connect-widget repo, trying these sources in order until one works:

1. If `architectureDecisionRecords/` exists in the current working directory (you are
   in the connect-widget repo), read every `*.md` file in it.
2. If the env var `CONNECT_WIDGET_ADR_PATH` is set, read the `*.md` files there.
3. If a local connect-widget checkout is known, read its `architectureDecisionRecords/`.
4. Fall back to fetching them from GitHub (works from any repo, e.g. the GitLab one):
   ```bash
   gh api repos/mxenabled/connect-widget/contents/architectureDecisionRecords \
     --jq '.[] | select(.name|endswith(".md")) | .name' \
   | while read -r f; do
       echo "===== $f =====";
       gh api "repos/mxenabled/connect-widget/contents/architectureDecisionRecords/$f" \
         --jq '.content' | base64 --decode;
     done
   ```

Read `reference/adr-checklist.md` (next to this file) for the distilled, checkable
rules. The live ADR files win if they ever disagree with the checklist — if you spot
drift, mention it.

## Step 2 — Determine the target and get the diff

Detect the platform from the git remote (`git remote -v`): `github.com` → GitHub,
`gitlab` in the host → GitLab.

Figure out what the user wants reviewed, in this priority:

- **Explicit PR/MR number or URL** in the request → fetch that.
  - GitHub: `gh pr diff <number>` and `gh pr view <number> --json title,body,files,baseRefName,additions,deletions`
  - GitLab (if `glab` is installed): `glab mr diff <number>` and `glab mr view <number>`
  - GitLab (no `glab`): tell the user glab isn't installed and fall back to the local
    diff below, or ask them to check out the MR branch.
- **A branch/PR is open for the current branch** → `gh pr view --json ...` + `gh pr diff`.
- **Otherwise review the current branch** against its base:
  ```bash
  base=$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null \
         || git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@' \
         || echo master)
  git fetch -q origin "$base" 2>/dev/null || true
  git diff "origin/$base...HEAD" --stat
  git diff "origin/$base...HEAD"
  ```

Also gather the list of changed files (`--name-status`) and the added-lines only
(`git diff ... --unified=0`) so you can cite precise `file:line` locations.

If you cannot obtain a diff, stop and tell the user what's missing (e.g. wrong repo,
private MR needing glab auth) rather than reviewing nothing.

## Step 3 — Review the diff against each ADR

Go through the checklist in `reference/adr-checklist.md`. For each added/changed hunk,
check every applicable ADR. Only flag things you can point to in the diff. Prefer
being specific and actionable over exhaustive nitpicking.

Assign each finding a severity:
- **Blocking** — clearly violates an ADR's decision (would fail review per ADR 0002).
- **Should fix** — likely violation or strongly discouraged pattern; confirm intent.
- **Consider** — judgment call, style, or a heads-up (e.g. PR getting large).

For anything ambiguous (folder-structure judgment calls, "is this new code or a hotfix"),
say why it's ambiguous rather than asserting a violation.

## Step 4 — Report the findings in chat

Print a structured report. Do **not** post to the PR/MR unless the user later asks.

Format:

```
# ADR Review — <PR title / branch> (<N files, +X/-Y>)

**Verdict:** <Conforms ✅ | Changes needed ⚠️ | Blocking issues ❌>

## Blocking
- **[ADR 0001 Styling]** `src/Foo/Foo.tsx:42` — Uses `sx` prop for styling.
  → Move to a CSS Module; `sx`/`xs` are only allowed for breakpoint-specific code.

## Should fix
- ...

## Consider
- ...

## Notes
- <ADR drift, hotfix exceptions, or "no test file added for new component", etc.>
```

If everything conforms, say so plainly and list what you checked so the user has
confidence the review was real. If nothing in the diff is in scope for a given ADR
(e.g. no styling changes), note that you checked and it didn't apply.

## Notes & exceptions

- **Hotfix exception (ADR 0002):** urgent production hotfixes may bypass the ADRs but
  must be followed by a conforming PR. If the PR looks like a hotfix, flag violations
  as "acceptable only if this is an urgent hotfix — file a follow-up ticket."
- **Legacy code:** the repo is mid-migration (e.g. `@kyper/*` → MXUI). Editing legacy
  files doesn't require rewriting them, but new code must conform.
- Keep the review grounded in the *diff* — never invent violations you can't cite.
