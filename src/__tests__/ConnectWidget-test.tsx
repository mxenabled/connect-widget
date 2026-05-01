import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Subject } from 'rxjs'
import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConnectWidgetWithoutReduxProvider } from '../ConnectWidget'
import { render, screen, waitFor, createTestReduxStore } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { member, JOB_DATA, OAUTH_STATE, initialState, masterData } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { STEPS } from 'src/const/Connect'

// Mock react-confetti to avoid Canvas issues in JSDOM
vi.mock('react-confetti', () => ({
  default: () => <div data-test="confetti" />,
}))

describe('ConnectWidget', () => {
  const defaultProps = {
    clientConfig: {},
    profiles: {},
    userFeatures: {},
    language: { locale: 'en', localizedContent: {} },
  }

  let activeStore = createTestReduxStore()

  beforeEach(() => {
    // Reset the active store before each test
    activeStore = createTestReduxStore()
  })

  it('renders the real Connect widget and handles WebSocket messages correctly', async () => {
    const webSocketMessages$ = new Subject()
    const mockWS = {
      isConnected: vi.fn().mockReturnValue(true),
      webSocketMessages$,
    }

    const aggregatingMember = {
      ...member.member,
      is_being_aggregated: true,
      connection_status: ReadableStatuses.CREATED,
    }

    const mockApiValue = {
      ...apiValueMock,
      loadMemberByGuid: vi.fn().mockResolvedValue(aggregatingMember),
      loadJob: vi.fn().mockResolvedValue(JOB_DATA),
    }

    const onSuccessfulAggregation = vi.fn()
    const clientConfig = { mode: 'aggregation', current_member_guid: 'MBR-123' }

    render(
      <ConnectWidgetWithoutReduxProvider
        {...defaultProps}
        clientConfig={clientConfig}
        experimentalFeatures={{ useWebSockets: true }}
        onSuccessfulAggregation={onSuccessfulAggregation}
        webSocketConnection={mockWS}
      />,
      { apiValue: mockApiValue, store: activeStore },
    )

    // The widget should enter the Connecting state
    expect(await screen.findByText(/Connecting to/i)).toBeInTheDocument()

    // Send a WebSocket message indicating the member finished aggregating successfully
    const successMember = {
      ...aggregatingMember,
      is_being_aggregated: false,
      connection_status: ReadableStatuses.CONNECTED,
    }

    act(() => {
      webSocketMessages$.next({
        event: 'members/updated',
        payload: successMember,
      })
    })

    // The widget should receive the update and trigger the success callback (by mounting Connected view)
    await waitFor(() => {
      expect(onSuccessfulAggregation).toHaveBeenCalledWith(
        expect.objectContaining({ guid: 'MBR-123' }),
      )
    })
  })

  it('handles OAuth migration flow where member GUID changes', async () => {
    const oldMember = {
      ...member.member,
      guid: 'MBR-OLD',
      is_oauth: true,
      connection_status: ReadableStatuses.DENIED,
    }
    const newMember = { ...member.member, guid: 'MBR-NEW', is_oauth: true, name: 'New Member' }

    const loadOAuthStates = vi
      .fn()
      .mockResolvedValue([{ ...OAUTH_STATE.oauth_state, guid: 'OAS-123', auth_status: 1 }])
    const loadOAuthState = vi.fn().mockResolvedValue({
      ...OAUTH_STATE.oauth_state,
      guid: 'OAS-123',
      auth_status: 2,
      inbound_member_guid: 'MBR-NEW',
    })
    const loadMemberByGuid = vi.fn().mockImplementation((guid) => {
      if (guid === 'MBR-OLD') return Promise.resolve(oldMember)
      if (guid === 'MBR-NEW') return Promise.resolve(newMember)
      return Promise.resolve({})
    })

    const mockApiValue = {
      ...apiValueMock,
      loadOAuthStates,
      loadOAuthState,
      loadMemberByGuid,
    }

    const clientConfig = { mode: 'aggregation', current_member_guid: 'MBR-OLD' }

    const preloadedState = {
      profiles: initialState.profiles,
      connect: {
        ...initialState.connect,
        members: [oldMember],
        currentMemberGuid: 'MBR-OLD',
        location: [{ step: STEPS.ENTER_CREDENTIALS }], // Start at OAuth Step
      },
    }

    // Create a new store with preloaded state
    activeStore = createTestReduxStore(preloadedState)

    render(
      <ConnectWidgetWithoutReduxProvider
        {...defaultProps}
        clientConfig={clientConfig}
        profiles={masterData}
      />,
      {
        apiValue: mockApiValue,
        store: activeStore,
      },
    )

    // Verify we are on OAuth Step
    expect(await screen.findByText(/Log in at/i)).toBeInTheDocument()

    // Click continue to start waiting for OAuth
    const loginButton = await screen.findByTestId('continue-button')
    await userEvent.click(loginButton)

    // Now it should be in WaitingForOAuth, then finish polling, then fetch new member, then go to Connecting
    expect(await screen.findByText(/Waiting for permission/i)).toBeInTheDocument()

    // Verify it transitions to Connecting with the NEW GUID
    await waitFor(
      () => {
        expect(screen.getByText(/Connecting to/i)).toBeInTheDocument()
        const state = activeStore.getState()
        expect(state.connect.currentMemberGuid).toBe('MBR-NEW')
        expect(state.connect.members).toContainEqual(newMember)
      },
      { timeout: 15000 },
    )
  }, 35000)
})
