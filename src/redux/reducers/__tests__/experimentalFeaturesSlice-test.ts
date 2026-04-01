import { describe, it, expect } from 'vitest'
import reducer, { initialState, loadExperimentalFeatures } from '../experimentalFeaturesSlice'

describe('experimentalFeaturesSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle loadExperimentalFeatures', () => {
    const payload = {
      unavailableInstitutions: [{ guid: '123', name: 'Test' }],
      optOutOfEarlyUserRelease: true,
      memberPollingMilliseconds: 5000,
      useWebSockets: true,
    }
    const nextState = reducer(initialState, loadExperimentalFeatures(payload))
    expect(nextState.unavailableInstitutions).toEqual(payload.unavailableInstitutions)
    expect(nextState.optOutOfEarlyUserRelease).toBe(true)
    expect(nextState.memberPollingMilliseconds).toBe(5000)
    expect(nextState.useWebSockets).toBe(true)
  })

  it('should default useWebSockets to false if not provided', () => {
    const payload = {}
    const nextState = reducer(initialState, loadExperimentalFeatures(payload))
    expect(nextState.useWebSockets).toBe(false)
  })
})
