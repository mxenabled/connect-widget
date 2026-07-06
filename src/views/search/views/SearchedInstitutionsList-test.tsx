import React from 'react'
import { describe, expect, it } from 'vitest'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { fireEvent, render, screen } from 'src/utilities/testingLibrary'
import { initialState, SEARCHED_INSTITUTIONS } from 'src/services/mockedData'
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

const renderSearchStep = (
  preloadedState = buildSearchState(),
  apiOverrides: Partial<typeof apiValueMock> = {},
) =>
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
    { apiValue: { ...apiValueMock, ...apiOverrides }, preloadedState },
  )

const startSearch = async () => {
  fireEvent.change(await screen.findByPlaceholderText('Search'), { target: { value: 'test' } })
}

describe('SearchedInstitutionsList', () => {
  describe('Rendering', () => {
    it('renders the search results, the result count, and a load-more button', async () => {
      renderSearchStep()

      await startSearch()

      expect(await screen.findByText('MX Bank')).toBeInTheDocument()
      expect(screen.getByText('Grinnell State Bank')).toBeInTheDocument()
      expect(screen.getAllByText('5 search results').length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: 'Load more institutions' })).toBeInTheDocument()
    })

    it('shows a singular result count when a single institution matches', async () => {
      renderSearchStep(buildSearchState(), {
        loadInstitutions: () => Promise.resolve([SEARCHED_INSTITUTIONS[1]]),
      })

      await startSearch()

      expect(await screen.findByText('MX Bank')).toBeInTheDocument()
      expect(screen.getAllByText('1 search result').length).toBeGreaterThan(0)
    })
  })

  describe('Institution selection', () => {
    it('advances past the search screen when a searched institution is selected', async () => {
      const { user } = renderSearchStep()

      await startSearch()

      await user.click(await screen.findByRole('button', { name: 'Add account with MX Bank' }))

      expect(await screen.findByText('Log in at Test Bank')).toBeInTheDocument()
      expect(screen.queryByTestId('search-header')).not.toBeInTheDocument()
    })
  })

  describe('Load more institutions', () => {
    it('appends the next page of results when the load-more button is clicked', async () => {
      const { user } = renderSearchStep()

      await startSearch()
      await screen.findByText('Grinnell State Bank')

      await user.click(screen.getByRole('button', { name: 'Load more institutions' }))

      expect((await screen.findAllByText('10 search results')).length).toBeGreaterThan(0)
    })
  })

  describe('Manual accounts', () => {
    it('shows the add-account-manually button and navigates to the menu when clicked', async () => {
      const { user } = renderSearchStep()

      await startSearch()

      await user.click(await screen.findByRole('button', { name: 'Add account manually' }))

      expect(await screen.findByTestId('manual-account-menu-container')).toBeInTheDocument()
    })

    it.each([
      ['manual accounts are disabled', buildSearchState({ enableManualAccounts: false })],
      ['in verification mode', buildSearchState({ mode: 'verification' })],
      ['the client uses the Atrium API', buildSearchState({ hasAtriumApi: true })],
    ])('hides the button when %s', async (_case, state) => {
      renderSearchStep(state)

      await startSearch()
      await screen.findByText('Grinnell State Bank')

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })
  })

  describe('Microdeposits', () => {
    it('shows the connect-with-account-numbers button and navigates to microdeposits', async () => {
      const { user } = renderSearchStep(microdepositsEnabledState())

      await startSearch()

      await user.click(await screen.findByRole('button', { name: 'Connect with account numbers' }))

      expect(await screen.findByText('Enter routing number')).toBeInTheDocument()
    })

    it.each([
      ['not in verification mode', buildSearchState()],
      ['verification is not enabled', buildSearchState({ mode: 'verification' })],
    ])('hides the button when %s', async (_case, state) => {
      renderSearchStep(state)

      await startSearch()
      await screen.findByText('Grinnell State Bank')

      expect(
        screen.queryByRole('button', { name: 'Connect with account numbers' }),
      ).not.toBeInTheDocument()
    })
  })
})
