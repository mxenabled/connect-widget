import React from 'react'
import { screen, render } from 'src/utilities/testingLibrary'

import { waitFor } from '@testing-library/react'
import { GeneralSupport } from 'src/components/support/GeneralSupport'
import { GLOBAL_NAVIGATION_FEATURE_ENABLED } from 'src/services/mockedData'

const handleTicketSuccess = vi.fn()
const handleClose = vi.fn()
const GeneralSupportProps = {
  handleClose,
  handleTicketSuccess,
  user: { details: {} },
}

describe('GeneralSupport', () => {
  afterEach(() => {
    handleTicketSuccess.mockReset()
    handleClose.mockReset()
  })

  it('renders generalSupport ticket', async () => {
    const ref = React.createRef()
    const { user } = render(<GeneralSupport {...GeneralSupportProps} ref={ref} />)

    await user.type(screen.getByLabelText('Your email address'), 'fake@fake.com')
    await user.type(screen.getByLabelText('Brief description of the issue'), 'issues')
    await user.type(screen.getByLabelText('Details of the issue'), 'lots of issues')
    await user.click(screen.getByText('Continue'))
    await waitFor(() => {
      expect(handleTicketSuccess).toHaveBeenCalled()
    })
  })

  it('renders generalSupport ticket and cancels', async () => {
    const ref = React.createRef()
    const { user } = render(<GeneralSupport {...GeneralSupportProps} ref={ref} />)
    await user.click(screen.getByText('Cancel'))
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })

  it('renders its own back button when the global nav is off', async () => {
    const ref = React.createRef()
    const { user } = render(<GeneralSupport {...GeneralSupportProps} ref={ref} />)

    await user.click(await screen.findByTestId('back-button'))
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })

  it('does not render its own back button when global nav is on', async () => {
    const ref = React.createRef()
    render(<GeneralSupport {...GeneralSupportProps} ref={ref} />, {
      preloadedState: {
        userFeatures: {
          items: [GLOBAL_NAVIGATION_FEATURE_ENABLED],
        },
      },
    })
    await waitFor(() => {
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
    })
  })
})
