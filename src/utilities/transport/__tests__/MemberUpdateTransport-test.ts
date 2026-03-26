import { vi } from 'vitest'
import { take } from 'rxjs/operators'
import { createMemberUpdateTransport, MemberUpdate } from '../MemberUpdateTransport'

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

  it('should continue emitting updates on each interval', async () => {
    const transport$ = createMemberUpdateTransport(mockApi, mockMemberGuid, {
      pollingInterval: 1000,
      clientLocale: mockClientLocale,
    })

    const results: (MemberUpdate | Error)[] = []

    const subscription = transport$.subscribe((val) => {
      results.push(val)
    })

    // Fast-forward 3 intervals
    await vi.advanceTimersByTimeAsync(3000)

    expect(mockApi.loadMemberByGuid).toHaveBeenCalledTimes(3)
    expect(mockApi.loadJob).toHaveBeenCalledTimes(3)
    expect(results).toHaveLength(3)

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
})
