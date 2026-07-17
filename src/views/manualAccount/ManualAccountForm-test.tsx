import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { initialState, institutionData, member } from 'src/services/mockedData'
import { apiValue as baseApiValue } from 'src/const/apiProviderMock'
import { PostMessageContext } from 'src/ConnectWidget'
import { AccountTypes } from 'src/views/manualAccount/constants'
import { STEPS } from 'src/const/Connect'

type RenderFormOptions = {
  accountType?: number
  apiOverrides?: Partial<typeof baseApiValue>
  preloadedMembers?: Array<{ institution_guid: string }>
}

const accountTypeButtonName: Record<number, string> = {
  [AccountTypes.CHECKING]: 'Checking',
  [AccountTypes.SAVINGS]: 'Savings',
  [AccountTypes.LOAN]: 'Loan',
  [AccountTypes.CREDIT_CARD]: 'Credit Card',
  [AccountTypes.PROPERTY]: 'Property',
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

const renderManualAccountForm = async ({
  accountType = AccountTypes.CHECKING,
  apiOverrides = {},
  preloadedMembers = [],
}: RenderFormOptions = {}) => {
  const mockApi = buildMockApi(apiOverrides)

  const utils = render(
    <PostMessageContext.Provider value={{ onPostMessage: vi.fn() }}>
      <RenderConnectStep
        availableAccountTypes={[accountType]}
        handleConsentGoBack={() => {}}
        handleCredentialsGoBack={() => {}}
        navigationRef={React.createRef()}
        onManualAccountAdded={() => {}}
        onUpsertMember={() => {}}
        setConnectLocalState={() => {}}
      />
    </PostMessageContext.Provider>,
    {
      apiValue: mockApi,
      preloadedState: {
        ...initialState,
        connect: {
          ...initialState.connect,
          location: [{ step: STEPS.ADD_MANUAL_ACCOUNT }],
          members: preloadedMembers,
        },
      },
    },
  )

  await utils.user.click(
    await screen.findByRole('button', { name: accountTypeButtonName[accountType] }),
  )
  await screen.findByTestId('manual-account-form-header')

  return { ...utils, mockApi }
}

describe('<ManualAccountForm />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content Display', () => {
    it('renders the checking account form fields', async () => {
      await renderManualAccountForm()

      expect(screen.getByTestId('manual-account-form-header')).toHaveTextContent('Checking')
      expect(screen.getByLabelText(/account name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/account balance/i)).toBeInTheDocument()
      expect(screen.getByText(/required/i)).toBeInTheDocument()
      expect(screen.getByTestId('save-manual-account-button')).toHaveTextContent('Save')
      expect(screen.queryByLabelText(/credit limit/i)).not.toBeInTheDocument()
    })

    it('renders the header for the selected account type', async () => {
      await renderManualAccountForm({ accountType: AccountTypes.SAVINGS })

      expect(screen.getByTestId('manual-account-form-header')).toHaveTextContent('Savings')
    })
  })

  describe('Account Type Specific Fields', () => {
    it('renders the credit card specific fields', async () => {
      await renderManualAccountForm({ accountType: AccountTypes.CREDIT_CARD })

      expect(screen.getByLabelText(/credit limit/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/minimum payment/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/day of the month payment is due/i)).toBeInTheDocument()
    })

    it('renders the interest rate field for loan accounts', async () => {
      await renderManualAccountForm({ accountType: AccountTypes.LOAN })

      expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument()
    })

    it('renders the property type select field for property accounts', async () => {
      await renderManualAccountForm({ accountType: AccountTypes.PROPERTY })

      expect(screen.getByLabelText(/property type/i)).toBeInTheDocument()
    })
  })

  describe('Personal and Business Selection', () => {
    it('selects personal by default', async () => {
      await renderManualAccountForm()

      expect(screen.getByLabelText('Personal')).toBeChecked()
      expect(screen.getByLabelText('Business')).not.toBeChecked()
    })

    it('toggles between personal and business', async () => {
      const { user } = await renderManualAccountForm()

      await user.click(screen.getByLabelText('Business'))

      expect(screen.getByLabelText('Business')).toBeChecked()
      expect(screen.getByLabelText('Personal')).not.toBeChecked()

      await user.click(screen.getByLabelText('Personal'))

      expect(screen.getByLabelText('Personal')).toBeChecked()
      expect(screen.getByLabelText('Business')).not.toBeChecked()
    })
  })

  describe('Day Picker', () => {
    it('opens the day picker and returns to the form when the back button is clicked', async () => {
      const { user } = await renderManualAccountForm({ accountType: AccountTypes.CREDIT_CARD })

      await user.click(screen.getByLabelText(/day of the month payment is due/i))

      expect(await screen.findByText('Payment due day')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-form-header')).not.toBeInTheDocument()

      await user.click(screen.getByTestId('back-button'))

      expect(await screen.findByTestId('manual-account-form-header')).toBeInTheDocument()
    })

    it('selects a day and returns to the form', async () => {
      const { user } = await renderManualAccountForm({ accountType: AccountTypes.CREDIT_CARD })

      await user.click(screen.getByLabelText(/day of the month payment is due/i))
      await user.click(await screen.findByTestId('date-picker-button-15'))

      expect(await screen.findByTestId('manual-account-form-header')).toBeInTheDocument()
      expect(screen.getByLabelText(/day of the month payment is due/i)).toHaveValue('15')
    })
  })

  describe('Form Validation', () => {
    it('shows a required field error only after attempting to save without an account name', async () => {
      const { user, mockApi } = await renderManualAccountForm()

      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument()

      await user.click(screen.getByTestId('save-manual-account-button'))

      expect((await screen.findAllByText(/is required/i)).length).toBeGreaterThan(0)
      expect(mockApi.createAccount).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('creates the account with the entered values and shows the success view', async () => {
      const { user, mockApi } = await renderManualAccountForm()

      await user.type(screen.getByLabelText(/account name/i), 'Test Account')
      await user.type(screen.getByLabelText(/account balance/i), '1000')
      await user.click(screen.getByTestId('save-manual-account-button'))

      expect(await screen.findByTestId('manual-account-success-header')).toBeInTheDocument()
      expect(mockApi.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          user_name: 'Test Account',
          balance: '1000',
          account_type: AccountTypes.CHECKING,
          is_personal: true,
        }),
      )
    })

    it('creates a business account when business is selected', async () => {
      const { user, mockApi } = await renderManualAccountForm()

      await user.click(screen.getByLabelText('Business'))
      await user.type(screen.getByLabelText(/account name/i), 'Business Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      expect(await screen.findByTestId('manual-account-success-header')).toBeInTheDocument()
      expect(mockApi.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({ is_personal: false }),
      )
    })

    it('creates a savings account for the savings account type', async () => {
      const { user, mockApi } = await renderManualAccountForm({ accountType: AccountTypes.SAVINGS })

      await user.type(screen.getByLabelText(/account name/i), 'Savings Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      expect(await screen.findByTestId('manual-account-success-header')).toBeInTheDocument()
      expect(mockApi.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({ account_type: AccountTypes.SAVINGS }),
      )
    })

    it('creates the account when a manual member already exists', async () => {
      const { user } = await renderManualAccountForm({
        preloadedMembers: [{ institution_guid: 'INS-MANUAL-456' }],
      })

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      expect(await screen.findByTestId('manual-account-success-header')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('shows an error and re-enables the save button when account creation fails', async () => {
      const { user } = await renderManualAccountForm({
        apiOverrides: {
          createAccount: vi.fn().mockRejectedValue(new Error('Network error')),
        },
      })

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByTestId('something-went-wrong-text')).toHaveTextContent(
        'Please try saving your account again.',
      )
      expect(screen.getByTestId('save-manual-account-button')).not.toBeDisabled()
    })

    it('allows retrying after an error and reaches the success view', async () => {
      const { user } = await renderManualAccountForm({
        apiOverrides: {
          createAccount: vi
            .fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({
              member_guid: member.member.guid,
              institution_guid: institutionData.institution.guid,
            }),
        },
      })

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await screen.findByText('Something went wrong')

      await user.click(screen.getByTestId('save-manual-account-button'))

      expect(await screen.findByTestId('manual-account-success-header')).toBeInTheDocument()
    })
  })
})
