import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'

import { RequestInstitution } from 'src/components/support/RequestInstitution'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

vi.mock('src/hooks/useAnalyticsPath')
const handleClose = vi.fn()
const handleTicketSuccess = vi.fn()

const requestInstitutionTestProps = {
  handleClose,
  handleTicketSuccess,
  user: {
    email: 'email@test.com',
  },
}

describe('RequestInstitution', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('can render and send a pageview', async () => {
    render(<RequestInstitution {...requestInstitutionTestProps} ref={{ current: null }} />)

    expect(useAnalyticsPath).toHaveBeenCalledWith(
      ...PageviewInfo.CONNECT_SUPPORT_REQUEST_INSTITUTION,
    )
  })

  it('handles its cancel button', async () => {
    const { user } = render(
      <RequestInstitution {...requestInstitutionTestProps} ref={{ current: null }} />,
    )
    const button = await screen.findByText('Cancel')
    expect(button).toBeInTheDocument()

    await user.click(button)
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  it('handles its continue button, after the response comes back', async () => {
    const { user } = render(
      <RequestInstitution {...requestInstitutionTestProps} ref={{ current: null }} />,
    )
    const continueButton = await screen.findByText('Continue')
    expect(continueButton).toBeInTheDocument()
    await user.click(continueButton)

    // Make sure the "required" help text shows up
    expect(await screen.findByText('Institution name is required')).toBeInTheDocument()
    expect(await screen.findByText('Institution website is required')).toBeInTheDocument()

    // Type and submit values
    await user.type(screen.getByLabelText('Institution name'), 'institution name')
    await user.type(screen.getByLabelText('Institution website'), 'http://institution.name.com')
    await user.click(continueButton)

    // // Handler should have now been called
    await waitFor(() => {
      expect(handleTicketSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
