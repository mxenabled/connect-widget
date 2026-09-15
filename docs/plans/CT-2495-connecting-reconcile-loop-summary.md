# CT-2495: Connecting reconcile loop — what changed, risks, next steps

**Branch:** `lr/CT-2495-connecting-stall` (2 commits on top of `ct/CT-2495-connecting-stall`)
**Companion doc:** [`CT-2495-connecting-reconcile-loop-plan.md`](./CT-2495-connecting-reconcile-loop-plan.md) — the _why_
**Test status:** full suite green — 125 files / 917 tests

## TL;DR

The original branch fixed the OAuth stall but did it by bolting three mechanisms
onto a one-shot effect, and the combination could retry `runJob` forever. This
branch keeps every behavioral fix from the original, replaces those three
mechanisms with one bounded loop in a pure module, and adds an integration test
that proves the loop terminates under a backend that never cooperates.

No server work required.

## Net changes

| File                                                          | Change                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utilities/runJobSchedule.js`                             | **New.** `runJobSchedule$()` — a pure RxJS observable that drives a job schedule to completion. Observe whatever is running → reconcile it against the schedule → start the next job → repeat. Caps at `jobs.length + 3` iterations and errors with `JobScheduleExhaustedError`.                                                                                                        |
| `src/views/connecting/Connecting.js`                          | Run effect shrinks from ~100 lines of nested `mergeMap`s to "subscribe to `runJobSchedule$`, dispatch `jobComplete`, or set `connectingError`". Deleted: `isForeignJob` (two copies), the nested second `pollMember`, the `activeJobAttempt` state + effect dep, and the now-unused `loadMemberByGuid` after `runJob`. Effect now runs once per schedule init, not once per active job. |
| `src/views/connecting/__tests__/ConnectingOAuthJobs-test.tsx` | +3 integration tests (real store, real schedule, real poller, fake backend) and a small error boundary so the hard-error path is observable.                                                                                                                                                                                                                                            |
| `docs/plans/…-plan.md`, `…-summary.md`                        | This documentation.                                                                                                                                                                                                                                                                                                                                                                     |

**Unchanged from the original branch** (still in place, still tested): the
member refresh on mount, the use-case sync, the `most_recent_job_guid: null`
guard, `JobSchedule.onJobFinished` as reconciliation, the reducer change, the
once-only `connect/initialDataReady`, and every postMessage/analytics contract.

## How it was built (TDD)

1. Wrote three integration tests against the _original_ branch:
   - foreign job already running → every scheduled job still runs, in order, once
   - early data release still hands off early when nothing else is scheduled
   - **backend always 409s → give up with an error instead of looping**
2. Ran them: the first two passed (characterization), the third **timed out at 5s**
   — the original code never terminates.
3. Wrote `runJobSchedule$`, rewired `Connecting.js`, ran the suite: all green,
   including the 5 original OAuth scenarios and the 13 pre-existing Connecting
   tests, without modifying any of them.

The termination test asserts an exact call count (`1 + EXTRA_ITERATIONS_ALLOWED`)
and that no further `runJob` calls happen after the error surfaces.

## Behavior that is _better_ than the original branch

- **Bounded.** Perpetual 409 → 4 `runJob` calls then `JobScheduleExhaustedError`
  thrown to the host error boundary. Original: one call per poll interval, forever.
- **Job we started but can't load afterward is still credited.** If `runJob`
  succeeded for type X and the follow-up `loadJob` fails, the loop marks X done
  instead of treating it as foreign and starting X again. Original branch would
  re-run it (and under a `/jobs` outage, keep re-running it).
- **One fewer request per job.** The `loadMemberByGuid` right after `runJob` only
  fed a guid we already had; polling loads the member anyway.
- **Testable without React.** The loop is a function of `api`, `pollMember`,
  `member`, `schedule`, `config`. We chose integration tests for this PR, but unit
  tests are now possible if anyone wants them.

## Risks to weigh

### 🟠 Cap exhaustion is a hard error

When the loop gives up, `Connecting` throws and the host error boundary takes over.
That is the _honest_ outcome (we could not run the jobs the customer configured),
and it is what non-409 `runJob` failures already did. But it is a new way to reach
the error screen. Alternatives considered and rejected:

- _Pretend done and send `memberConnected`_ — lies to the consumer about which
  products ran.
- _Keep retrying with backoff_ — exactly the unbounded behavior we are removing.

If product prefers a softer landing, the place to change is the `error:` handler
in `Connecting.js`; the loop itself does not need to change.

### 🟠 The loop and redux each hold a copy of the schedule

`runJobSchedule$` tracks its own schedule to decide what to run next; redux's copy
(driving `ProgressBar`) is updated through `jobComplete`. Both apply the same
`JobSchedule.onJobFinished` to the same `(member, job)`, and the loop only
continues when the reducer would also continue (CONNECTED, no error code), so they
cannot drift in practice. Worth knowing when reading the code.

### 🟡 Effect deps changed from `[init, activeJob, attempt]` to `[init]`

Deliberate: the loop owns progression now. If someone later adds a feature that
mutates `jobSchedule` in redux from _outside_ Connecting while it is mounted, the
running loop will not see it. There is no such code path today.

### 🟡 Websocket transport still yields jobs without `job_type`

`MemberUpdateTransport` synthesizes `{ guid, async_account_data_ready }` from
socket events. `resolveFinishedJob` handles this (prefers the freshly loaded job,
then the started type), but a websocket-mode integration test does not exist.
Pre-existing gap, not introduced here.

### 🟡 `/jobs` outage during polling still stalls (pre-existing)

The polling transport treats a failed `loadJob` as a failed poll, so under a full
`/jobs` outage `pollingIsDone` never becomes true. This branch neither fixes nor
worsens it; the original branch had the same limit.

### ✅ Reviewed and considered fine

- `handleMemberPoll` still receives every polling state (via `onPoll`), so the
  60s timeout postMessage and `memberStatusUpdate` behave as before — the existing
  fake-timer tests cover this.
- `onUpsertMember` still fires once per observed job with the polled member.
- Error-status fade-out before `jobComplete` is preserved.

## Suggested review path

1. `docs/plans/CT-2495-connecting-reconcile-loop-plan.md` — 5 minute read on why.
2. `src/utilities/runJobSchedule.js` — read `iterate` → `observeThenContinue` →
   `observeRunningJob` top to bottom; it mirrors the pseudocode in the plan.
3. `Connecting.js` diff — mostly deletion.
4. `ConnectingOAuthJobs-test.tsx` — the fake backend at the top is the mental
   model; each test is a scenario against it.

## Next steps

**Before merge**

- [ ] Product/UX sign-off on "exhausted schedule → error screen" (see first risk).
- [ ] Decide whether `EXTRA_ITERATIONS_ALLOWED = 3` is the right allowance. It
      means "up to three jobs we did not start" per Connecting session.

**Soon after**

- [ ] Add a websocket-mode scenario to `ConnectingOAuthJobs-test.tsx`.
- [ ] Harden `MemberUpdateTransport` so a failed `loadJob` degrades to
      `job: undefined` instead of failing the poll (fixes the `/jobs` outage stall).

**Server conversation (removes the guessing entirely)**

- [ ] Ask Firefly for **idempotent `runJob`**: return the running job (200) when one
      of the requested type already exists, instead of 409. With that in place the
      loop collapses to "poll, reconcile, run next" and the 409 branch disappears.
- [ ] Fallback options: include the redirect-created `job_guid` in the OAuth-state
      response, or have the redirect job honor the widget's configured mode/products.
