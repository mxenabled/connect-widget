import React from 'react'
import { describe, expect, it } from 'vitest'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { fireEvent, render, screen } from 'src/utilities/testingLibrary'
import { initialState } from 'src/services/mockedData'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { AccountTypes } from 'src/views/manualAccount/constants'
import { STEPS } from 'src/const/Connect'

type StateOverrides = {
  mode?: string
  enableManualAccounts?: boolean
  hasAtriumApi?: boolean
  accountVerificationEnabled?: boolean
  isMicrodepositsEnabled?: boolean
  showMicrodeposits?: boolean
}

const buildSearchState = ({
  mode = 'aggregation',
  enableManualAccounts = true,
  hasAtriumApi = false,
  accountVerificationEnabled = false,
  isMicrodepositsEnabled = false,
  showMicrodeposits = false,
}: StateOverrides = {}) => ({
  ...initialState,
  config: { ...initialState.config, mode },
  connect: {
    ...initialState.connect,
    location: [{ step: STEPS.SEARCH }],
  },
  profiles: {
    ...initialState.profiles,
    client: { ...initialState.profiles.client, has_atrium_api: hasAtriumApi },
    clientProfile: {
      ...initialState.profiles.clientProfile,
      account_verification_is_enabled: accountVerificationEnabled,
      is_microdeposits_enabled: isMicrodepositsEnabled,
    },
    widgetProfile: {
      ...initialState.profiles.widgetProfile,
      enable_manual_accounts: enableManualAccounts,
      show_microdeposits_in_connect: showMicrodeposits,
    },
  },
})

const microdepositsEnabledState = () =>
  buildSearchState({
    mode: 'verification',
    accountVerificationEnabled: true,
    isMicrodepositsEnabled: true,
    showMicrodeposits: true,
  })

const renderNoResultStep = (preloadedState = buildSearchState()) =>
  render(
    <RenderConnectStep
      availableAccountTypes={[AccountTypes.CHECKING, AccountTypes.SAVINGS]}
      handleConsentGoBack={() => {}}
      handleCredentialsGoBack={() => {}}
      navigationRef={React.createRef()}
      onManualAccountAdded={() => {}}
      onUpsertMember={() => {}}
      setConnectLocalState={() => {}}
    />,
    {
      apiValue: { ...apiValueMock, loadInstitutions: () => Promise.resolve([]) },
      preloadedState,
    },
  )

const startSearch = async (term = 'test bank') => {
  fireEvent.change(await screen.findByPlaceholderText('Search'), { target: { value: term } })
}

describe('SearchNoResult', () => {
  describe('Rendering', () => {
    it('renders the no-results message with the search term and a suggestion', async () => {
      renderNoResultStep()

      await startSearch('test bank')

      const message = await screen.findByTestId('0-search-results')
      expect(message).toHaveTextContent(/No results found/)
      expect(message).toHaveTextContent(/test bank/)
      expect(
        screen.getByText('Check spelling and try again, or try searching for another institution.'),
      ).toBeVisible()
    })
  })

  describe('Manual accounts', () => {
    it('shows the add-account-manually button and navigates to the menu when clicked', async () => {
      const { user } = renderNoResultStep()

      await startSearch()

      await user.click(await screen.findByRole('button', { name: 'Add account manually' }))

      expect(await screen.findByTestId('manual-account-menu-container')).toBeInTheDocument()
    })

    it.each([
      ['manual accounts are disabled', buildSearchState({ enableManualAccounts: false })],
      ['in verification mode', buildSearchState({ mode: 'verification' })],
      ['the client uses the Atrium API', buildSearchState({ hasAtriumApi: true })],
    ])('hides the button when %s', async (_case, state) => {
      renderNoResultStep(state)

      await startSearch()
      await screen.findByTestId('0-search-results')

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })
  })

  describe('Microdeposits', () => {
    it('shows the connect-with-account-numbers button and navigates to microdeposits', async () => {
      const { user } = renderNoResultStep(microdepositsEnabledState())

      await startSearch()

      await user.click(await screen.findByRole('button', { name: 'Connect with account numbers' }))

      expect(await screen.findByText('Enter routing number')).toBeInTheDocument()
    })

    it.each([
      ['not in verification mode', buildSearchState()],
      ['verification is not enabled', buildSearchState({ mode: 'verification' })],
    ])('hides the button when %s', async (_case, state) => {
      renderNoResultStep(state)

      await startSearch()
      await screen.findByTestId('0-search-results')

      expect(
        screen.queryByRole('button', { name: 'Connect with account numbers' }),
      ).not.toBeInTheDocument()
    })
  })
})
