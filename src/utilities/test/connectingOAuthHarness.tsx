import React from 'react'
import { Subject } from 'rxjs'
import { render, waitFor } from 'src/utilities/testingLibrary'
import { Connecting } from 'src/views/connecting/Connecting'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiContextTypes } from 'src/context/ApiContext'
import { WebSocketConnection, WebSocketProvider } from 'src/context/WebSocketContext'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'

/**
 * Drives the real <Connecting /> after OAuth against fakes for the two things a test cannot
 * use for real: the backend (firefly/persona) and brokaw (websockets).
 */

const MEMBER_GUID = 'MBR-oauth'
const USER_GUID = 'USR-1'
export const REDIRECT_JOB_GUID = 'JOB-redirect'

export type Member = {
  guid: string
  user_guid: string
  connection_status: number
  is_being_aggregated: boolean
  most_recent_job_guid: string | null
  is_oauth: boolean
  error?: { error_code: number } | null
}

type Job = { guid: string; job_type: number; async_account_data_ready?: boolean }

export class HttpError extends Error {
  response: { status: number }

  constructor(status: number, message = 'Request failed') {
    super(message)
    this.name = 'HttpError'
    this.response = { status }
  }
}

// The member the widget holds when it lands on Connecting: created before the user left for
// the institution, so PENDING and without a job.
export const staleOAuthMember: Member = {
  guid: MEMBER_GUID,
  user_guid: USER_GUID,
  connection_status: ReadableStatuses.PENDING,
  is_being_aggregated: false,
  most_recent_job_guid: null,
  is_oauth: true,
}

/**
 * In-memory firefly/persona. `startJob` puts the member into aggregation for that job,
 * `loadMemberByGuid` lets it go idle after `pollsUntilDone` polls, and `runJob` answers 409
 * while a job is already running, as firefly does.
 */
export const createFakeBackend = ({
  pollsUntilDone = 2,
  earlyDataRelease = false,
  member = staleOAuthMember,
} = {}) => {
  const backend = {
    member: { ...member } as Member,
    jobs: {} as Record<string, Job>,
    pollsWhileRunning: 0,

    startJob(guid: string, jobType: number) {
      // With early data release the job reports its data as ready while it is
      // still running, which makes member polling stop before the job finishes.
      backend.jobs[guid] = { guid, job_type: jobType, async_account_data_ready: earlyDataRelease }
      backend.member = {
        ...backend.member,
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: true,
        most_recent_job_guid: guid,
      }
    },

    loadMemberByGuid: vi.fn(async (): Promise<Member> => {
      if (backend.member.is_being_aggregated) {
        backend.pollsWhileRunning += 1

        if (backend.pollsWhileRunning >= pollsUntilDone) {
          backend.pollsWhileRunning = 0
          backend.member = { ...backend.member, is_being_aggregated: false }
        }
      }

      return backend.member
    }),

    loadJob: vi.fn(async (guid: string): Promise<Job> => {
      const job = backend.jobs[guid]

      if (!job) {
        throw new HttpError(404)
      }

      return job
    }),

    runJob: vi.fn(async (jobType: number): Promise<Record<string, never>> => {
      if (backend.member.is_being_aggregated) {
        throw new HttpError(409)
      }

      backend.startJob(`JOB-${jobType}`, jobType)

      return {}
    }),
  }

  return backend
}

// Yields one macrotask so the widget's pending promises and subscriptions settle.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

/**
 * Stands in for brokaw. `memberUpdated(member)` delivers a `members/updated` frame and waits
 * for the widget to process it. Like brokaw, nothing is replayed to late subscribers, so send
 * frames only once the widget is observing.
 */
export const createFakeBrokaw = () => {
  const frames$ = new Subject<{ event: string; payload: Member }>()

  const connection: WebSocketConnection = {
    isConnected: () => true,
    webSocketMessages$: frames$.asObservable(),
  }

  const memberUpdated = async (member: Member) => {
    frames$.next({ event: 'members/updated', payload: member })
    await settle()
  }

  return { connection, memberUpdated }
}

// Connecting throws `connectingError` during render so the host's error boundary can take
// over. Tests need a boundary of their own to observe that.
class TestErrorBoundary extends React.Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? <div data-testid="connecting-error" /> : this.props.children
  }
}

export const renderConnecting = (
  backend: ReturnType<typeof createFakeBackend>,
  connectConfig: Record<string, unknown>,
  {
    webSocket,
    member = staleOAuthMember,
  }: { webSocket?: WebSocketConnection; member?: Member } = {},
) => {
  const onPostMessage = vi.fn()
  const onError = vi.fn()

  // The shared render helper hard-codes a no-op onPostMessage and has no websocket context,
  // so those two are provided here.
  const connecting = (
    <PostMessageContext.Provider value={{ onPostMessage }}>
      <Connecting connectConfig={connectConfig} institution={{}} uiMessageVersion={4} />
    </PostMessageContext.Provider>
  )

  const { store } = render(
    <TestErrorBoundary onError={onError}>
      {webSocket ? (
        <WebSocketProvider value={webSocket}>{connecting}</WebSocketProvider>
      ) : (
        connecting
      )}
    </TestErrorBoundary>,
    {
      apiValue: {
        loadMemberByGuid: backend.loadMemberByGuid,
        loadJob: backend.loadJob,
        runJob: backend.runJob,
      } as unknown as ApiContextTypes,
      preloadedState: {
        connect: {
          currentMemberGuid: MEMBER_GUID,
          members: [member],
          jobSchedule: { isInitialized: false, jobs: [] },
          location: [],
          selectedInstitution: {},
        },
        experimentalFeatures: {
          // With websockets on, frames drive the observation and polling is effectively off.
          memberPollingMilliseconds: webSocket ? 60_000 : 10,
          optOutOfEarlyUserRelease: false,
          unavailableInstitutions: [],
          useWebSockets: !!webSocket,
        },
      },
    },
  )

  // Resolves once the widget has asked the backend to run a job and is observing the result.
  const runJobCalled = async () => {
    await waitFor(() => expect(backend.runJob).toHaveBeenCalled())
    await settle()
  }

  const currentStep = () => {
    const { location } = store.getState().connect
    return location[location.length - 1]?.step
  }

  return { onPostMessage, onError, runJobCalled, currentStep }
}

export const expectMemberConnected = (onPostMessage: ReturnType<typeof vi.fn>) =>
  waitFor(
    () =>
      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MEMBER_CONNECTED, {
        user_guid: USER_GUID,
        member_guid: MEMBER_GUID,
      }),
    { timeout: 5000 },
  )
