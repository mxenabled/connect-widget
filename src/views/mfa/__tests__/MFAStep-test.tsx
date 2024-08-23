import React from 'react'

import MFAStep from 'src/views/mfa/MFAStep'
import { AnalyticEvents } from 'src/const/Analytics'
import { render, screen } from 'src/utilities/testingLibrary'

const mockSendPosthogEvent = vi.fn()

vi.mock('src/hooks/useAnalyticsEvent', () => {
  return { default: () => mockSendPosthogEvent }
})

describe('MFAStep', () => {
  const onGoBack = vi.fn()
  const defaultProps = {
    enableSupportRequests: true,
    institution: { guid: 'INS-123' },
    onGoBack,
    ref: React.createRef(),
  }

  it('can navigate to Support and back when Support is enabled', async () => {
    const { user } = render(<MFAStep {...defaultProps} />)
    const supportButton = await screen.findByRole('button', { name: 'Get help' })

    expect(supportButton).toBeInTheDocument()

    await user.click(supportButton)
    expect(mockSendPosthogEvent).toHaveBeenCalledWith(AnalyticEvents.MFA_CLICKED_GET_HELP)
    expect(await screen.findByText('Request support')).toBeInTheDocument()
    await user.click(screen.getByTestId('back-button'))
    expect(await screen.findByRole('button', { name: 'Get help' })).toBeInTheDocument()
  })

  it('does not render the support button when Support is disabled', async () => {
    const noSupportProps = {
      ...defaultProps,
      enableSupportRequests: false,
    }
    render(<MFAStep {...noSupportProps} />)
    expect(screen.queryByRole('button', { name: 'Get help' })).not.toBeInTheDocument()
  })
})
