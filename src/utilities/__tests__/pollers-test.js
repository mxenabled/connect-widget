import {
  handlePollingResponse,
  DEFAULT_POLLING_STATE,
  CONNECTING_MESSAGES,
  pollMember,
} from 'src/utilities/pollers'
import { ErrorStatuses, ProcessingStatuses, ReadableStatuses } from 'src/const/Statuses'
import { AnalyticEvents } from 'src/const/Analytics'
import { member, JOB_DATA } from 'src/services/mockedData'
import { of } from 'rxjs'
import { take } from 'rxjs/operators'

describe('handlePollingResponse', () => {
  test('it should stop polling and update the message', () => {
    testStatus(ReadableStatuses.CHALLENGED, true, CONNECTING_MESSAGES.MFA)
  })

  test('it should keep polling and update the message', () => {
    ProcessingStatuses.forEach((status) => testStatus(status, false, CONNECTING_MESSAGES.VERIFYING))
  })

  test('should keep polling if is_being_aggregated is true', () => {
    const pollingState = {
      ...DEFAULT_POLLING_STATE,
      currentResponse: {
        member: {
          is_being_aggregated: true,
          connection_status: ReadableStatuses.CONNECTED,
        },
      },
      previousResponse: {
        member: {
          is_being_aggregated: true,
          connection_status: ReadableStatuses.CONNECTED,
        },
      },
    }

    const [stopPolling, message] = handlePollingResponse(pollingState)

    expect(stopPolling).toEqual(false)
    expect(message).toEqual(CONNECTING_MESSAGES.SYNCING)
  })

  test('should stop polling if is_being_aggregated turns to false', () => {
    const pollingState = {
      ...DEFAULT_POLLING_STATE,
      currentResponse: {
        member: {
          is_being_aggregated: false,
          connection_status: ReadableStatuses.CONNECTED,
        },
      },
      previousResponse: {
        member: {
          is_being_aggregated: true,
          connection_status: ReadableStatuses.CONNECTED,
        },
      },
    }

    const [stopPolling, message] = handlePollingResponse(pollingState)

    expect(stopPolling).toEqual(true)
    expect(message).toEqual(CONNECTING_MESSAGES.FINISHING)
  })

  describe('Error states', () => {
    it('should stop polling and show a message', () => {
      ErrorStatuses.forEach((status) => {
        // CHALLENGED state is an error state, but has specific logic
        if (status !== ReadableStatuses.CHALLENGED) {
          testStatus(status, true, CONNECTING_MESSAGES.ERROR)
        }
      })
    })

    it('should wait for aggregation to be done for error states', () => {
      ErrorStatuses.forEach((status) => {
        const pollingState = {
          ...DEFAULT_POLLING_STATE,
          currentResponse: {
            member: {
              is_being_aggregated: true,
              connection_status: status,
            },
          },
        }

        // CHALLENGED state is an error state, but has specific logic
        if (status !== ReadableStatuses.CHALLENGED) {
          const [stopPolling, message] = handlePollingResponse(pollingState)

          expect(stopPolling).toEqual(false)
          expect(message).toEqual(CONNECTING_MESSAGES.VERIFYING)
        }
      })
    })

    it('should stop polling if in error and is_being_aggregated is false twice in a row', () => {
      const pollingState = {
        ...DEFAULT_POLLING_STATE,
        previousResponse: {
          member: {
            connection_status: ReadableStatuses.PREVENTED,
            is_oauth: true,
            is_being_aggregated: false,
          },
        },
        currentResponse: {
          member: {
            connection_status: ReadableStatuses.PREVENTED,
            is_oauth: true,
            is_being_aggregated: false,
          },
        },
      }

      const [stopPolling, message] = handlePollingResponse(pollingState)

      expect(stopPolling).toEqual(true)
      expect(message).toEqual(CONNECTING_MESSAGES.ERROR)
    })
  })

  describe('OAuth status', () => {
    it('should keep polling and show the OAuth message if in error, but not finished agging', () => {
      ErrorStatuses.forEach((status) => {
        const pollingState = {
          ...DEFAULT_POLLING_STATE,
          currentResponse: {
            member: {
              connection_status: status,
              is_oauth: true,
              is_being_aggregated: false,
            },
          },
        }

        if (status !== ReadableStatuses.CHALLENGED) {
          const [stopPolling, message] = handlePollingResponse(pollingState)

          expect(message).toEqual(CONNECTING_MESSAGES.OAUTH)
          expect(stopPolling).toEqual(false)
        }
      })
    })

    it('should go to error view if we are done aggregating', () => {
      ErrorStatuses.forEach((status) => {
        const pollingState = {
          ...DEFAULT_POLLING_STATE,
          currentResponse: {
            member: {
              connection_status: status,
              is_oauth: true,
              is_being_aggregated: false,
            },
          },
          previousResponse: {
            member: {
              connection_status: status,
              is_oauth: true,
              is_being_aggregated: true,
            },
          },
        }

        if (status !== ReadableStatuses.CHALLENGED) {
          const [stopPolling, message] = handlePollingResponse(pollingState)

          expect(message).toEqual(CONNECTING_MESSAGES.ERROR)
          expect(stopPolling).toEqual(true)
        }
      })
    })
  })
})

function testStatus(status, shouldStopPolling, expectedMessage) {
  const pollingState = {
    ...DEFAULT_POLLING_STATE,
    currentResponse: { member: { connection_status: status } },
  }

  const [stopPolling, message] = handlePollingResponse(pollingState)

  expect(message).toEqual(expectedMessage)
  expect(stopPolling).toEqual(shouldStopPolling)
}

describe('pollMember', () => {
  let mockApi
  let mockOnPostMessage
  let mockSendAnalyticsEvent
  const memberGuid = member.member.guid
  const clientLocale = 'en-US'

  const createMockJob = (asyncDataReady = false) => ({
    ...JOB_DATA,
    async_account_data_ready: asyncDataReady,
  })

  const createMockMember = (overrides = {}) => ({
    ...member.member,
    ...overrides,
  })

  beforeEach(() => {
    vi.useFakeTimers()
    mockApi = {
      loadMemberByGuid: vi.fn(),
      loadJob: vi.fn(),
    }
    mockOnPostMessage = vi.fn()
    mockSendAnalyticsEvent = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('initial data ready functionality', () => {
    it('should send initial data ready event when async_account_data_ready becomes true', (done) => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJob = createMockJob(true)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValue(of(mockJob))

      const subscription = pollMember(
        memberGuid,
        mockApi,
        mockOnPostMessage,
        mockSendAnalyticsEvent,
        clientLocale,
      )
        .pipe(take(1))
        .subscribe((result) => {
          expect(result.initialDataReadySent).toBe(true)
          expect(mockOnPostMessage).toHaveBeenCalledWith('connect/initialDataReady', {
            member_guid: memberGuid,
          })
          expect(mockSendAnalyticsEvent).toHaveBeenCalledWith(AnalyticEvents.INITIAL_DATA_READY, {
            member_guid: memberGuid,
          })
          done()
        })

      vi.advanceTimersByTime(3000)
      subscription.unsubscribe()
    })

    it('should only send initial data ready event once, even on subsequent polls', (done) => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJob = createMockJob(true)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValue(of(mockJob))

      const results = []
      const subscription = pollMember(
        memberGuid,
        mockApi,
        mockOnPostMessage,
        mockSendAnalyticsEvent,
        clientLocale,
      )
        .pipe(take(3))
        .subscribe({
          next: (result) => {
            results.push(result)
          },
          complete: () => {
            expect(results[0].initialDataReadySent).toBe(true)
            // Subsequent polls should not send the event again
            expect(results[1].initialDataReadySent).toBe(true)
            expect(results[2].initialDataReadySent).toBe(true)

            expect(mockOnPostMessage).toHaveBeenCalledTimes(1)
            expect(mockSendAnalyticsEvent).toHaveBeenCalledTimes(1)
            done()
          },
        })

      // Advance timers to trigger multiple polls
      vi.advanceTimersByTime(3000) // First poll
      vi.advanceTimersByTime(3000) // Second poll
      vi.advanceTimersByTime(3000) // Third poll
      subscription.unsubscribe()
    })

    it('should not send initial data ready event when async_account_data_ready is false', (done) => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJob = createMockJob(false)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValue(of(mockJob))

      const subscription = pollMember(
        memberGuid,
        mockApi,
        mockOnPostMessage,
        mockSendAnalyticsEvent,
        clientLocale,
      )
        .pipe(take(1))
        .subscribe((result) => {
          expect(result.initialDataReadySent).toBe(false)
          expect(mockOnPostMessage).not.toHaveBeenCalled()
          expect(mockSendAnalyticsEvent).not.toHaveBeenCalled()
          done()
        })

      vi.advanceTimersByTime(3000)
      subscription.unsubscribe()
    })

    it('should not send initial data ready event when there is an error', (done) => {
      const error = new Error('API Error')
      mockApi.loadMemberByGuid.mockReturnValue(of(error))

      const subscription = pollMember(
        memberGuid,
        mockApi,
        mockOnPostMessage,
        mockSendAnalyticsEvent,
        clientLocale,
      )
        .pipe(take(1))
        .subscribe((result) => {
          expect(result.isError).toBe(true)
          expect(result.initialDataReadySent).toBe(false)
          expect(mockOnPostMessage).not.toHaveBeenCalled()
          expect(mockSendAnalyticsEvent).not.toHaveBeenCalled()
          done()
        })

      vi.advanceTimersByTime(3000)
      subscription.unsubscribe()
    })

    it('should send initial data ready event when async_account_data_ready becomes true after being false', (done) => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJobFalse = createMockJob(false)
      const mockJobTrue = createMockJob(true)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValueOnce(of(mockJobFalse)).mockReturnValueOnce(of(mockJobTrue))

      const results = []
      const subscription = pollMember(
        memberGuid,
        mockApi,
        mockOnPostMessage,
        mockSendAnalyticsEvent,
        clientLocale,
      )
        .pipe(take(2))
        .subscribe({
          next: (result) => {
            results.push(result)
          },
          complete: () => {
            expect(results[0].initialDataReadySent).toBe(false)
            // Second poll should send the event
            expect(results[1].initialDataReadySent).toBe(true)
            expect(mockOnPostMessage).toHaveBeenCalledTimes(1)
            expect(mockSendAnalyticsEvent).toHaveBeenCalledTimes(1)
            expect(mockOnPostMessage).toHaveBeenCalledWith('connect/initialDataReady', {
              member_guid: memberGuid,
            })
            expect(mockSendAnalyticsEvent).toHaveBeenCalledWith(AnalyticEvents.INITIAL_DATA_READY, {
              member_guid: memberGuid,
            })
            done()
          },
        })

      // Advance timers to trigger multiple polls
      vi.advanceTimersByTime(3000)
      vi.advanceTimersByTime(3000)
      subscription.unsubscribe()
    })
  })
})
