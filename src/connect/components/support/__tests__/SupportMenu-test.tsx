import React from 'react'
import { screen, render, waitFor } from 'src/connect/utilities/testingLibrary'

import { SupportMenu } from 'src/connect/components/support/SupportMenu'
import { useAnalyticsPath } from 'src/connect/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/connect/const/Analytics'

jest.mock('src/connect/hooks/useAnalyticsPath')

declare const global: {
  app: { userFeatures: any }
} & Window
const handleClose = jest.fn()
const selectGeneralSupport = jest.fn()
const selectRequestInstitution = jest.fn()

const supportMenuProps = {
  handleClose,
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
    global.app.userFeatures = [
      {
        feature_guid: 'FTR-123',
        feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
        guid: 'URF-123',
        user_guid: 'USR-123',
        is_enabled: true,
      },
    ]
    render(<SupportMenu {...supportMenuProps} ref={{ current: null }} />)
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
