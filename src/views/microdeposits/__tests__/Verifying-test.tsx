import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { Verifying } from 'src/views/microdeposits/Verifying'
import { render, screen } from 'src/utilities/testingLibrary'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

interface Microdeposit {
  guid: string
  status?: string | number
  account_name?: string
}

interface VerifyingProps {
  microdeposit: Microdeposit
  onError: (microdeposit: Microdeposit) => void
  onSuccess: (microdeposit: Microdeposit) => void
}

describe('Verifying', () => {
  let defaultProps: VerifyingProps
  let apiValue: typeof apiValueMock

  beforeEach(() => {
    vi.mocked(fadeOut).mockClear()
    apiValue = {
      ...apiValueMock,
      refreshMicrodepositStatus: vi.fn(() => Promise.resolve({})),
      loadMicrodepositByGuid: vi.fn(() =>
        Promise.resolve({
          status: MicrodepositsStatuses.DEPOSITED,
        }),
      ),
    } as unknown as typeof apiValueMock

    defaultProps = {
      microdeposit: {
        guid: 'MD-123',
        status: MicrodepositsStatuses.DEPOSITED,
      },
      onError: vi.fn(),
      onSuccess: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the verifying header', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByText('Verifying ...')).toBeInTheDocument()
    })

    it('renders the checking amounts message', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByTestId('checking-amounts-paragraph')).toHaveTextContent(
        'Checking microdeposit amounts.',
      )
    })

    it('renders loading spinner', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      const spinner = document.querySelector('[data-ui-test="kyper-spinner"]')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('API Calls on Mount', () => {
    it('calls refreshMicrodepositStatus on mount', async () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(() => {
        expect(apiValue.refreshMicrodepositStatus).toHaveBeenCalledWith('MD-123')
      })
    })

    it('calls refreshMicrodepositStatus with correct guid', async () => {
      const propsWithDifferentGuid = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-789',
          status: MicrodepositsStatuses.DEPOSITED,
        },
      }
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...propsWithDifferentGuid} />
        </ApiProvider>,
      )

      await waitFor(() => {
        expect(apiValue.refreshMicrodepositStatus).toHaveBeenCalledWith('MD-789')
      })
    })

    it('starts polling loadMicrodepositByGuid after refresh', async () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(apiValue.loadMicrodepositByGuid).toHaveBeenCalledWith('MD-123')
        },
        { timeout: 5000 },
      )
    })
  })

  describe('Success Flow', () => {
    it('calls fadeOut animation when status becomes VERIFIED', async () => {
      const apiValueWithVerified = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() =>
          Promise.resolve({
            status: MicrodepositsStatuses.VERIFIED,
          }),
        ),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithVerified}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'down')
        },
        { timeout: 5000 },
      )
    })

    it('calls onSuccess with microdeposit after fadeOut completes', async () => {
      const verifiedMicrodeposit = {
        guid: 'MD-123',
        status: MicrodepositsStatuses.VERIFIED,
        account_name: 'Test Account',
      }
      const apiValueWithVerified = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() => Promise.resolve(verifiedMicrodeposit)),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithVerified}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(defaultProps.onSuccess).toHaveBeenCalledWith(verifiedMicrodeposit)
        },
        { timeout: 5000 },
      )
    })

    it('does not call onError when status is VERIFIED', async () => {
      const apiValueWithVerified = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() =>
          Promise.resolve({
            status: MicrodepositsStatuses.VERIFIED,
          }),
        ),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithVerified}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(defaultProps.onSuccess).toHaveBeenCalled()
        },
        { timeout: 5000 },
      )

      expect(defaultProps.onError).not.toHaveBeenCalled()
    })
  })

  describe('Error Flow', () => {
    it('calls fadeOut animation when status is DENIED', async () => {
      const apiValueWithDenied = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() =>
          Promise.resolve({
            status: MicrodepositsStatuses.DENIED,
          }),
        ),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithDenied}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'down')
        },
        { timeout: 5000 },
      )
    })

    it('calls onError with microdeposit when status is DENIED', async () => {
      const deniedMicrodeposit = {
        guid: 'MD-123',
        status: MicrodepositsStatuses.DENIED,
      }
      const apiValueWithDenied = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() => Promise.resolve(deniedMicrodeposit)),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithDenied}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(defaultProps.onError).toHaveBeenCalledWith(deniedMicrodeposit)
        },
        { timeout: 5000 },
      )
    })

    it('calls onError when status is PREVENTED', async () => {
      const preventedMicrodeposit = {
        guid: 'MD-123',
        status: MicrodepositsStatuses.PREVENTED,
      }
      const apiValueWithPrevented = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() => Promise.resolve(preventedMicrodeposit)),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithPrevented}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(defaultProps.onError).toHaveBeenCalledWith(preventedMicrodeposit)
        },
        { timeout: 5000 },
      )
    })

    it('calls onError when status is REJECTED', async () => {
      const rejectedMicrodeposit = {
        guid: 'MD-123',
        status: MicrodepositsStatuses.REJECTED,
      }
      const apiValueWithRejected = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() => Promise.resolve(rejectedMicrodeposit)),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithRejected}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(defaultProps.onError).toHaveBeenCalledWith(rejectedMicrodeposit)
        },
        { timeout: 5000 },
      )
    })

    it('calls onError when status is ERRORED', async () => {
      const erroredMicrodeposit = {
        guid: 'MD-123',
        status: MicrodepositsStatuses.ERRORED,
      }
      const apiValueWithErrored = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() => Promise.resolve(erroredMicrodeposit)),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithErrored}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(defaultProps.onError).toHaveBeenCalledWith(erroredMicrodeposit)
        },
        { timeout: 5000 },
      )
    })

    it('does not call onSuccess when status is an error status', async () => {
      const apiValueWithDenied = {
        ...apiValue,
        loadMicrodepositByGuid: vi.fn(() =>
          Promise.resolve({
            status: MicrodepositsStatuses.DENIED,
          }),
        ),
      } as unknown as typeof apiValueMock

      render(
        <ApiProvider apiValue={apiValueWithDenied}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      await waitFor(
        () => {
          expect(defaultProps.onError).toHaveBeenCalled()
        },
        { timeout: 5000 },
      )

      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic heading for title', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      const heading = screen.getByRole('heading', { name: 'Verifying ...' })
      expect(heading.tagName).toBe('H2')
    })

    it('renders descriptive loading message', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <Verifying {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByText('Checking microdeposit amounts.')).toBeInTheDocument()
    })
  })
})
