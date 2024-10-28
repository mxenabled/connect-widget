import React from 'react'
import { screen, render } from 'src/utilities/testingLibrary'

import { waitFor } from '@testing-library/react'
import { GeneralSupport } from 'src/components/support/GeneralSupport'

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
})
