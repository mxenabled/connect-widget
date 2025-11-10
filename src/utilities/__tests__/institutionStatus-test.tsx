/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import {
  InstitutionStatus,
  useInstitutionStatusMessage,
  useInstitutionStatus,
  getInstitutionStatus,
} from '../institutionStatus'
import * as institutionBlocks from '../institutionBlocks'
import { Provider } from 'react-redux'

// Mock dependencies
vi.mock('../institutionBlocks', () => ({
  institutionIsBlockedForCostReasons: vi.fn(),
}))

vi.mock('src/utilities/Intl', () => ({
  __: vi.fn((key: string, ...args: any[]) => {
    if (args.length > 0) {
      return key.replace(
        /%(\d+)/g,
        (match: string, num: string) => args[parseInt(num) - 1] || match,
      )
    }
    return key
  }),
}))
// Mock store setup
// Mock store setup
const createMockStore = (unavailableInstitutions: any = []) => {
  return configureStore({
    reducer: {
      experimentalFeatures: (state = { unavailableInstitutions }) => state,
    },
  })
}

const wrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>{children}</Provider>
)

describe('institutionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getInstitutionStatus', () => {
    it('returns OPERATIONAL when institution is null', () => {
      const result = getInstitutionStatus(null, [])
      expect(result).toBe(InstitutionStatus.OPERATIONAL)
    })

    it('returns OPERATIONAL when unavailableInstitutions is not an array', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const result = getInstitutionStatus(institution, null as any)
      expect(result).toBe(InstitutionStatus.OPERATIONAL)
    })

    it('returns CLIENT_BLOCKED_FOR_FEES when institution is blocked for cost reasons', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      vi.mocked(institutionBlocks.institutionIsBlockedForCostReasons).mockReturnValue(true)

      const result = getInstitutionStatus(institution, [])
      expect(result).toBe(InstitutionStatus.CLIENT_BLOCKED_FOR_FEES)
    })

    it('returns UNAVAILABLE when institution is in unavailableInstitutions by guid', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const unavailableInstitutions = [{ guid: 'test-guid', name: 'Other Bank' }]
      vi.mocked(institutionBlocks.institutionIsBlockedForCostReasons).mockReturnValue(false)

      const result = getInstitutionStatus(institution, unavailableInstitutions)
      expect(result).toBe(InstitutionStatus.UNAVAILABLE)
    })

    it('returns UNAVAILABLE when institution is in unavailableInstitutions by name', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const unavailableInstitutions = [{ guid: 'other-guid', name: 'Test Bank' }]
      vi.mocked(institutionBlocks.institutionIsBlockedForCostReasons).mockReturnValue(false)

      const result = getInstitutionStatus(institution, unavailableInstitutions)
      expect(result).toBe(InstitutionStatus.UNAVAILABLE)
    })

    it('returns OPERATIONAL when institution is not blocked or unavailable', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const unavailableInstitutions = [{ guid: 'other-guid', name: 'Other Bank' }]
      vi.mocked(institutionBlocks.institutionIsBlockedForCostReasons).mockReturnValue(false)

      const result = getInstitutionStatus(institution, unavailableInstitutions)
      expect(result).toBe(InstitutionStatus.OPERATIONAL)
    })
  })

  describe('useInstitutionStatus', () => {
    it('returns institution status using redux state', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const unavailableInstitutions = [{ guid: 'test-guid', name: 'Test Bank' }]
      const store = createMockStore(unavailableInstitutions)

      const { result } = renderHook(() => useInstitutionStatus(institution), {
        wrapper: ({ children }) => wrapper({ children, store }),
      })

      expect(result.current).toBe(InstitutionStatus.UNAVAILABLE)
    })

    it('handles null institution', () => {
      const store = createMockStore([])

      const { result } = renderHook(() => useInstitutionStatus(null), {
        wrapper: ({ children }) => wrapper({ children, store }),
      })

      expect(result.current).toBe(InstitutionStatus.OPERATIONAL)
    })
  })

  describe('useInstitutionStatusMessage', () => {
    it('throws error when institution is missing required fields', () => {
      const store = createMockStore([])
      const institution = { guid: '', name: '' }

      expect(() => {
        renderHook(() => useInstitutionStatusMessage(institution), {
          wrapper: ({ children }) => wrapper({ children, store }),
        })
      }).toThrow('Selected institution is not defined or missing name and guid')
    })

    it('throws error when unavailableInstitutions is not an array', () => {
      const store = createMockStore(null)
      const institution = { guid: 'test-guid', name: 'Test Bank' }

      expect(() => {
        renderHook(() => useInstitutionStatusMessage(institution), {
          wrapper: ({ children }) => wrapper({ children, store }),
        })
      }).toThrow('Experimental feature unavailableInstitutions is not defined or not an array')
    })

    it('returns fee-related message for CLIENT_BLOCKED_FOR_FEES status', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const store = createMockStore([])
      vi.mocked(institutionBlocks.institutionIsBlockedForCostReasons).mockReturnValue(true)

      const { result } = renderHook(() => useInstitutionStatusMessage(institution), {
        wrapper: ({ children }) => wrapper({ children, store }),
      })

      expect(result.current).toEqual({
        title: 'Free Test Bank Connections Are No Longer Available',
        body: 'Test Bank now charges a fee for us to access your account data. To avoid passing that cost on to you, we no longer support Test Bank connections.',
      })
    })

    it('returns unavailable message for UNAVAILABLE status', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const unavailableInstitutions = [{ guid: 'test-guid', name: 'Test Bank' }]
      const store = createMockStore(unavailableInstitutions)
      vi.mocked(institutionBlocks.institutionIsBlockedForCostReasons).mockReturnValue(false)

      const { result } = renderHook(() => useInstitutionStatusMessage(institution), {
        wrapper: ({ children }) => wrapper({ children, store }),
      })

      expect(result.current).toEqual({
        title: 'Connection not supported by Test Bank',
        body: "Test Bank currently limits how your data can be shared. We'll enable this connection once Test Bank opens access.",
      })
    })

    it('returns empty message for OPERATIONAL status', () => {
      const institution = { guid: 'test-guid', name: 'Test Bank' }
      const store = createMockStore([])
      vi.mocked(institutionBlocks.institutionIsBlockedForCostReasons).mockReturnValue(false)

      const { result } = renderHook(() => useInstitutionStatusMessage(institution), {
        wrapper: ({ children }) => wrapper({ children, store }),
      })

      expect(result.current).toEqual({
        title: '',
        body: '',
      })
    })
  })
})
