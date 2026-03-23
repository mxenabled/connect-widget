# WebSockets Migration Notes: Connecting Flow

## Core Logic Notes: Polling to Event-Driven Migration

### What the polling system is trying to accomplish

The Connecting view orchestrates a finite state machine over two resources: a Member (MBR) and a Job. The poller only delivers fresh snapshots of both until one of the terminal conditions is reached. The events you need over WebSocket map directly to those state transitions.

### The two resources and why both matter

| Resource | Key fields watched                                                             | Why                                                                         |
| -------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Member   | `connection_status`, `is_being_aggregated`, `is_oauth`, `most_recent_job_guid` | Drives which screen the user sees                                           |
| Job      | `job_type`, `async_account_data_ready`                                         | Triggers "initial data ready" early-release event and marks a job slot done |

## Phase 1 - Job Schedule initialization (runs once on mount)

Before any polling starts, the component resolves which jobs need to run and in what order:

1. Load the member's `most_recent_job_guid` from the API (retries once; swallows 404s).
2. Call `JobSchedule.initialize(member, recentJob, config, isComboJobsEnabled)` which returns an ordered list of `{ type, status }` slots - one ACTIVE, the rest PENDING.
3. Special case: if `use_cases` were provided in config and the member is missing one (or is PENDING), call `updateMember` first, then initialize the schedule with the updated member.
4. Dispatch `initializeJobSchedule` to Redux so all downstream effects can react to `jobSchedule.isInitialized === true`.

Event-driven equivalent: this phase is still a one-time API request sequence. The schedule shape does not change; you still need it before listening for events.

## Phase 2 - Job execution plus member polling (the hot loop)

Once the schedule is initialized and `activeJob` is known:

1. If `member.is_being_aggregated === false`, call `api.runJob(activeJob.type, ...)` to kick off the job.
2. Regardless of whether a job was started or already running, begin polling `member` every 3 seconds (configurable via `memberPollingMilliseconds`).
3. Each poll also fetches the job via `api.loadJob(member.most_recent_job_guid)` so job state is always fresh alongside member state.

The accumulator in `usePollMember` tracks:

```text
{
  pollingCount,          // increments each tick
  previousResponse,      // snapshot before this tick
  currentResponse,       // snapshot after this tick  { member, job }
  pollingIsDone,         // true on terminal condition
  userMessage,           // UI string
  initialDataReady,      // latches true, never goes false
  isError,               // whether the last fetch errored
}
```

Event-driven equivalent: instead of interval ticks, consume separate member events plus a single job signal event. Keep the accumulator logic (`handlePollingResponse` plus the `initialDataReady` latch), but hydrate missing job details from API when needed.

## Phase 3 - Terminal condition decision tree (`handlePollingResponse`)

This pure function takes accumulated state and returns `[shouldStop, uiMessage]`. Priority order:

1. `member.connection_status === CHALLENGED (3)`
   - STOP. Show MFA screen.
2. `member.connection_status` is a ProcessingStatus (`CREATED=0`, `RECONNECTED=8`, `UPDATED=15`, `RESUMED=18`)
   - CONTINUE. Show "Verifying credentials".
3. `initialDataReady === true` (job async flag flipped)
   - STOP. Show "Finishing" (early-release path).
4. `member.connection_status === CONNECTED (6)`
   - If `member.is_being_aggregated === true`: CONTINUE. Show "Syncing data".
   - Else: STOP. Show "Finishing".
5. `member.is_being_aggregated === true` (catch-all while aggregating)
   - CONTINUE. Show "Verifying credentials".
6. Not aggregating and status in ErrorStatuses
   - STOP. Show "Error has occurred".
7. `is_oauth` and has not just finished aggregating
   - CONTINUE. Show "Waiting for authentication".
8. Fallthrough
   - STOP. Show "Error has occurred".

Event-driven equivalent: this logic is transport-agnostic. Keep it as-is and run it for each inbound event.

## Side-effects fired on each poll tick (`handleMemberPoll` in Connecting.js)

| Condition                                          | Side-effect                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pollingCount > 15` and status is not `PENDING`    | Set `timedOut = true`, then post `connect/stepChange { current: 'timeOut' }` |
| `connection_status` changed from previous snapshot | Post `connect/memberStatusUpdate`                                            |
| `initialDataReady` became `true`                   | Post `connect/initialDataReady` and fire analytics `INITIAL_DATA_READY`      |
| Every tick                                         | Update the UI message                                                        |

Event-driven equivalent: timeout should move to wall-clock time (about 60s) since event cadence is not fixed. Status diffing and `initialDataReady` latch stay the same.

## Phase 4 - Job completion and schedule advancement

When polling emits a terminal state (`pollingIsDone: true`):

1. Reload the job one final time to get a definitive `job` snapshot.
2. Dispatch `jobComplete(member, job, config.mode)` which advances `JobSchedule` via `onJobFinished`.
3. If not all jobs are done, the next ACTIVE job enters the same loop.
4. When all jobs are done, post `connect/memberConnected`, then dispatch `connectComplete()`.

If terminal status is an error, `fadeOut` runs before dispatching `jobComplete`.

Event-driven equivalent: because the socket does not include job payloads, keep the final `loadJob` GET before dispatching `jobComplete`.

## `initialDataReady` latch - early release behavior

This is the most subtle behavior:

- Latch `initialDataReady` to true once `job.async_account_data_ready === true` and `optOutOfEarlyUserRelease === false`.
- Once latched, polling logic stops immediately through rule #3 in the decision tree.
- `connect/initialDataReady` and analytics are sent once.

This enables host apps to move forward before full aggregation completes. Your event source should emit `members/priority_data_ready` at the moment `async_account_data_ready` flips to true.

## What the WebSocket server should emit

To fully replace polling with your current server behavior, consume events for:

1. Member updates via `members/updated` (any member change, including `connection_status`).
2. A single job signal event: `members/priority_data_ready` (equivalent to `async_account_data_ready = true`).
3. Connection heartbeat/liveness (for timeout and fallback behavior).

Recommended separate payload shapes:

```json
{
  "event": "members/updated",
  "payload": {
    "user_guid": "USR-810d4e82-750f-4c2a-a194-8c9b2897c629",
    "revision": 4,
    "needs_updated_credentials": false,
    "name": "Gringotts",
    "most_recent_job_guid": "JOB-32beadd9-a28f-491b-a4ee-cc9f883acd66",
    "metadata": null,
    "last_update_time": 1774286044,
    "last_job_status": null,
    "last_job_guid": null,
    "is_oauth": false,
    "is_manual": false,
    "is_managed_by_user": true,
    "is_being_aggregated": false,
    "institution_name": "Gringotts",
    "institution_guid": "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",
    "guid": "MBR-2afd08aa-b1fd-4661-a37a-a4ef3a48a7e4",
    "connection_status": 6
  }
}
```

```json
{
  "event": "members/priority_data_ready",
  "member_guid": "...",
  "payload": {
    "guid": "..."
  },
  "emitted_at": "2026-03-23T00:00:00.000Z"
}
```

```json
{
  "event": "connect.heartbeat",
  "member_guid": "...",
  "payload": {
    "stream": "member-connection",
    "sequence": 123
  },
  "emitted_at": "2026-03-23T00:00:00.000Z"
}
```

Because member and job data are not combined, maintain a member snapshot cache and a separate `initialDataReady` latch.

## Section 2 - Side-effect mapping to WebSocket contracts and handlers

This section maps each current polling side-effect to a concrete socket event contract and a client handler signature.

### Shared event envelope

Use a common envelope for all events so reducers/handlers can be generic:

```ts
type WsEventEnvelope<TType extends string, TPayload> = {
  event: TType
  member_guid?: string
  correlation_id?: string
  emitted_at?: string // ISO timestamp from server clock
  payload: TPayload
}
```

### Event contracts

```ts
type MemberUpdatedPayload = {
  guid: string
  user_guid: string
  revision: number
  needs_updated_credentials: boolean
  name: string
  metadata: unknown | null
  last_update_time: number
  last_job_status: string | null
  last_job_guid: string | null
  connection_status: number
  is_being_aggregated: boolean
  is_oauth: boolean
  is_manual: boolean
  is_managed_by_user: boolean
  institution_name: string
  institution_guid: string
  most_recent_job_guid?: string
  member_guid?: string
}

type PriorityDataReadyPayload = {
  guid: string
  member_guid?: string
}

type HeartbeatPayload = {
  stream: 'member-connection'
  sequence: number
}
```

### Side-effect map

| Current polling side-effect                                                                   | Trigger in polling code                                                  | WebSocket event(s) to consume                                                      | Client handler signature                                                                                                                                                                                  | Client behavior                                                                                                                                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Timeout (`timedOut = true`, post `connect/stepChange` with `timeOut`)                         | `pollingCount > 15` and member status not `PENDING`                      | `connect.heartbeat` plus `members/updated`                                         | `onHeartbeat(event: WsEventEnvelope<'connect.heartbeat', HeartbeatPayload>): void` and `onMemberUpdated(event: WsEventEnvelope<'members/updated', MemberUpdatedPayload>): void`                           | Start a wall-clock timer when loop starts; reset timer on heartbeat or member update event; if no event for 60s and latest status is not `PENDING`, emit timeout side-effect. |
| Member status update postMessage (`connect/memberStatusUpdate`)                               | `previous.connection_status !== current.connection_status`               | `members/updated`                                                                  | `onMemberUpdated(event: WsEventEnvelope<'members/updated', MemberUpdatedPayload>): void`                                                                                                                  | Diff previous vs current member snapshot in client state; if status changed, call existing postMessage with override hooks.                                                   |
| Initial data ready postMessage + analytics (`connect/initialDataReady`, `INITIAL_DATA_READY`) | `job.async_account_data_ready` flips to `true`, latch `initialDataReady` | `members/priority_data_ready`                                                      | `onPriorityDataReady(event: WsEventEnvelope<'members/priority_data_ready', PriorityDataReadyPayload>): void`                                                                                              | Latch a local boolean per member; fire postMessage and analytics only on first event for that member.                                                                         |
| UI message updates (`setMessage`)                                                             | `handlePollingResponse(pollingState)` each tick                          | `members/updated` and `members/priority_data_ready`                                | `onMemberUpdated(event: WsEventEnvelope<'members/updated', MemberUpdatedPayload>): void` and `onPriorityDataReady(event: WsEventEnvelope<'members/priority_data_ready', PriorityDataReadyPayload>): void` | Recompute `shouldStop` and `userMessage` using existing decision tree after either event updates local state.                                                                 |
| Terminal stop (`pollingIsDone`) then `jobComplete(member, job, mode)`                         | Decision tree returns stop                                               | Infer terminal condition from latest member snapshot plus `initialDataReady` latch | `handleTerminalIfNeeded(memberGuid: string): Promise<void>`                                                                                                                                               | No dedicated terminal socket event required; when decision tree says stop, call final `loadJob`, dispatch `jobComplete`, advance schedule.                                    |
| Final member connected event (`connect/memberConnected`) then `connectComplete()`             | `JobSchedule.areAllJobsDone(jobSchedule)`                                | Derived client-side after `jobComplete`                                            | `handleConnectedIfDone(memberGuid: string): void`                                                                                                                                                         | After dispatching `jobComplete`, if all jobs done, send existing connected post messages and dispatch `connectComplete()`.                                                    |

### Minimal client handler surface

```ts
type ConnectingSocketHandlers = {
  onMemberUpdated: (event: WsEventEnvelope<'members/updated', MemberUpdatedPayload>) => void
  onPriorityDataReady: (
    event: WsEventEnvelope<'members/priority_data_ready', PriorityDataReadyPayload>,
  ) => void
  onHeartbeat: (event: WsEventEnvelope<'connect.heartbeat', HeartbeatPayload>) => void
}
```

### Recommended processing order per incoming event

1. Validate envelope (`event`, `member_guid` or `payload.guid`, optional `emitted_at`, optional `correlation_id`).
2. Ignore stale events when you can establish ordering (prefer `emitted_at`, fallback to payload `revision` for `members/updated`).
3. Update latest member snapshot cache from `members/updated`.
4. If event is `members/priority_data_ready`, set local `initialDataReady = true` for that member.
5. Recompute decision tree (`handlePollingResponse` equivalent).
6. Apply side-effects in deterministic order:
   - status-change postMessage
   - initial-data-ready one-time side-effect
   - timeout check update
   - UI message update
   - terminal handling and job schedule advancement

### Reliability notes

- Keep idempotency guards for one-time effects (`initialDataReady`, terminal transitions).
- Use `correlation_id` and per-member `sequence` (if available) to avoid out-of-order regressions.
- Keep a fallback API hydration path for job details before `jobComplete`, since socket events do not carry job payloads.
- Do not assume every `members/updated` event changes status; only emit status side-effects when `connection_status` actually differs from the previous snapshot.

### Pseudocode reducer and dispatcher flow

Use this as a reference implementation for the client-side event state machine.

```ts
type MemberRuntimeState = {
  previousMember: MemberUpdatedPayload | null
  currentMember: MemberUpdatedPayload | null
  initialDataReady: boolean
  initialDataReadyAnnounced: boolean
  lastEventAtMs: number
  timedOutAnnounced: boolean
}

type RuntimeStore = Record<string, MemberRuntimeState>

const SIXTY_SECONDS_MS = 60_000

function getOrCreateState(store: RuntimeStore, memberGuid: string): MemberRuntimeState {
  if (!store[memberGuid]) {
    store[memberGuid] = {
      previousMember: null,
      currentMember: null,
      initialDataReady: false,
      initialDataReadyAnnounced: false,
      lastEventAtMs: Date.now(),
      timedOutAnnounced: false,
    }
  }

  return store[memberGuid]
}

function resolveMemberGuid(event: {
  member_guid?: string
  payload: { guid?: string; member_guid?: string }
}): string {
  return event.member_guid || event.payload.member_guid || event.payload.guid || ''
}

function applyMemberUpdatedEvent(
  store: RuntimeStore,
  event: WsEventEnvelope<'members/updated', MemberUpdatedPayload>,
): void {
  const memberGuid = resolveMemberGuid(event)
  if (!memberGuid) return
  const state = getOrCreateState(store, memberGuid)
  state.previousMember = state.currentMember
  state.currentMember = event.payload
  state.lastEventAtMs = event.emitted_at ? Date.parse(event.emitted_at) : Date.now()
}

function applyPriorityDataReadyEvent(
  store: RuntimeStore,
  event: WsEventEnvelope<'members/priority_data_ready', PriorityDataReadyPayload>,
): void {
  const memberGuid = resolveMemberGuid(event)
  if (!memberGuid) return
  const state = getOrCreateState(store, memberGuid)
  state.initialDataReady = true
  state.lastEventAtMs = event.emitted_at ? Date.parse(event.emitted_at) : Date.now()
}

function applyHeartbeatEvent(
  store: RuntimeStore,
  event: WsEventEnvelope<'connect.heartbeat', HeartbeatPayload>,
): void {
  const memberGuid = resolveMemberGuid(
    event as unknown as { member_guid?: string; payload: { guid?: string; member_guid?: string } },
  )
  if (!memberGuid) return
  const state = getOrCreateState(store, memberGuid)
  state.lastEventAtMs = event.emitted_at ? Date.parse(event.emitted_at) : Date.now()
}

function evaluateAndDispatchSideEffects(store: RuntimeStore, memberGuid: string): Promise<void> {
  const state = getOrCreateState(store, memberGuid)
  const member = state.currentMember

  if (!member) {
    return Promise.resolve()
  }

  const pollingStateLike = {
    previousResponse: { member: state.previousMember },
    currentResponse: { member },
    initialDataReady: state.initialDataReady,
  }

  const [shouldStop, userMessage] = handlePollingResponse(pollingStateLike)

  const didStatusChange =
    state.previousMember?.connection_status !== state.currentMember?.connection_status

  if (didStatusChange) {
    onPostMessage('connect/memberStatusUpdate', {
      member_guid: member.guid,
      connection_status: member.connection_status,
    })
  }

  if (state.initialDataReady && !state.initialDataReadyAnnounced) {
    state.initialDataReadyAnnounced = true
    onPostMessage('connect/initialDataReady', { member_guid: member.guid })
    sendAnalyticsEvent('INITIAL_DATA_READY', { member_guid: member.guid })
  }

  const nowMs = Date.now()
  const isPending = member.connection_status === ReadableStatuses.PENDING
  const isTimedOut = nowMs - state.lastEventAtMs > SIXTY_SECONDS_MS

  if (isTimedOut && !isPending && !state.timedOutAnnounced) {
    state.timedOutAnnounced = true
    onPostMessage('connect/stepChange', {
      previous: 'CONNECTING',
      current: 'timeOut',
    })
  }

  setMessage(userMessage)

  if (!shouldStop) {
    return Promise.resolve()
  }

  return api.loadJob(member.most_recent_job_guid as string).then((job) => {
    dispatch(jobComplete(member, job, connectConfig.mode))

    if (areAllJobsDone(selectJobSchedule())) {
      onPostMessage('connect/memberConnected', {
        user_guid: member.user_guid,
        member_guid: member.guid,
      })
      dispatch(connectComplete())
    }
  })
}
```

Notes:

- Keep the reducer pure for state writes and run side-effects in a separate dispatcher layer.
- If the server emits duplicate `members/priority_data_ready` events, idempotency guards above prevent double analytics and postMessages.
- If `members/updated` is sparse, hydrate missing member fields from API before calling `handlePollingResponse`.
