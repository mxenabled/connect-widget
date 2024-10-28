import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
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
    expect(await screen.findByText("Can't find your bank?")).toBeInTheDocument()
    expect(await screen.findByText('Request support')).toBeInTheDocument()
  })

  it('renders the RequestInstitution', async () => {
    const reqInstitutionProps = {
      loadToView: VIEWS.REQ_INSTITUTION,
      onClose,
      ref: { current: null },
    }
    render(<Support {...reqInstitutionProps} />)

    expect(
      await screen.findByText(
        "If you can't find your financial institution, you may submit a request to add it to our system.",
      ),
    ).toBeInTheDocument()
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

it('renders the success page after submitting a request via the menu', async () => {
  const menuProps = {
    loadToView: VIEWS.MENU,
    onClose,
    ref: React.createRef(),
  }
  const { user: userEvent } = render(<Support {...menuProps} />)

  expect(await screen.findByText("Can't find your bank?")).toBeInTheDocument()
  await userEvent.click(screen.getByText("Can't find your bank?"))

  const continueButton = await screen.findByText('Continue')
  expect(continueButton).toBeInTheDocument()
  await userEvent.click(continueButton)

  // Make sure the "required" help text shows up
  expect(await screen.findByText('Institution name is required')).toBeInTheDocument()
  expect(await screen.findByText('Institution website is required')).toBeInTheDocument()

  // Type and submit values
  await userEvent.type(screen.getByLabelText('Institution name'), 'institution name')
  await userEvent.type(screen.getByLabelText('Institution website'), 'http://institution.name.com')
  await userEvent.click(continueButton)

  // Success page should render
  await waitFor(() => {
    expect(screen.getByText('Request received')).toBeInTheDocument()
  })
})
