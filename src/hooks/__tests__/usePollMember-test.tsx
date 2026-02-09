import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { usePollMember } from 'src/hooks/usePollMember'
import { ApiProvider } from 'src/context/ApiContext'
import { Provider } from 'react-redux'
import { createReduxStore } from 'src/redux/Store'
import { member, JOB_DATA } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { CONNECTING_MESSAGES } from 'src/utilities/pollers'
import { take } from 'rxjs/operators'

interface PollingState {
  isError: boolean
  pollingCount: number
  currentResponse?: unknown
  pollingIsDone: boolean
  userMessage?: string
  initialDataReady?: boolean
}

interface ApiValue {
  loadMemberByGuid?: (guid: string, locale: string) => Promise<unknown>
  loadJob?: (jobGuid: string) => Promise<unknown>
}

interface PreloadedState {
  experimentalFeatures?: {
    optOutOfEarlyUserRelease?: boolean
    memberPollingMilliseconds?: number
  }
}

const createWrapper = (apiValue: ApiValue, preloadedState?: PreloadedState) => {
  const store = createReduxStore(preloadedState)
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ApiProvider apiValue={apiValue as any}>{children}</ApiProvider>
    </Provider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('usePollMember', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('lang', 'en')
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
    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
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

    const memberWithJob = {
      ...member.member,
      is_being_aggregated: false,
      connection_status: ReadableStatuses.CONNECTED,
    }

    const apiValue = {
      loadMemberByGuid: vi.fn().mockResolvedValue(memberWithJob),
      loadJob: vi.fn().mockResolvedValue(jobWithAsyncData),
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
})
