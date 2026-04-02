import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { Support, VIEWS } from 'src/components/support/Support'

vi.mock('src/hooks/useAnalyticsPath')
const onClose = vi.fn()

describe('Support component tests', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the SupportMenu', async () => {
    const menuProps = {
      loadToView: VIEWS.MENU,
      onClose,
      ref: { current: null },
    }
    render(<Support {...menuProps} />)

    expect(await screen.findByText('Get help')).toBeInTheDocument()
    expect(await screen.findByText('Request support')).toBeInTheDocument()
  })

  it('renders the GeneralSupport', async () => {
    const generalSupport = {
      loadToView: VIEWS.GENERAL_SUPPORT,
      onClose,
      ref: { current: null },
    }
    render(<Support {...generalSupport} />)

    expect(
      await screen.findByText(
        'Please use this form for technical issues about connecting your account. Do not include private or financial information, such as account number or password. For financial issues about transactions, bill pay, transfers, loans, rewards and so on, please contact the appropriate customer service department directly.',
      ),
    ).toBeInTheDocument()
  })
})
