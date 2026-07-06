import React from 'react'
import { describe, expect, it } from 'vitest'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { render, screen } from 'src/utilities/testingLibrary'
import { initialState } from 'src/services/mockedData'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { AccountTypes } from 'src/views/manualAccount/constants'
import { STEPS } from 'src/const/Connect'

type StateOverrides = {
  enableManualAccounts?: boolean
  mode?: string
  hasAtriumApi?: boolean
}

const buildSearchState = ({
  enableManualAccounts = true,
  mode = 'aggregation',
  hasAtriumApi = false,
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
    widgetProfile: {
      ...initialState.profiles.widgetProfile,
      enable_manual_accounts: enableManualAccounts,
    },
  },
})

const renderSearchStep = (preloadedState = buildSearchState()) =>
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
    { apiValue: apiValueMock, preloadedState },
  )

describe('PopularInstitutionsList', () => {
  describe('Rendering', () => {
    it('renders the enabled popular institutions, the search button, and hides client-disabled ones', async () => {
      renderSearchStep()

      expect(await screen.findByText('Gringotts')).toBeInTheDocument()
      expect(screen.getByText('American Express Credit Card')).toBeInTheDocument()
      expect(screen.getByText('Discover Credit Card')).toBeInTheDocument()
      expect(screen.getByText('Capital One')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Search for your institution' }),
      ).toBeInTheDocument()
      // Chase is disabled_by_client and should be filtered out.
      expect(screen.queryByText('Chase')).not.toBeInTheDocument()
    })
  })

  describe('Search button', () => {
    it('focuses the search input when the search button is clicked', async () => {
      const { user } = renderSearchStep()

      await user.click(await screen.findByRole('button', { name: 'Search for your institution' }))

      expect(screen.getByTestId('search-input')).toHaveFocus()
    })
  })

  describe('Institution selection', () => {
    it('advances past the search screen when an institution is selected', async () => {
      const { user } = renderSearchStep()

      await user.click(await screen.findByRole('button', { name: 'Add account with Gringotts' }))

      expect(await screen.findByText('Log in at Test Bank')).toBeInTheDocument()
      expect(screen.queryByTestId('search-header')).not.toBeInTheDocument()
    })
  })

  describe('Manual accounts', () => {
    it('shows the add-account-manually button and navigates to the menu when clicked', async () => {
      const { user } = renderSearchStep(buildSearchState({ enableManualAccounts: true }))

      await user.click(await screen.findByRole('button', { name: 'Add account manually' }))

      expect(await screen.findByTestId('manual-account-menu-container')).toBeInTheDocument()
    })

    it('hides the button when manual accounts are disabled', async () => {
      renderSearchStep(buildSearchState({ enableManualAccounts: false }))

      await screen.findByRole('button', { name: 'Search for your institution' })
      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('hides the button in verification mode', async () => {
      renderSearchStep(buildSearchState({ mode: 'verification' }))

      await screen.findByRole('button', { name: 'Search for your institution' })
      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('hides the button when the client uses the Atrium API', async () => {
      renderSearchStep(buildSearchState({ hasAtriumApi: true }))

      await screen.findByRole('button', { name: 'Search for your institution' })
      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })
  })
})
