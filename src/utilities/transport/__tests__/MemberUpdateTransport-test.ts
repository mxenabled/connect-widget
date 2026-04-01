/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'
import { take } from 'rxjs/operators'
import { Subject } from 'rxjs'
import {
  createMemberUpdateTransport,
  MemberUpdate,
} from 'src/utilities/transport/MemberUpdateTransport'

describe('MemberUpdateTransport', () => {
  const mockMemberGuid = 'MBR-123'
  const mockClientLocale = 'en'
  const mockMember = { most_recent_job_guid: 'JOB-123', guid: mockMemberGuid }
  const mockJob = { guid: 'JOB-123', status: 'COMPLETED' }

  let mockApi: {
    loadMemberByGuid: ReturnType<typeof vi.fn>
    loadJob: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockApi = {
      loadMemberByGuid: vi.fn().mockResolvedValue(mockMember),
      loadJob: vi.fn().mockResolvedValue(mockJob),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should emit a member and job update after the polling interval', async () => {
    const transport$ = createMemberUpdateTransport(mockApi, mockMemberGuid, {
      pollingInterval: 1000,
      clientLocale: mockClientLocale,
    })

    const results: (MemberUpdate | Error)[] = []

    const subscription = transport$.pipe(take(1)).subscribe((val) => {
      results.push(val)
    })

    // Fast-forward past the first interval
    await vi.advanceTimersByTimeAsync(1000)

    expect(mockApi.loadMemberByGuid).toHaveBeenCalledWith(mockMemberGuid, mockClientLocale)
    expect(mockApi.loadJob).toHaveBeenCalledWith('JOB-123')
    expect(results).toEqual([{ member: mockMember, job: mockJob }])

    subscription.unsubscribe()
  })

  it('should continue emitting updates on each interval when data changes', async () => {
    const transport$ = createMemberUpdateTransport(mockApi, mockMemberGuid, {
      pollingInterval: 1000,
      clientLocale: mockClientLocale,
    })

    const results: (MemberUpdate | Error)[] = []

    const subscription = transport$.subscribe((val) => {
      results.push(val)
    })

    // Fast-forward 1 interval
    await vi.advanceTimersByTimeAsync(1000)
    expect(results).toHaveLength(1)

    // Change the mock to return a different status
    mockApi.loadMemberByGuid.mockResolvedValue({ ...mockMember, connection_status: 1 })
    await vi.advanceTimersByTimeAsync(1000)
    expect(results).toHaveLength(2)

    // Change it back
    mockApi.loadMemberByGuid.mockResolvedValue(mockMember)
    await vi.advanceTimersByTimeAsync(1000)
    expect(results).toHaveLength(3)

    expect(mockApi.loadMemberByGuid).toHaveBeenCalledTimes(3)
    expect(mockApi.loadJob).toHaveBeenCalledTimes(3)

    subscription.unsubscribe()
  })

  it('should emit an error if loadMemberByGuid fails', async () => {
    const error = new Error('Network error loading member')
    mockApi.loadMemberByGuid.mockRejectedValue(error)

    const transport$ = createMemberUpdateTransport(mockApi, mockMemberGuid, {
      pollingInterval: 1000,
      clientLocale: mockClientLocale,
    })

    const results: (MemberUpdate | Error)[] = []

    const subscription = transport$.pipe(take(1)).subscribe((val) => {
      results.push(val)
    })

    await vi.advanceTimersByTimeAsync(1000)

    expect(mockApi.loadMemberByGuid).toHaveBeenCalledWith(mockMemberGuid, mockClientLocale)
    expect(mockApi.loadJob).not.toHaveBeenCalled() // Should not be called if member fails
    expect(results).toEqual([error])

    subscription.unsubscribe()
  })

  it('should emit an error if loadJob fails', async () => {
    const error = new Error('Network error loading job')
    mockApi.loadJob.mockRejectedValue(error)

    const transport$ = createMemberUpdateTransport(mockApi, mockMemberGuid, {
      pollingInterval: 1000,
      clientLocale: mockClientLocale,
    })

    const results: (MemberUpdate | Error)[] = []

    const subscription = transport$.pipe(take(1)).subscribe((val) => {
      results.push(val)
    })

    await vi.advanceTimersByTimeAsync(1000)

    expect(mockApi.loadMemberByGuid).toHaveBeenCalledWith(mockMemberGuid, mockClientLocale)
    expect(mockApi.loadJob).toHaveBeenCalledWith('JOB-123')
    expect(results).toEqual([error])

    subscription.unsubscribe()
  })

  it('should use default options if not provided', async () => {
    const transport$ = createMemberUpdateTransport(mockApi, mockMemberGuid)

    const results: (MemberUpdate | Error)[] = []

    const subscription = transport$.pipe(take(1)).subscribe((val) => {
      results.push(val)
    })

    // Default interval is 3000
    await vi.advanceTimersByTimeAsync(3000)

    expect(mockApi.loadMemberByGuid).toHaveBeenCalledWith(mockMemberGuid, 'en')
    expect(results).toHaveLength(1)

    subscription.unsubscribe()
  })

  it('should emit WebSocket updates immediately when enabled', async () => {
    const wsMessages$ = new Subject<any>()
    const mockWS = {
      isConnected: vi.fn().mockReturnValue(true),
      webSocketMessages$: wsMessages$.asObservable(),
    }

    const transport$ = createMemberUpdateTransport(
      mockApi,
      mockMemberGuid,
      { useWebSockets: true },
      mockWS,
    )

    const results: (MemberUpdate | Error)[] = []
    const subscription = transport$.subscribe((val) => {
      results.push(val)
    })

    const wsMember = { guid: mockMemberGuid, connection_status: 1 }
    wsMessages$.next({ topic: 'members/updated', data: wsMember })

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      member: wsMember,
      job: { async_account_data_ready: undefined, guid: undefined },
    })

    subscription.unsubscribe()
  })

  it('should signal async_account_data_ready when members/priority_data_ready is received', async () => {
    const wsMessages$ = new Subject<any>()
    const mockWS = {
      isConnected: vi.fn().mockReturnValue(true),
      webSocketMessages$: wsMessages$.asObservable(),
    }

    const transport$ = createMemberUpdateTransport(
      mockApi,
      mockMemberGuid,
      { useWebSockets: true },
      mockWS,
    )

    const results: (MemberUpdate | Error)[] = []
    const subscription = transport$.subscribe((val) => {
      results.push(val)
    })

    const wsMember = { guid: mockMemberGuid, connection_status: 1 }
    wsMessages$.next({ topic: 'members/priority_data_ready', data: wsMember })

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      member: wsMember,
      job: { async_account_data_ready: true },
    })

    subscription.unsubscribe()
  })

  it('should deduplicate identical updates from polling and WebSockets', async () => {
    const wsMessages$ = new Subject<any>()
    const mockWS = {
      isConnected: vi.fn().mockReturnValue(true),
      webSocketMessages$: wsMessages$.asObservable(),
    }

    // Configure polling to return same data
    const jobWithGuid = { ...mockJob, guid: 'JOB-123' }
    mockApi.loadMemberByGuid.mockResolvedValue(mockMember)
    mockApi.loadJob.mockResolvedValue(jobWithGuid)

    const transport$ = createMemberUpdateTransport(
      mockApi,
      mockMemberGuid,
      { useWebSockets: true, pollingInterval: 1000 },
      mockWS,
    )

    const results: (MemberUpdate | Error)[] = []
    const subscription = transport$.subscribe((val) => {
      results.push(val)
    })

    // 1. Trigger first poll
    await vi.advanceTimersByTimeAsync(1000)
    expect(results).toHaveLength(1)

    // 2. Emit identical data from WebSocket
    wsMessages$.next({ topic: 'members/updated', data: mockMember })
    expect(results).toHaveLength(1) // Still 1

    // 3. Trigger second poll
    await vi.advanceTimersByTimeAsync(1000)
    expect(results).toHaveLength(1)

    // 4. Emit a DIFFERENT update from WebSocket
    const updatedMember = { ...mockMember, connection_status: 3 }
    wsMessages$.next({ topic: 'members/updated', data: updatedMember })

    expect(results).toHaveLength(2)
    expect((results[1] as MemberUpdate).member?.connection_status).toBe(3)

    subscription.unsubscribe()
  })
})
