import React from 'react'

import { screen, render } from 'src/utilities/testingLibrary'

import { ManualAccountMenu } from 'src/views/manualAccount/ManualAccountMenu'

const handleAccountTypeSelect = jest.fn()

const accountMenuProps = {
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
})
