# CT-2495: Connecting stall — why refactor to a reconcile loop instead of patching

**Branch:** `lr/CT-2495-connecting-stall` (builds on `ct/CT-2495-connecting-stall`)
**Status:** Proposal / in progress

## The problem, precisely

`Connecting` was designed on one assumption: **the widget is the only thing that
starts jobs on a member.** The job schedule is a local plan (`ACTIVE → PENDING →
PENDING`) and the run effect is one-shot per `activeJob`: start it, poll until
done, mark done, move on.

OAuth breaks that assumption in two ways:

1. The member in redux is a **pre-redirect snapshot** — stale `is_being_aggregated`,
   `most_recent_job_guid: null`.
2. **Firefly starts its own job on the redirect** (when background aggregation is
   off), so the server's reality diverges from the local plan.

Symptoms: `GET /jobs/null` 404 kills the stream; a Firefly job of a different type
gets treated as the scheduled one; two ACTIVE jobs and nothing picks up the second.
Result: the widget sits on "Connecting" forever.

## What the first branch (`ct/CT-2495-connecting-stall`) does

- Fixes (1) correctly: refresh the member on mount, guard against a null job guid.
- Patches (2) with three interacting mechanisms bolted onto the one-shot effect:
  - `isForeignJob` detection (finished job type ≠ active job type)
  - a **second nested `pollMember`** to wait for a foreign job to actually finish
  - an `activeJobAttempt` counter added to the effect deps to force a re-run

Each is reasonable alone. Together they make the hardest effect in the codebase
harder, and they introduce one real defect: **the re-run has no upper bound.**

### The unbounded-retry defect

- **409 loop:** re-run → `runJob` 409s → poll → member is CONNECTED+idle so polling
  stops immediately → same "foreign" job loaded → schedule unchanged → `attempt++`
  → repeat. Hits `runJob` every ~3s forever if the backend keeps 409ing.
- **`/jobs` outage loop:** `loadJob` fails → job is `null` → treated as foreign →
  schedule unchanged → `attempt++` → **`runJob` starts a brand-new real job** →
  repeat. Previously this stalled; now it spawns jobs.

## The alternative: a bounded reconcile loop

Stop distinguishing "our job" from "their job". The server is the source of truth;
the schedule is a checklist that is **reconciled** after every observed completion.

```
loop (bounded by schedule.length + 2):
  member = refresh()
  if member.is_being_aggregated:
      member = pollUntilIdle(member)          # who started it doesn't matter
      job    = loadJob(member.most_recent_job_guid)
      schedule = reconcile(schedule, job)     # mark matching type DONE
      continue
  if member is CHALLENGED / error:
      exit → jobComplete routes to MFA / error step
  next = firstNotDone(schedule)
  if !next: exit (all done)
  try runJob(next.type)
  catch 409: continue                         # someone else started one; observe it
```

Why it is better:

| Concern                             | Patch approach              | Reconcile loop                                                          |
| ----------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| "Foreign job"                       | Special-cased in two places | Not a concept — every job is reconciled                                 |
| 409 vs. "Firefly job still running" | Two different code paths    | Same path: observe, reconcile, continue                                 |
| Termination                         | `attempt++`, unbounded      | Structural: each iteration marks DONE, starts a job, or exits; hard cap |
| Testability                         | Only via full React render  | Pure RxJS function + the existing integration tests                     |
| Early data release                  | Second nested poll          | One parameter on the poll: "poll to idle if more jobs remain"           |

`JobSchedule.onJobFinished` as rewritten in the first branch is _already_
reconciliation (mark matching DONE, only promote if nothing ACTIVE). The loop just
removes the branching around it.

## Why do it now instead of "patch now, refactor later"

Deploys are expensive. The thing that usually makes "refactor now" risky is the lack
of a safety net, and the first branch already built it:

- `ConnectingOAuthJobs-test.tsx` — real store, real schedule, real poller, fake
  backend, across the exact stall scenarios.
- `Connecting-test.tsx` — pre-existing non-OAuth behavior and postMessage contracts.
- `JobSchedule-test.js` / `Connect-test.js` — reconciliation semantics.

If the loop passes all of those unchanged **and** a new "perpetual 409 terminates"
test, we ship one deploy with a stronger guarantee than patch + cap would give.

## Does this need server work?

**No.** The loop uses the same three endpoints (`loadMemberByGuid`, `loadJob`,
`runJob`) and the same 409 semantics the current code already handles.

Server-side changes are a _separate, later_ simplification that would let the
client stop guessing entirely (any one of these):

1. Make `runJob` idempotent — return the running job (200) instead of 409.
2. Include the redirect-created `job_guid` in the OAuth-state response so the widget
   can adopt it explicitly.
3. Have Firefly's redirect job honor the widget's configured mode/products.

(1) is the smallest change with the biggest payoff. If we get it, most of the loop
collapses to "poll, reconcile, run next".

## Scope of the refactor

| Keep as-is                                                                 | Replace                                     |
| -------------------------------------------------------------------------- | ------------------------------------------- |
| Init effect (refresh → use cases → loadJob → `initializeJobSchedule`)      | The run effect's body                       |
| `loadMostRecentJob` helper                                                 | `isForeignJob` + nested second `pollMember` |
| `JobSchedule.onJobFinished`                                                | `activeJobAttempt` state + effect dep       |
| `handleMemberPoll`, `initialDataReadySentRef`, postMessages/analytics      | —                                           |
| `jobComplete` reducer, `ProgressBar` (still one dispatch per observed job) | —                                           |

New: `src/utilities/runJobSchedule.js` — a pure `runJobSchedule$()` observable that
emits `{ member, job }` per observed completion and completes when the schedule is
satisfied or a terminal member state is reached. `Connecting.js`'s run effect
becomes "subscribe, dispatch `jobComplete`".

Explicitly **not** touched: the init effect, the reducer, poller message strings, the
timeout postMessage.

## Approach

TDD, integration-first: add failing tests to `ConnectingOAuthJobs-test.tsx` for the
cases the patch approach gets wrong (perpetual 409, `/jobs` outage), then implement
the loop until the whole suite is green.
