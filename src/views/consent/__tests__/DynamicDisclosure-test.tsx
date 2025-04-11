import React from 'react'

import { screen, render } from 'src/utilities/testingLibrary'

import { DynamicDisclosure } from 'src/views/consent/DynamicDisclosure'

const onConsentClick = vi.fn()
const onGoBackClick = vi.fn()

const dynamicDisclosureProps = {
  onConsentClick,
  onGoBackClick,
}

describe('dynamic disclosure', () => {
  it('loads the consent screen', async () => {
    const ref = React.createRef()
    render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />)

    expect(await screen.findByTestId('dynamic-disclosure-title')).toBeInTheDocument()
    expect(await screen.findByTestId('dynamic-disclosure-p1')).toBeInTheDocument()
    expect(await screen.findByText('I consent')).toBeInTheDocument()
    expect(await screen.findByText('Account Information')).toBeInTheDocument()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  it('loads the consent screen and clicks the info button to open modal', async () => {
    const ref = React.createRef()
    const { user } = render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />)

    await user.click(await screen.findByTestId('info-button'))

    expect(await screen.findByText('Who is MX Technologies?')).toBeInTheDocument()
  })
})
