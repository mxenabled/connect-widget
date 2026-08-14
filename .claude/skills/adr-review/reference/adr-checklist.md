# ADR Compliance Checklist

Distilled, checkable rules from the connect-widget ADRs. The **live ADR markdown files
are authoritative** — if this checklist disagrees with them, follow the ADRs and note
the drift. Each rule lists what to look for in a diff and how confidently it can be
flagged from static inspection.

Cite the ADR number in every finding (e.g. `[ADR 0001 Styling]`).

---

## ADR 0001 — Styling our HTML

Decision: prefer **raw MXUI/MUI components**; custom styling is rare and must be
designer-validated; when custom styling is warranted, style with **CSS Modules** and
use **MUI `Stack`** for spacing/layout.

Check added/changed `.tsx`/`.jsx`/`.css` code:

- **Prefer raw MXUI/MUI components.** Reach for the design system's components as-is
  before writing any custom styling — they carry the design system's styling by
  default. Flag new custom-styled elements (CSS Modules, wrappers, overrides) that
  reimplement something an existing MXUI/MUI component already provides.
- **Custom styling should be rare and designer-validated.** Custom styling should be
  the exception, not the norm, and should be validated with a designer before being
  implemented. If a design doesn't fit the design system, that deviation should be
  confirmed as intentional with a designer. When a PR adds non-trivial custom styling,
  flag it (usually "Consider"/"Should fix") with a note to confirm designer sign-off —
  especially when it visibly deviates from the design system.
- **Prefer MUI theme variables over hard-coded values.** When a raw component can't be
  used, prefer MUI theme variables (e.g. `--mui-palette-*` CSS variables, visible in
  Chrome dev tools' Styles panel on a rendered MXUI component) over hard-coded colors,
  spacing, and other magic values. Flag hard-coded hex/rgb colors or pixel values that
  a theme variable would cover.
- **CSS Modules required.** New stylesheets must be `*.module.css` and imported as a
  module (`import styles from './Foo.module.css'`). Flag new plain `.css`/global CSS
  files, or Tailwind / other global CSS-framework classes, or styled-components.
- **No `sx` prop for styling.** Flag `sx={...}` on MUI/MXUI components. *Exception:*
  `xs` is allowed **only** for breakpoint-specific code (MUI doesn't expose breakpoints
  as CSS variables). Ordinary styling via `sx`/`xs` → move to a CSS Module.
- **Spacing between elements → MUI `<Stack spacing={n}>`.** Flag margins/padding added
  purely to space sibling elements when a `Stack` would be idiomatic. (Judgment call —
  mark as "Consider" unless obvious.)
- **On a `Stack`, don't use `gap` or `flexDirection` props.** Use `spacing` and
  `direction` instead. Flag `<Stack ... gap=` and `<Stack ... flexDirection=`. Other
  flexbox props directly on `Stack` are fine.

Related lint (not an ADR, but reinforces intent): `.eslintrc.cjs` restricts some
`@kyper/*` and `@mui/material/TextField` imports (use `src/privacy/input`). New
`@kyper/*` usage is discouraged (migrate to MXUI) per project docs.

---

## ADR 0002 — Document architecture decisions

Decision: new code must adhere to the ADRs; significant technical choices need an ADR.

- **PR-blocking rule:** new code that violates any ADR should not be approved (unless
  it's an urgent hotfix, which must be followed by a conforming PR).
- **New library / major pattern without an ADR.** If the diff adds a dependency to
  `package.json` or introduces a notably new architectural pattern (new state lib, new
  styling approach, new test framework, etc.), check whether a supporting ADR exists.
  If not, flag: "introduces <X>; ADR 0002 expects significant choices to be documented."
- **Non-conforming code being modified:** ADR 0002 says to conform it if feasible, or
  at minimum file a ticket and add tests covering the new code. Note this when a PR
  touches non-conforming areas without doing either.

---

## ADR 0003 — Automated testing (frontend)

Decision: **Vitest** (unit/integration), **MSW** (API mocking), **Cypress** (e2e).
Prefer integration tests; mock as little as possible; render real components.

- **New code should have tests.** Flag new components/hooks/util modules added without
  a corresponding `*.test.ts(x)` (or `*.cy.ts` for e2e) in the same PR. Colocated test
  next to source is expected (see ADR 0004).
- **Prefer integration over heavy mocking.** Flag heavy use of `vi.mock(...)` to stub
  out real components/modules — the ADR prefers rendering real components so context
  and side-effects are wired. Mark as "Should fix" / "Consider" with a note.
- **Use MSW for API mocking.** Flag tests that mock `fetch`/`axios` directly (e.g.
  `vi.fn()` on the network, `global.fetch = ...`) instead of MSW handlers.
- **Right tool for the layer:** many edge cases belong in Vitest integration tests
  (with MSW), not Cypress. e2e is for verifying frontend↔backend/API wiring.

---

## ADR 0004 — Folder structure (screaming architecture)

Decision: organize by **domain**, not by framework/technical type. Keep files that are
used together in close proximity; move code to `shared/` only once actually shared.

- **New files organized by domain.** A new feature's component, `api.ts`, and tests
  should live together in a domain folder (e.g. `src/Institutions/Institution/...`),
  not scattered across generic technical folders. Flag new files dropped into generic
  buckets (`components/`, `hooks/`, `utils/`, `redux/`) purely by file type when a
  domain folder would be clearer. (Judgment call — the existing repo predates this ADR,
  so weigh against surrounding structure; mark most as "Consider"/"Should fix".)
- **Colocation.** Tests and `api.ts` live next to the code they cover, not in a
  separate mirror tree. Flag new tests placed far from their subject.
- **`shared/` is for genuinely shared code.** Flag brand-new code placed directly in
  `shared/` that only one domain uses (premature sharing).

Because the current repo is mid-migration, treat structure findings as guidance for
*new* domains/files rather than demanding relocation of existing ones.

---

## ADR 0005 — Small pull requests

Decision: strive for small, focused PRs that serve a single purpose.

- **Size heuristic.** Consider flagging when the diff is large or unfocused, e.g.
  roughly >~400 changed lines or >~15–20 files of production code, OR the PR clearly
  bundles unrelated concerns (e.g. a refactor + a feature + a dependency bump).
- Mechanical/generated changes (lockfiles, snapshots, i18n) don't count against size
  the same way — note them separately.
- This is almost always a **"Consider"** (advisory), not blocking. Frame it as "could
  this be split?" and point to the distinct concerns you see.
