import {
  handlePollingResponse,
  DEFAULT_POLLING_STATE,
  CONNECTING_MESSAGES,
  pollMember,
} from 'src/utilities/pollers'
import { ErrorStatuses, ProcessingStatuses, ReadableStatuses } from 'src/const/Statuses'
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
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('initial data ready functionality', () => {
    it('should set initialDataReady flag when async_account_data_ready becomes true', async () => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJob = createMockJob(true)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValue(of(mockJob))

      const resultPromise = new Promise((resolve, reject) => {
        const subscription = pollMember(memberGuid, mockApi, clientLocale)
          .pipe(take(1))
          .subscribe({
            next: (result) => {
              subscription.unsubscribe()
              resolve(result)
            },
            error: (error) => {
              subscription.unsubscribe()
              reject(error)
            },
          })

        // Advance timers to trigger the interval
        vi.advanceTimersByTime(3000)
      })

      const result = await resultPromise
      expect(result.initialDataReady).toBe(true)
    })

    it('should NOT set initialDataReady flag when async_account_data_ready becomes true and optOutOfEarlyUserRelease is true', async () => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.SYNCING,
        is_being_aggregated: false,
      })
      const mockJob = createMockJob(true)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValue(of(mockJob))

      const resultPromise = new Promise((resolve, reject) => {
        const subscription = pollMember(memberGuid, mockApi, clientLocale, true)
          .pipe(take(1))
          .subscribe({
            next: (result) => {
              subscription.unsubscribe()
              resolve(result)
            },
            error: (error) => {
              subscription.unsubscribe()
              reject(error)
            },
          })

        // Advance timers to trigger the interval
        vi.advanceTimersByTime(3000)
      })

      const result = await resultPromise
      expect(result.initialDataReady).toBe(false)
      expect(result.pollingIsDone).toBe(false)
    })

    it('should only set initialDataReady once, even on subsequent polls', async () => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJob = createMockJob(true)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValue(of(mockJob))

      const resultPromise = new Promise((resolve) => {
        const results = []
        const subscription = pollMember(memberGuid, mockApi, clientLocale)
          .pipe(take(3))
          .subscribe({
            next: (result) => {
              results.push(result)
            },
            complete: () => {
              subscription.unsubscribe()
              resolve(results)
            },
          })

        // Advance timers to trigger multiple polls
        vi.advanceTimersByTime(3000) // First poll
        vi.advanceTimersByTime(3000) // Second poll
        vi.advanceTimersByTime(3000) // Third poll
      })

      const results = await resultPromise
      expect(results[0].initialDataReady).toBe(true)
      // Subsequent polls should maintain the flag
      expect(results[1].initialDataReady).toBe(true)
      expect(results[2].initialDataReady).toBe(true)
    })

    it('should not set initialDataReady when async_account_data_ready is false', async () => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJob = createMockJob(false)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValue(of(mockJob))

      const resultPromise = new Promise((resolve, reject) => {
        const subscription = pollMember(memberGuid, mockApi, clientLocale)
          .pipe(take(1))
          .subscribe({
            next: (result) => {
              subscription.unsubscribe()
              resolve(result)
            },
            error: (error) => {
              subscription.unsubscribe()
              reject(error)
            },
          })

        vi.advanceTimersByTime(3000)
      })

      const result = await resultPromise
      expect(result.initialDataReady).toBe(false)
    })

    it('should not set initialDataReady when there is an error', async () => {
      const error = new Error('API Error')
      mockApi.loadMemberByGuid.mockReturnValue(of(error))

      const resultPromise = new Promise((resolve, reject) => {
        const subscription = pollMember(memberGuid, mockApi, clientLocale)
          .pipe(take(1))
          .subscribe({
            next: (result) => {
              subscription.unsubscribe()
              resolve(result)
            },
            error: (error) => {
              subscription.unsubscribe()
              reject(error)
            },
          })

        vi.advanceTimersByTime(3000)
      })

      const result = await resultPromise
      expect(result.isError).toBe(true)
      expect(result.initialDataReady).toBe(false)
    })

    it('should set initialDataReady when async_account_data_ready becomes true after being false', async () => {
      const mockMember = createMockMember({
        connection_status: ReadableStatuses.CONNECTED,
        is_being_aggregated: false,
      })
      const mockJobFalse = createMockJob(false)
      const mockJobTrue = createMockJob(true)

      mockApi.loadMemberByGuid.mockReturnValue(of(mockMember))
      mockApi.loadJob.mockReturnValueOnce(of(mockJobFalse)).mockReturnValueOnce(of(mockJobTrue))

      const resultPromise = new Promise((resolve) => {
        const results = []
        const subscription = pollMember(memberGuid, mockApi, clientLocale)
          .pipe(take(2))
          .subscribe({
            next: (result) => {
              results.push(result)
            },
            complete: () => {
              subscription.unsubscribe()
              resolve(results)
            },
          })

        // Advance timers to trigger multiple polls
        vi.advanceTimersByTime(3000)
        vi.advanceTimersByTime(3000)
      })

      const results = await resultPromise
      expect(results[0].initialDataReady).toBe(false)
      // Second poll should set the flag
      expect(results[1].initialDataReady).toBe(true)
    })
  })
})
