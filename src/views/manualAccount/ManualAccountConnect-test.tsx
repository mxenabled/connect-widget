import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type UserEvent } from '@testing-library/user-event'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { ConnectNavigationHeader } from 'src/components/ConnectNavigationHeader'
import { initialState, institutionData, member } from 'src/services/mockedData'
import { apiValue as baseApiValue } from 'src/const/apiProviderMock'
import { PostMessageContext } from 'src/ConnectWidget'
import { AccountTypes } from 'src/views/manualAccount/constants'
import { STEPS } from 'src/const/Connect'

type NavigationHandle = {
  handleBackButton: () => void
  showBackButton: () => HTMLElement | false | null
}

type RenderStepOptions = {
  apiOverrides?: Partial<typeof baseApiValue>
  availableAccountTypes?: number[]
  onManualAccountAdded?: ReturnType<typeof vi.fn>
}

const manualAccountState = {
  ...initialState,
  connect: {
    ...initialState.connect,
    location: [{ step: STEPS.ADD_MANUAL_ACCOUNT }],
  },
}

const buildMockApi = (apiOverrides: Partial<typeof baseApiValue> = {}) => ({
  ...baseApiValue,
  createAccount: vi.fn(
    (): Promise<AccountResponseType> =>
      Promise.resolve({
        member_guid: member.member.guid,
        institution_guid: institutionData.institution.guid,
      } as unknown as AccountResponseType),
  ),
  ...apiOverrides,
})

const renderManualAccountStep = ({
  apiOverrides = {},
  availableAccountTypes = [AccountTypes.CHECKING, AccountTypes.SAVINGS],
  onManualAccountAdded = vi.fn(),
}: RenderStepOptions = {}) => {
  const onPostMessage = vi.fn()
  const mockApi = buildMockApi(apiOverrides)

  return {
    ...render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <RenderConnectStep
          availableAccountTypes={availableAccountTypes}
          handleConsentGoBack={() => {}}
          handleCredentialsGoBack={() => {}}
          navigationRef={React.createRef()}
          onManualAccountAdded={onManualAccountAdded}
          onUpsertMember={() => {}}
          setConnectLocalState={() => {}}
        />
      </PostMessageContext.Provider>,
      { apiValue: mockApi, preloadedState: manualAccountState },
    ),
    mockApi,
    onManualAccountAdded,
    onPostMessage,
  }
}

const ManualAccountWithNavigationHeader = ({
  availableAccountTypes,
  onManualAccountAdded,
}: {
  availableAccountTypes: number[]
  onManualAccountAdded: () => void
}) => {
  const [stepComponentRef, setStepComponentRef] = React.useState<NavigationHandle | null>(null)

  return (
    <>
      <ConnectNavigationHeader connectGoBack={() => {}} stepComponentRef={stepComponentRef} />
      <RenderConnectStep
        availableAccountTypes={availableAccountTypes}
        handleConsentGoBack={() => {}}
        handleCredentialsGoBack={() => {}}
        navigationRef={setStepComponentRef}
        onManualAccountAdded={onManualAccountAdded}
        onUpsertMember={() => {}}
        setConnectLocalState={() => {}}
      />
    </>
  )
}

const renderWithNavigationHeader = ({
  apiOverrides = {},
  availableAccountTypes = [AccountTypes.CHECKING, AccountTypes.SAVINGS],
  onManualAccountAdded = vi.fn(),
}: RenderStepOptions = {}) => {
  const onPostMessage = vi.fn()
  const mockApi = buildMockApi(apiOverrides)

  return {
    ...render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <ManualAccountWithNavigationHeader
          availableAccountTypes={availableAccountTypes}
          onManualAccountAdded={onManualAccountAdded}
        />
      </PostMessageContext.Provider>,
      { apiValue: mockApi, preloadedState: manualAccountState },
    ),
    mockApi,
    onManualAccountAdded,
    onPostMessage,
  }
}

const addManualCheckingAccount = async (user: UserEvent) => {
  await user.click(await screen.findByRole('button', { name: 'Checking' }))
  await user.type(await screen.findByTestId('text-input-user_name'), 'My Checking')
  await user.click(screen.getByTestId('save-manual-account-button'))
}

describe('<ManualAccountConnect />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content Display', () => {
    it('renders the manual account menu with the available account types', async () => {
      renderManualAccountStep()

      expect(await screen.findByTestId('manual-account-menu-container')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Checking' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Savings' })).toBeInTheDocument()
    })

    it('shows only the provided account type when a single type is available', async () => {
      renderManualAccountStep({ availableAccountTypes: [AccountTypes.CHECKING] })

      expect(await screen.findByRole('button', { name: 'Checking' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Savings' })).not.toBeInTheDocument()
    })
  })

  describe('Account Type Selection', () => {
    it('opens the manual account form for the selected account type', async () => {
      const { user } = renderManualAccountStep()

      await user.click(await screen.findByRole('button', { name: 'Checking' }))

      expect(await screen.findByTestId('manual-account-form-header')).toHaveTextContent('Checking')
      expect(screen.queryByTestId('manual-account-menu-container')).not.toBeInTheDocument()
    })

    it('opens the form for a different account type', async () => {
      const { user } = renderManualAccountStep()

      await user.click(await screen.findByRole('button', { name: 'Savings' }))

      expect(await screen.findByTestId('manual-account-form-header')).toHaveTextContent('Savings')
    })
  })

  describe('Success Flow', () => {
    it('creates the account and shows the success view after saving', async () => {
      const { user, mockApi } = renderManualAccountStep()

      await addManualCheckingAccount(user)

      expect(await screen.findByTestId('manual-account-success-header')).toHaveTextContent(
        'Checking added',
      )
      expect(mockApi.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          account_type: AccountTypes.CHECKING,
          user_name: 'My Checking',
        }),
      )
      expect(await screen.findByTestId('manual-account-success-header')).toBeInTheDocument()
    })

    it('shows an error when account creation fails', async () => {
      const { user } = renderManualAccountStep({
        apiOverrides: {
          createAccount: vi.fn().mockRejectedValue(new Error('Failed to create account')),
        },
      })

      await addManualCheckingAccount(user)

      expect(await screen.findByTestId('something-went-wrong-text')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-success-header')).not.toBeInTheDocument()
    })

    it('posts back to search when Done is clicked on the success view', async () => {
      const { user } = renderManualAccountStep()

      await addManualCheckingAccount(user)

      await user.click(await screen.findByTestId('manual-success-done-button'))
      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
    })
  })

  describe('Navigation back button', () => {
    it('returns from the form to the menu when the back button is clicked', async () => {
      const { user } = renderWithNavigationHeader()

      await user.click(await screen.findByRole('button', { name: 'Checking' }))
      expect(await screen.findByTestId('manual-account-form-header')).toBeInTheDocument()

      await user.click(await screen.findByTestId('back-button'))

      expect(await screen.findByTestId('manual-account-menu-container')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-form-header')).not.toBeInTheDocument()
    })

    it('returns to search when the back button is clicked from the menu', async () => {
      const { user } = renderWithNavigationHeader()

      await user.click(await screen.findByTestId('back-button'))

      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
    })

    it('hides the back button on the success view', async () => {
      const { user } = renderWithNavigationHeader()

      expect(await screen.findByTestId('back-button')).toBeInTheDocument()

      await addManualCheckingAccount(user)
      await screen.findByTestId('manual-account-success-header')

      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
    })
  })
})
