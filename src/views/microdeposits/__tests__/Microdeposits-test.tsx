import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { of } from 'rxjs'
import { waitFor } from '@testing-library/react'

import {
  Microdeposits as MicrodepositsComponent,
  VIEWS,
} from 'src/views/microdeposits/Microdeposits'
import { render, screen } from 'src/utilities/testingLibrary'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'

interface MicrodepositsProps {
  microdepositGuid?: string
  stepToIAV: () => void
}

const Microdeposits = MicrodepositsComponent as React.ForwardRefExoticComponent<
  MicrodepositsProps &
    React.RefAttributes<{ handleBackButton: () => void; showBackButton: () => boolean }>
>

interface Microdeposit {
  guid?: string
  status?: number
  account_number?: string
  routing_number?: string
  account_type?: number
  first_name?: string
  last_name?: string
  email?: string
}

describe('Microdeposits', () => {
  let onPostMessage: ReturnType<typeof vi.fn>
  const stepToIAV = vi.fn()

  const createMicrodeposit = (overrides: Partial<Microdeposit> = {}): Microdeposit => ({
    guid: 'MD-123',
    status: MicrodepositsStatuses.INITIATED,
    account_number: '1234567890',
    routing_number: '987654321',
    account_type: 0,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    ...overrides,
  })

  const defaultProps: MicrodepositsProps = {
    stepToIAV,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    onPostMessage = vi.fn()
  })

  describe('Initial Load Without GUID', () => {
    it('navigates to routing number view after loading without GUID', async () => {
      const postMessageValue = { onPostMessage }

      render(
        <PostMessageContext.Provider value={postMessageValue}>
          <Microdeposits {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      await waitFor(() => {
        expect(screen.getByText(/enter routing number/i)).toBeInTheDocument()
      })
    })

    it('posts loaded message with routing number as initial step', async () => {
      const postMessageValue = { onPostMessage }

      render(
        <PostMessageContext.Provider value={postMessageValue}>
          <Microdeposits {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      await waitFor(() => {
        expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/loaded', {
          initial_step: VIEWS.ROUTING_NUMBER,
        })
      })
    })

    it('renders PrivateAndSecure component', async () => {
      const postMessageValue = { onPostMessage }

      render(
        <PostMessageContext.Provider value={postMessageValue}>
          <Microdeposits {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      await waitFor(() => {
        expect(screen.getByText(/private and secure/i)).toBeInTheDocument()
      })
    })
  })

  describe('Initial Load With GUID', () => {
    it('shows loading state when microdeposit GUID is provided', () => {
      const microdeposit = createMicrodeposit({ status: MicrodepositsStatuses.INITIATED })
      const loadMicrodepositByGuid = vi.fn(() => of(microdeposit))
      const refreshMicrodepositStatus = vi.fn(() => of({}))

      const apiValue = {
        ...apiValueMock,
        loadMicrodepositByGuid,
        refreshMicrodepositStatus,
      }

      const postMessageValue = { onPostMessage }

      render(
        <PostMessageContext.Provider value={postMessageValue}>
          <ApiProvider apiValue={apiValue as unknown as typeof apiValueMock}>
            <Microdeposits {...defaultProps} microdepositGuid="MD-123" />
          </ApiProvider>
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      const spinner = document.querySelector('[data-ui-test="kyper-spinner"]')
      expect(spinner).toBeInTheDocument()
    })

    it('renders PrivateAndSecure during loading', () => {
      const microdeposit = createMicrodeposit({ status: MicrodepositsStatuses.INITIATED })
      const loadMicrodepositByGuid = vi.fn(() => of(microdeposit))
      const refreshMicrodepositStatus = vi.fn(() => of({}))

      const apiValue = {
        ...apiValueMock,
        loadMicrodepositByGuid,
        refreshMicrodepositStatus,
      }

      const postMessageValue = { onPostMessage }

      render(
        <PostMessageContext.Provider value={postMessageValue}>
          <ApiProvider apiValue={apiValue as unknown as typeof apiValueMock}>
            <Microdeposits {...defaultProps} microdepositGuid="MD-123" />
          </ApiProvider>
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText(/private and secure/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('renders PrivateAndSecure component even during loading', () => {
      const microdeposit = createMicrodeposit({ status: MicrodepositsStatuses.INITIATED })
      const loadMicrodepositByGuid = vi.fn(() => of(microdeposit))
      const refreshMicrodepositStatus = vi.fn(() => of({}))

      const apiValue = {
        ...apiValueMock,
        loadMicrodepositByGuid,
        refreshMicrodepositStatus,
      }

      render(
        <ApiProvider apiValue={apiValue as unknown as typeof apiValueMock}>
          <Microdeposits {...defaultProps} microdepositGuid="MD-123" />
        </ApiProvider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText(/private and secure/i)).toBeInTheDocument()
    })
  })

  describe('View Rendering', () => {
    it('always renders PrivateAndSecure component regardless of view', async () => {
      const postMessageValue = { onPostMessage }

      render(
        <PostMessageContext.Provider value={postMessageValue}>
          <Microdeposits {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      await waitFor(() => {
        expect(screen.getByText(/enter routing number/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/private and secure/i)).toBeInTheDocument()
    })
  })
})
