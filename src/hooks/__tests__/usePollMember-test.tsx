/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { usePollMember, PollingState } from 'src/hooks/usePollMember'
import { ApiProvider, ApiContextTypes } from 'src/context/ApiContext'
import { WebSocketProvider, WebSocketConnection } from 'src/context/WebSocketContext'
import { Provider } from 'react-redux'
import { createReduxStore, RootState } from 'src/redux/Store'
import { member, JOB_DATA } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { CONNECTING_MESSAGES } from 'src/utilities/pollers'
import { take } from 'rxjs/operators'
import { Subject } from 'rxjs'

const createWrapper = (
  apiValue: Partial<ApiContextTypes>,
  preloadedState?: Partial<RootState>,
  webSocketValue?: WebSocketConnection,
) => {
  const store = createReduxStore(preloadedState)
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <WebSocketProvider value={webSocketValue}>
        <ApiProvider apiValue={apiValue as any}>{children}</ApiProvider>
      </WebSocketProvider>
    </Provider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('usePollMember', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('lang', 'en')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return a pollMember function', () => {
    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    expect(result.current).toBeInstanceOf(Function)
  })

  it('should poll successfully and emit polling states with member and job data', async () => {
    const connectedMember = {
      ...member.member,
      connection_status: ReadableStatuses.CONNECTED,
      is_being_aggregated: false,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(connectedMember),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(apiValue.loadMemberByGuid).toHaveBeenCalledWith('MBR-123', 'en')
    expect(apiValue.loadJob).toHaveBeenCalledWith(connectedMember.most_recent_job_guid)
    expect(states[0]).toMatchObject({
      isError: false,
      pollingCount: 1,
      currentResponse: {
        member: connectedMember,
        job: JOB_DATA,
      },
      pollingIsDone: true,
      userMessage: CONNECTING_MESSAGES.FINISHING,
    })

    subscription.unsubscribe()
  })

  it('should handle API context not being available', async () => {
    const apiValue = {
      loadMemberByGuid: undefined,
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0]).toMatchObject({
      isError: true,
      pollingCount: 1,
      pollingIsDone: false,
    })

    subscription.unsubscribe()
  })

  it('should handle loadMemberByGuid errors gracefully', async () => {
    const apiValue = {
      loadMemberByGuid: vi.fn().mockRejectedValue(new Error('Network error')),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].isError).toBe(true)
    expect(states[0].pollingIsDone).toBe(false)

    subscription.unsubscribe()
  })

  it('should handle loadJob errors gracefully', async () => {
    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockRejectedValue(new Error('Job loading failed')),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].isError).toBe(true)

    subscription.unsubscribe()
  })

  it('should set initialDataReady when async_account_data_ready is true', async () => {
    const jobWithAsyncData = {
      ...JOB_DATA,
      async_account_data_ready: true,
    }

    const memberWithJob = {
      ...member.member,
      is_being_aggregated: false,
      connection_status: ReadableStatuses.CONNECTED,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(memberWithJob),
      loadJob: vi.fn().mockResolvedValue(jobWithAsyncData),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].initialDataReady).toBe(true)
    expect(states[0].pollingIsDone).toBe(true)
    expect(states[0].userMessage).toBe(CONNECTING_MESSAGES.FINISHING)

    subscription.unsubscribe()
  })

  it('should not set initialDataReady when optOutOfEarlyUserRelease is true', async () => {
    const jobWithAsyncData = {
      ...JOB_DATA,
      async_account_data_ready: true,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockResolvedValue(jobWithAsyncData),
    }

    const preloadedState = {
      experimentalFeatures: {
        optOutOfEarlyUserRelease: true,
        memberPollingMilliseconds: 3000,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].initialDataReady).toBe(false)

    subscription.unsubscribe()
  })

  it('should use custom polling interval when provided', async () => {
    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const preloadedState = {
      experimentalFeatures: {
        memberPollingMilliseconds: 500,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState),
    })

    const pollMember = result.current
    const subscription = pollMember('MBR-123').subscribe()

    await waitFor(
      () => {
        expect(apiValue.loadMemberByGuid).toHaveBeenCalled()
      },
      { timeout: 1000 },
    )

    subscription.unsubscribe()
  })

  it('should increment pollingCount on each poll', async () => {
    const member1 = { ...member.member, guid: 'MBR-1', most_recent_job_guid: 'JOB-1' }
    const member2 = { ...member.member, guid: 'MBR-2', most_recent_job_guid: 'JOB-2' }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValueOnce(member1).mockResolvedValue(member2),
      loadJob: vi.fn().mockImplementation((guid) => Promise.resolve({ ...JOB_DATA, guid })),
    }

    const preloadedState = {
      experimentalFeatures: {
        memberPollingMilliseconds: 1000,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(2))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThanOrEqual(2)
      },
      { timeout: 3500 },
    )

    expect(states[0].pollingCount).toBe(1)
    expect(states[1].pollingCount).toBe(2)

    subscription.unsubscribe()
  }, 10000)

  it('should show CHALLENGED status message when member is challenged', async () => {
    const challengedMember = {
      ...member.member,
      connection_status: ReadableStatuses.CHALLENGED,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(challengedMember),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].userMessage).toBe(CONNECTING_MESSAGES.MFA)
    expect(states[0].pollingIsDone).toBe(true)

    subscription.unsubscribe()
  })

  it('should continue polling when member is still being aggregated', async () => {
    const aggregatingMember = {
      ...member.member,
      connection_status: ReadableStatuses.CONNECTED,
      is_being_aggregated: true,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(aggregatingMember),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].userMessage).toBe(CONNECTING_MESSAGES.SYNCING)
    expect(states[0].pollingIsDone).toBe(false)

    subscription.unsubscribe()
  })

  it('should use client locale from html lang attribute', async () => {
    document.documentElement.setAttribute('lang', 'es')

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const subscription = pollMember('MBR-123').pipe(take(1)).subscribe()

    await waitFor(
      () => {
        expect(apiValue.loadMemberByGuid).toHaveBeenCalledWith('MBR-123', 'es')
      },
      { timeout: 4000 },
    )

    subscription.unsubscribe()
  })

  it('should only set initialDataReady once, even on subsequent polls', async () => {
    const jobWithAsyncData = {
      ...JOB_DATA,
      async_account_data_ready: true,
    }

    const member1 = {
      ...member.member,
      guid: 'MBR-1',
      most_recent_job_guid: 'JOB-1',
      is_being_aggregated: false,
      connection_status: ReadableStatuses.CONNECTED,
    }
    const member2 = { ...member1, guid: 'MBR-2', most_recent_job_guid: 'JOB-2' }
    const member3 = { ...member1, guid: 'MBR-3', most_recent_job_guid: 'JOB-3' }

    const apiValue = {
      loadMemberByGuid: vi
        .fn()
        .mockResolvedValueOnce(member1)
        .mockResolvedValueOnce(member2)
        .mockResolvedValue(member3),
      loadJob: vi.fn().mockImplementation((guid) => Promise.resolve({ ...jobWithAsyncData, guid })),
    }

    const preloadedState = {
      experimentalFeatures: {
        memberPollingMilliseconds: 800,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(3))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThanOrEqual(3)
      },
      { timeout: 3500 },
    )

    expect(states[0].initialDataReady).toBe(true)
    expect(states[1].initialDataReady).toBe(true)
    expect(states[2].initialDataReady).toBe(true)

    subscription.unsubscribe()
  }, 10000)

  it('should not set initialDataReady when async_account_data_ready is false', async () => {
    const jobWithoutAsyncData = {
      ...JOB_DATA,
      async_account_data_ready: false,
    }

    const memberWithJob = {
      ...member.member,
      is_being_aggregated: false,
      connection_status: ReadableStatuses.CONNECTED,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(memberWithJob),
      loadJob: vi.fn().mockResolvedValue(jobWithoutAsyncData),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].initialDataReady).toBe(false)

    subscription.unsubscribe()
  })

  it('should not set initialDataReady when there is an error', async () => {
    const apiValue = {
      loadMemberByGuid: vi.fn().mockRejectedValue(new Error('API Error')),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(1))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].isError).toBe(true)
    expect(states[0].initialDataReady).toBe(false)

    subscription.unsubscribe()
  })

  it('should set initialDataReady when async_account_data_ready becomes true after being false', async () => {
    const jobWithoutAsyncData = {
      ...JOB_DATA,
      async_account_data_ready: false,
    }

    const jobWithAsyncData = {
      ...JOB_DATA,
      async_account_data_ready: true,
    }

    const memberWithJob = {
      ...member.member,
      is_being_aggregated: false,
      connection_status: ReadableStatuses.CONNECTED,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(memberWithJob),
      loadJob: vi
        .fn()
        .mockResolvedValueOnce(jobWithoutAsyncData)
        .mockResolvedValue(jobWithAsyncData),
    }

    const preloadedState = {
      experimentalFeatures: {
        memberPollingMilliseconds: 1000,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(2))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThanOrEqual(2)
      },
      { timeout: 3500 },
    )

    expect(states[0].initialDataReady).toBe(false)
    expect(states[1].initialDataReady).toBe(true)

    subscription.unsubscribe()
  }, 10000)

  it('should correctly update previousResponse and currentResponse over multiple polls', async () => {
    const member1 = { ...member.member, guid: 'MBR-1', most_recent_job_guid: 'JOB-1' }
    const member2 = { ...member.member, guid: 'MBR-2', most_recent_job_guid: 'JOB-2' }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValueOnce(member1).mockResolvedValue(member2),
      loadJob: vi.fn().mockImplementation((guid) => Promise.resolve({ ...JOB_DATA, guid })),
    }

    const preloadedState = {
      experimentalFeatures: {
        memberPollingMilliseconds: 1000,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(2))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThanOrEqual(2)
      },
      { timeout: 3500 },
    )

    // First poll
    expect(states[0].previousResponse).toEqual({})
    expect(states[0].currentResponse).toEqual({
      member: member1,
      job: { ...JOB_DATA, guid: 'JOB-1' },
    })

    // Second poll
    expect(states[1].previousResponse).toEqual({
      member: member1,
      job: { ...JOB_DATA, guid: 'JOB-1' },
    })
    expect(states[1].currentResponse).toEqual({
      member: member2,
      job: { ...JOB_DATA, guid: 'JOB-2' },
    })

    subscription.unsubscribe()
  }, 10000)

  it('should preserve previousResponse and currentResponse when an intermediate poll fails', async () => {
    const member1 = { ...member.member, guid: 'MBR-1', most_recent_job_guid: 'JOB-1' }

    const apiValue = {
      loadMemberByGuid: vi
        .fn()
        .mockResolvedValueOnce(member1)
        .mockRejectedValueOnce(new Error('Intermediate Error'))
        .mockResolvedValue({ ...member1, guid: 'MBR-1-new', most_recent_job_guid: 'JOB-1-new' }),
      loadJob: vi.fn().mockImplementation((guid) => Promise.resolve({ ...JOB_DATA, guid })),
    }

    const preloadedState = {
      experimentalFeatures: {
        memberPollingMilliseconds: 1000,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123')
      .pipe(take(3))
      .subscribe((state: PollingState) => {
        states.push(state)
      })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThanOrEqual(3)
      },
      { timeout: 5000 },
    )

    // First poll: Success
    expect(states[0].isError).toBe(false)
    expect(states[0].currentResponse).toEqual({
      member: member1,
      job: { ...JOB_DATA, guid: 'JOB-1' },
    })

    // Second poll: Error
    expect(states[1].isError).toBe(true)
    expect(states[1].previousResponse).toEqual({}) // Should be preserved from acc
    expect(states[1].currentResponse).toEqual({
      member: member1,
      job: { ...JOB_DATA, guid: 'JOB-1' },
    }) // Should be preserved from acc

    // Third poll: Success again
    expect(states[2].isError).toBe(false)
    expect(states[2].previousResponse).toEqual({
      member: member1,
      job: { ...JOB_DATA, guid: 'JOB-1' },
    }) // acc.currentResponse was preserved
    expect(states[2].currentResponse).toEqual({
      member: { ...member1, guid: 'MBR-1-new', most_recent_job_guid: 'JOB-1-new' },
      job: { ...JOB_DATA, guid: 'JOB-1-new' },
    })

    subscription.unsubscribe()
  }, 10000)

  it('should receive updates from WebSockets when enabled', async () => {
    const wsMessages$ = new Subject<any>()
    const mockWS = {
      isConnected: vi.fn().mockReturnValue(true),
      webSocketMessages$: wsMessages$.asObservable(),
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const preloadedState = {
      experimentalFeatures: {
        useWebSockets: true,
        memberPollingMilliseconds: 10000, // Long interval to avoid poll interference
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState, mockWS),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123').subscribe((state: PollingState) => {
      states.push(state)
    })

    // Emit from WebSocket
    const wsMember = { guid: 'MBR-123', connection_status: 1 }
    wsMessages$.next({ event: 'members/updated', payload: wsMember })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(0)
      },
      { timeout: 4000 },
    )

    expect(states[0].currentResponse?.member).toEqual(wsMember)

    // Emit priority data ready
    wsMessages$.next({ event: 'members/priority_data_ready', payload: wsMember })

    await waitFor(
      () => {
        expect(states.length).toBeGreaterThan(1)
      },
      { timeout: 4000 },
    )

    expect(states[1].initialDataReady).toBe(true)

    subscription.unsubscribe()
  })

  it('should handle members/priority_data_ready even if payload is minimal', async () => {
    const wsMessages$ = new Subject<any>()
    const mockWS = {
      isConnected: vi.fn().mockReturnValue(true),
      webSocketMessages$: wsMessages$.asObservable(),
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const preloadedState = {
      experimentalFeatures: {
        useWebSockets: true,
        memberPollingMilliseconds: 10000,
      },
    }

    const { result } = renderHook(() => usePollMember(), {
      wrapper: createWrapper(apiValue, preloadedState, mockWS),
    })

    const pollMember = result.current
    const states: PollingState[] = []

    const subscription = pollMember('MBR-123').subscribe((state: PollingState) => {
      states.push(state)
    })

    // 1. Emit full member data
    const fullMember = { guid: 'MBR-123', connection_status: 1, most_recent_job_guid: 'JOB-123' }
    wsMessages$.next({ event: 'members/updated', payload: fullMember })

    await waitFor(() => expect(states.length).toBe(1))

    // 2. Emit priority_data_ready with minimal payload
    wsMessages$.next({ event: 'members/priority_data_ready', payload: { guid: 'MBR-123' } })

    await waitFor(() => expect(states.length).toBe(2))

    expect(states[1].initialDataReady).toBe(true)
    // Verify it used the member data from previous message
    expect(states[1].currentResponse?.member).toEqual(fullMember)

    subscription.unsubscribe()
  })
})
