import React from 'react'
import { beforeEach, vi } from 'vitest'

import MFAStep from 'src/views/mfa/MFAStep'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { render, screen } from 'src/utilities/testingLibrary'

describe('MFAStep', () => {
  let onAnalyticsEvent: ReturnType<typeof vi.fn>
  const onGoBack = vi.fn()
  const defaultProps = {
    enableSupportRequests: true,
    institution: { guid: 'INS-123' },
    onGoBack,
    ref: React.createRef(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    onAnalyticsEvent = vi.fn()
  })

  it('can navigate to Support when Support is enabled', async () => {
    const { user } = render(<MFAStep {...defaultProps} />, { onAnalyticsEvent })
    const supportButton = await screen.findByRole('button', { name: 'Get help' })

    expect(supportButton).toBeInTheDocument()

    await user.click(supportButton)
    expect(onAnalyticsEvent).toHaveBeenCalledWith(
      `connect_${AnalyticEvents.MFA_CLICKED_GET_HELP}`,
      expect.objectContaining({
        widgetType: defaultEventMetadata.widgetType,
      }),
    )
    expect(await screen.findByText('Request support')).toBeInTheDocument()
  })

  it('does not render the support button when Support is disabled', async () => {
    const noSupportProps = {
      ...defaultProps,
      enableSupportRequests: false,
    }
    render(<MFAStep {...noSupportProps} />, { onAnalyticsEvent })
    expect(screen.queryByRole('button', { name: 'Get help' })).not.toBeInTheDocument()
  })
})
