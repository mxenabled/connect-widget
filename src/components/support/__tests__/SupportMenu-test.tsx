import React from 'react'
import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { SupportMenu } from 'src/components/support/SupportMenu'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

vi.mock('src/hooks/useAnalyticsPath')

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
