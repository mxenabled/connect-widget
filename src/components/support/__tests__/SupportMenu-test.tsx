import React from 'react'
import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { SupportMenu } from 'src/components/support/SupportMenu'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { GLOBAL_NAVIGATION_FEATURE_ENABLED } from 'src/services/mockedData'

vi.mock('src/hooks/useAnalyticsPath')

const handleClose = vi.fn()
const selectGeneralSupport = vi.fn()
const selectRequestInstitution = vi.fn()

const supportMenuProps = {
  selectGeneralSupport,
  selectRequestInstitution,
}
describe('SupportMenu', () => {
  it('renders supportMenu and dispatch pageview', async () => {
    render(<SupportMenu {...supportMenuProps} ref={{ current: null }} />)
    expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_SUPPORT_MENU)
  })

  it('renders its own back button when the global nav is off', async () => {
    const { user } = render(<SupportMenu {...supportMenuProps} ref={{ current: null }} />)
    await user.click(await screen.findByTestId('back-button'))
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })
  it('does not render its own back button when global nav is on', async () => {
    render(<SupportMenu {...supportMenuProps} ref={{ current: null }} />, {
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

  it('renders supportMenu and clicks request institution utility row', async () => {
    const { user } = render(<SupportMenu {...supportMenuProps} ref={{ current: null }} />)
    await user.click(await screen.findByText("Can't find your bank?"))
    await waitFor(() => {
      expect(selectRequestInstitution).toHaveBeenCalled()
    })
  })
  it('renders supportMenu and clicks request general support utility row', async () => {
    const { user } = render(<SupportMenu {...supportMenuProps} ref={{ current: null }} />)
    await user.click(await screen.getByText('Request support'))
    await waitFor(() => {
      expect(selectGeneralSupport).toHaveBeenCalled()
    })
  })
})
