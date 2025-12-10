import React from 'react'
import { render, waitFor, screen } from 'src/utilities/testingLibrary'

import { PrivacyPolicy } from 'src/views/disclosure/PrivacyPolicy'
import { initialState } from 'src/services/mockedData'
import * as globalUtils from 'src/utilities/global'

vi.mock('src/utilities/global', async () => {
  const actual = await vi.importActual<typeof globalUtils>('src/utilities/global')
  return {
    ...actual,
    goToUrlLink: vi.fn(),
  }
})

vi.mock('src/components/LeavingNoticeFlat', () => ({
  LeavingNoticeFlat: ({
    onContinue,
    onCancel,
  }: {
    onContinue: () => void
    onCancel: () => void
  }) => (
    <div>
      <div data-test="leaving-notice-message">You are leaving</div>
      <button data-test="leaving-notice-continue" onClick={onContinue}>
        Continue
      </button>
      <button data-test="leaving-notice-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}))

describe('PrivacyPolicy', () => {
  const goToUrlLinkMock = vi.mocked(globalUtils.goToUrlLink)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to MX privacy policy URL when external link popup is disabled', async () => {
    const stateWithoutPopup = {
      ...initialState,
      profiles: {
        ...initialState.profiles,
        clientProfile: {
          ...initialState.profiles.clientProfile,
          show_external_link_popup: false,
        },
      },
    }

    render(<PrivacyPolicy />, { preloadedState: stateWithoutPopup })

    await waitFor(() => {
      expect(goToUrlLinkMock).toHaveBeenCalledWith('https://www.mx.com/privacy/', true)
    })
  })

  it('should show leaving notice when external link popup is enabled', async () => {
    const stateWithPopup = {
      ...initialState,
      profiles: {
        ...initialState.profiles,
        clientProfile: {
          ...initialState.profiles.clientProfile,
          show_external_link_popup: true,
        },
      },
    }

    render(<PrivacyPolicy />, { preloadedState: stateWithPopup })

    expect(await screen.findByTestId('leaving-notice-message')).toBeInTheDocument()
    expect(goToUrlLinkMock).not.toHaveBeenCalled()
  })

  it('should redirect when user clicks continue on leaving notice', async () => {
    const stateWithPopup = {
      ...initialState,
      profiles: {
        ...initialState.profiles,
        clientProfile: {
          ...initialState.profiles.clientProfile,
          show_external_link_popup: true,
        },
      },
    }

    const { user } = render(<PrivacyPolicy />, { preloadedState: stateWithPopup })

    const continueButton = await screen.findByTestId('leaving-notice-continue')
    await user.click(continueButton)

    expect(goToUrlLinkMock).toHaveBeenCalledWith('https://www.mx.com/privacy/', true)
  })

  it('should hide leaving notice when user clicks cancel', async () => {
    const stateWithPopup = {
      ...initialState,
      profiles: {
        ...initialState.profiles,
        clientProfile: {
          ...initialState.profiles.clientProfile,
          show_external_link_popup: true,
        },
      },
    }

    const { user } = render(<PrivacyPolicy />, {
      preloadedState: stateWithPopup,
    })

    expect(await screen.findByTestId('leaving-notice-message')).toBeInTheDocument()

    const cancelButton = await screen.findByTestId('leaving-notice-cancel')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByTestId('leaving-notice-message')).not.toBeInTheDocument()
    })

    expect(goToUrlLinkMock).not.toHaveBeenCalled()
  })
})
