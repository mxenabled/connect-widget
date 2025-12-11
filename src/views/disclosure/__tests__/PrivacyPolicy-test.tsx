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

  it('should display leaving notice on mount', async () => {
    render(<PrivacyPolicy />, { preloadedState: initialState })

    expect(await screen.findByTestId('leaving-notice-message')).toBeInTheDocument()
    expect(goToUrlLinkMock).not.toHaveBeenCalled()
  })

  it('should redirect when user clicks continue on leaving notice', async () => {
    const { user } = render(<PrivacyPolicy />, { preloadedState: initialState })

    const continueButton = await screen.findByTestId('leaving-notice-continue')
    await user.click(continueButton)

    expect(goToUrlLinkMock).toHaveBeenCalledWith('https://www.mx.com/privacy/', true)
  })

  it('should call onCancel callback when user clicks cancel', async () => {
    const onCancelMock = vi.fn()
    const { user } = render(<PrivacyPolicy onCancel={onCancelMock} />, {
      preloadedState: initialState,
    })

    expect(await screen.findByTestId('leaving-notice-message')).toBeInTheDocument()

    const cancelButton = await screen.findByTestId('leaving-notice-cancel')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByTestId('leaving-notice-message')).not.toBeInTheDocument()
    })

    expect(onCancelMock).toHaveBeenCalledTimes(1)
    expect(goToUrlLinkMock).not.toHaveBeenCalled()
  })
})
