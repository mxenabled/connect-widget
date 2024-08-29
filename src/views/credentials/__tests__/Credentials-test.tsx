import React from 'react'

import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { Credentials } from 'src/views/credentials/Credentials'
import { institutionData, initialState } from 'src/services/mockedData'

const handleSubmitCredentials = vi.fn()
const onDeleteConnectionClick = vi.fn()
const onGoBackClick = vi.fn()

const credentialProps = {
  credentials: [
    { guid: 'CRD-123', label: 'Username', field_name: 'username' },
    { guid: 'CRD-456', label: 'Password', field_name: 'password' },
  ],
  error: {},
  handleSubmitCredentials,
  isProcessingMember: false,
  onDeleteConnectionClick,
  onGoBackClick,
}

const initialStateCopy = {
  ...initialState,
  connect: {
    ...initialState.connect,
    selectedInstitution: institutionData.institution,
  },
}

describe('Credentials', () => {
  it('renders credentials, enters username and password', async () => {
    const ref = React.createRef()
    const { user } = render(<Credentials {...credentialProps} ref={ref} />, {
      preloadedState: initialStateCopy,
    })

    await user.type(await screen.findByLabelText('Username'), 'user123')
    await user.type(await screen.findByLabelText('Password'), 'supersecretpassword')
    await user.click(await screen.findByText('Continue'))
    expect(handleSubmitCredentials).toHaveBeenCalled()
  })

  it(' clicks the go to website and goes to is leaving page', async () => {
    const ref = React.createRef()
    const { user } = render(
      <div id="connect-wrapper">
        <Credentials {...credentialProps} ref={ref} />
      </div>,
      { preloadedState: initialStateCopy },
    )

    await user.click(await screen.findByTestId('credentials-recovery-button-institution-website'))

    const leavingNotice = await screen.findByText('You are leaving')

    expect(leavingNotice).toBeInTheDocument()
  })

  it('clicks the trouble signing in button and goes to is leaving page', async () => {
    const ref = React.createRef()
    const institutionDataCopy = {
      ...institutionData.institution,
      trouble_signing_credential_recovery_url: 'www.test.com',
    }
    const initialStateCopy = {
      ...initialState,
      connect: {
        ...initialState.connect,
        selectedInstitution: institutionDataCopy,
      },
    }
    const { user } = render(
      <div id="connect-wrapper">
        <Credentials {...credentialProps} ref={ref} />
      </div>,
      { preloadedState: initialStateCopy },
    )

    const button = await screen.findByTestId('credential-recovery-button-forgot-trouble-signing-in')
    await user.click(button)
    const leavingNotice = await screen.findByText('You are leaving')

    expect(leavingNotice).toBeInTheDocument()
  })

  it('clicks the go to website and goes to website directly', async () => {
    const initialStateCopy = {
      ...initialState,
      connect: {
        ...initialState.connect,
        selectedInstitution: institutionData.institution,
      },
      profiles: {
        ...initialState.profiles,
        clientProfile: {
          ...initialState.profiles.clientProfile,
          show_external_link_popup: false,
        },
      },
    }
    const ref = React.createRef()
    const { user } = render(<Credentials {...credentialProps} ref={ref} />, {
      preloadedState: initialStateCopy,
    })

    screen.debug()

    await user.click(await screen.findByTestId('credentials-recovery-button-institution-website'))
    expect(screen.queryByText('You are leaving')).not.toBeInTheDocument()
  })

  it('renders credentials and clicks go back', async () => {
    const ref = React.createRef()
    const { user } = render(<Credentials {...credentialProps} ref={ref} />, {
      preloadedState: initialStateCopy,
    })

    await user.click(await screen.findByText('Back'))
    waitFor(async () => {
      expect(onGoBackClick).toHaveBeenCalled()
    })
  })

  it('shows instructional data when present', async () => {
    const ref = React.createRef()
    const institutionDataCopy = {
      ...institutionData.institution,
      instructional_data: {
        title: 'instructions',
        description: 'do these things',
        steps: ['1. do this first', '2. do this next'],
      },
    }

    const initialStateCopy = {
      ...initialState,
      connect: {
        ...initialState.connect,
        selectedInstitution: institutionDataCopy,
      },
    }

    render(<Credentials {...credentialProps} ref={ref} />, { preloadedState: initialStateCopy })

    expect(await screen.findByText('instructions')).toBeInTheDocument()
    expect(await screen.findByText('do these things')).toBeInTheDocument()
  })
  it('renders credentials and makes sure that the powered by MX footer is present', () => {
    const ref = React.createRef()
    render(<Credentials {...credentialProps} ref={ref} />, { preloadedState: initialStateCopy })

    waitFor(() => {
      expect(screen.getByText('Data access by')).toBeInTheDocument()
    })
  })
  it('renders credentials and makes sure that the powered by MX footer is not present', () => {
    const ref = React.createRef()
    render(<Credentials {...credentialProps} ref={ref} />, { preloadedState: initialStateCopy })

    waitFor(() => {
      expect(screen.queryByText('Data access by')).not.toBeInTheDocument()
    })
  })
})
