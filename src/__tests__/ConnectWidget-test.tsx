import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { Subject } from 'rxjs'
import { act } from '@testing-library/react'

import { ConnectWidget } from '../ConnectWidget'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { member, JOB_DATA } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'

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
      <ConnectWidget
        {...defaultProps}
        clientConfig={clientConfig}
        experimentalFeatures={{ useWebSockets: true }}
        onSuccessfulAggregation={onSuccessfulAggregation}
        webSocketConnection={mockWS}
      />,
      { apiValue: mockApiValue },
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
})
