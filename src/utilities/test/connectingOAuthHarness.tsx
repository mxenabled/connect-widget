import React from 'react'
import { createTestReduxStore, render, waitFor } from 'src/utilities/testingLibrary'
import { Connecting } from 'src/views/connecting/Connecting'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiContextTypes, ApiProvider } from 'src/context/ApiContext'
import { WebSocketConnection, WebSocketProvider } from 'src/context/WebSocketContext'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'

/**
 * Shared harness for driving the real <Connecting /> after OAuth against an in-memory
 * backend: a stale PENDING member, jobs firefly or the widget start, and 409s when a job is
 * already running. Used by ConnectingOAuthJobs-test and runJobSchedule-test.
 */

export const MEMBER_GUID = 'MBR-oauth'
export const USER_GUID = 'USR-1'
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

export type Job = { guid: string; job_type: number; async_account_data_ready?: boolean }

export class HttpError extends Error {
  response: { status: number }

  constructor(status: number, message = 'Request failed') {
    super(message)
    this.name = 'HttpError'
    this.response = { status }
  }
}

export const staleOAuthMember: Member = {
  guid: MEMBER_GUID,
  user_guid: USER_GUID,
  connection_status: ReadableStatuses.PENDING,
  is_being_aggregated: false,
  most_recent_job_guid: null,
  is_oauth: true,
}

export const connectedMemberRunning = (jobGuid: string): Member => ({
  ...staleOAuthMember,
  connection_status: ReadableStatuses.CONNECTED,
  is_being_aggregated: true,
  most_recent_job_guid: jobGuid,
})

export const createStore = ({ member = staleOAuthMember, useWebSockets = false } = {}) =>
  createTestReduxStore({
    connect: {
      currentMemberGuid: MEMBER_GUID,
      members: [member],
      jobSchedule: { isInitialized: false, jobs: [] },
      location: [],
      selectedInstitution: {},
    },
    experimentalFeatures: {
      // With websockets on, frames drive the observation and polling is effectively off.
      memberPollingMilliseconds: useWebSockets ? 60_000 : 10,
      optOutOfEarlyUserRelease: false,
      unavailableInstitutions: [],
      useWebSockets,
    },
  })

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
      backend.member = connectedMemberRunning(guid)
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
        // Firefly returns a 409 when the member already has a running job.
        throw new HttpError(409)
      }

      backend.startJob(`JOB-${jobType}`, jobType)

      return {}
    }),
  }

  return backend
}

export type FakeBackend = ReturnType<typeof createFakeBackend>

/**
 * Connecting throws `connectingError` during render so the host's error
 * boundary can take over. Tests need a boundary of their own to observe that.
 */
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
  backend: FakeBackend,
  connectConfig: Record<string, unknown>,
  { webSocket, member }: { webSocket?: WebSocketConnection; member?: Member } = {},
) => {
  const onPostMessage = vi.fn()
  const onError = vi.fn()
  const api = {
    loadMemberByGuid: backend.loadMemberByGuid,
    loadJob: backend.loadJob,
    runJob: backend.runJob,
  } as unknown as ApiContextTypes
  const store = createStore({ member, useWebSockets: !!webSocket })

  const connecting = (
    <ApiProvider apiValue={api}>
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <Connecting connectConfig={connectConfig} institution={{}} uiMessageVersion={4} />
      </PostMessageContext.Provider>
    </ApiProvider>
  )

  render(
    <TestErrorBoundary onError={onError}>
      {webSocket ? (
        <WebSocketProvider value={webSocket}>{connecting}</WebSocketProvider>
      ) : (
        connecting
      )}
    </TestErrorBoundary>,
    { store },
  )

  return { onPostMessage, onError, store }
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
