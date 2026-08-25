import React from 'react'

import { screen, render } from 'src/utilities/testingLibrary'

import { ManualAccountConnect } from 'src/views/manualAccount/ManualAccountConnect'

describe('manualAccountMenu', () => {
  it.each([
    'Checking',
    'Savings',
    'Loan',
    'Credit Card',
    'Investment',
    'Line of Credit',
    'Mortgage',
    'Property',
    'Cash',
    'Insurance',
    'Prepaid',
    'Other',
  ])('shows the %s form when the %s menu button is clicked', async (formType) => {
    const { user } = render(<ManualAccountConnect />)

    await user.click(await screen.findByRole('button', { name: formType }))

    expect(await screen.findByTestId('manual-account-form-header')).toHaveTextContent(formType)
  })
})
