import React from 'react'
import { render, waitFor, screen } from 'src/utilities/testingLibrary'

import { PrivacyPolicy } from 'src/views/disclosure/PrivacyPolicy'
import { initialState } from 'src/services/mockedData'
import * as globalUtils from 'src/utilities/global'

describe('PrivacyPolicy', () => {
  let goToUrlLinkSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    goToUrlLinkSpy = vi.spyOn(globalUtils, 'goToUrlLink').mockImplementation(() => {})
  })

  afterEach(() => {
    goToUrlLinkSpy.mockRestore()
  })

  it('should display leaving notice on mount', async () => {
    render(
      <div id="connect-wrapper">
        <PrivacyPolicy />
      </div>,
      { preloadedState: initialState },
    )

    expect(await screen.findByTestId('leaving-notice-flat-header')).toBeInTheDocument()
    expect(goToUrlLinkSpy).not.toHaveBeenCalled()
  })

  it('should redirect when user clicks continue on leaving notice', async () => {
    const { user } = render(
      <div id="connect-wrapper">
        <PrivacyPolicy />
      </div>,
      { preloadedState: initialState },
    )

    const continueButton = await screen.findByTestId('leaving-notice-flat-continue-button')
    await user.click(continueButton)

    expect(goToUrlLinkSpy).toHaveBeenCalledWith('https://www.mx.com/privacy/', true)
  })

  it('should call onCancel callback when user clicks cancel', async () => {
    const onCancelMock = vi.fn()
    const { user } = render(
      <div id="connect-wrapper">
        <PrivacyPolicy onCancel={onCancelMock} />
      </div>,
      {
        preloadedState: initialState,
      },
    )

    expect(await screen.findByTestId('leaving-notice-flat-header')).toBeInTheDocument()

    const cancelButton = screen.getByTestId('back-button')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByTestId('leaving-notice-flat-header')).not.toBeInTheDocument()
    })

    expect(onCancelMock).toHaveBeenCalledTimes(1)
    expect(goToUrlLinkSpy).not.toHaveBeenCalled()
  })
})
