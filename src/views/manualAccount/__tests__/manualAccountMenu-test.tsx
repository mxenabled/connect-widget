import React from 'react'

import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { ManualAccountMenu } from 'src/views/manualAccount/ManualAccountMenu'
import { GLOBAL_NAVIGATION_FEATURE_ENABLED } from 'src/services/mockedData'

const handleGoBack = vi.fn()
const handleAccountTypeSelect = vi.fn()

const accountMenuProps = {
  handleGoBack,
  handleAccountTypeSelect,
  availableAccountTypes: [],
}

describe('manualAccountMenu', () => {
  it('renders manual account menu and clicks on a checking account', async () => {
    const ref = React.createRef()

    const { user } = render(<ManualAccountMenu {...accountMenuProps} ref={ref} />)

    await user.click(await screen.findByRole('button', { name: 'Checking' }))
    expect(handleAccountTypeSelect).toHaveBeenCalled()
  })

  it('renders its own back button when global nav is off', async () => {
    const ref = React.createRef()
    const { user } = render(<ManualAccountMenu {...accountMenuProps} ref={ref} />)

    await user.click(await screen.findByTestId('back-button'))
    await waitFor(() => {
      expect(handleGoBack).toHaveBeenCalled()
    })
  })

  it('does not render its own back button when global nav is on', async () => {
    const ref = React.createRef()
    render(<ManualAccountMenu {...accountMenuProps} ref={ref} />, {
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
