import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { Verifying } from 'src/views/microdeposits/Verifying'
import { render, screen } from 'src/utilities/testingLibrary'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'

type ApiOverrides = Record<string, unknown>

describe('Verifying', () => {
  const renderVerifying = (apiOverrides: ApiOverrides = {}) =>
    render(
      <Verifying
        microdeposit={{ guid: 'MD-123', status: MicrodepositsStatuses.DEPOSITED }}
        onError={() => {}}
        onSuccess={() => {}}
      />,
      {
        apiValue: {
          ...apiValueMock,
          refreshMicrodepositStatus: () => Promise.resolve({}),
          loadMicrodepositByGuid: () =>
            Promise.resolve({ guid: 'MD-123', status: MicrodepositsStatuses.DEPOSITED }),
          ...apiOverrides,
        } as unknown as typeof apiValueMock,
      },
    )

  const connectStepProps = {
    availableAccountTypes: [],
    handleConsentGoBack: () => {},
    handleCredentialsGoBack: () => {},
    navigationRef: React.createRef(),
    onManualAccountAdded: () => {},
    onUpsertMember: () => {},
    setConnectLocalState: () => {},
  }

  const microdepositsEnabledState = (currentMicrodepositGuid: string) => ({
    ...initialState,
    config: { ...initialState.config, mode: VERIFY_MODE },
    connect: {
      ...initialState.connect,
      location: [{ step: STEPS.MICRODEPOSITS }],
      currentMicrodepositGuid,
    },
    profiles: {
      ...initialState.profiles,
      clientProfile: {
        ...initialState.profiles.clientProfile,
        account_verification_is_enabled: true,
        is_microdeposits_enabled: true,
      },
      widgetProfile: {
        ...initialState.profiles.widgetProfile,
        show_microdeposits_in_connect: true,
      },
    },
  })

  const renderVerifyingStep = async (finalStatus: number) => {
    const utils = render(<RenderConnectStep {...connectStepProps} />, {
      apiValue: {
        ...apiValueMock,
        loadMicrodepositByGuid: vi
          .fn()
          .mockResolvedValueOnce({ guid: 'MD-123', status: MicrodepositsStatuses.PREINITIATED })
          .mockResolvedValueOnce({
            guid: 'MD-123',
            account_name: 'My Checking Account',
            status: MicrodepositsStatuses.DEPOSITED,
          })
          .mockResolvedValue({
            guid: 'MD-123',
            account_name: 'My Checking Account',
            status: finalStatus,
          }),
        refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
        verifyMicrodeposit: vi.fn().mockResolvedValue({}),
      } as unknown as typeof apiValueMock,
      preloadedState: microdepositsEnabledState('MD-123'),
    })

    await screen.findByText('Enter deposit amounts', {}, { timeout: 4000 })

    await utils.user.type(screen.getByTestId('amount-1-input'), '0.05')
    await utils.user.type(screen.getByTestId('amount-2-input'), '0.07')
    await utils.user.click(screen.getByRole('button', { name: 'Continue' }))

    await screen.findByText('Verifying ...', {}, { timeout: 4000 })
  }

  describe('Rendering', () => {
    it('renders the verifying header, checking-amounts message, and loading spinner', () => {
      renderVerifying()

      const heading = screen.getByRole('heading', { name: 'Verifying ...' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
      expect(screen.getByTestId('checking-amounts-paragraph')).toHaveTextContent(
        'Checking microdeposit amounts.',
      )
      expect(document.querySelector('[data-ui-test="kyper-spinner"]')).toBeInTheDocument()
    })
  })

  describe('Success Flow', () => {
    it('advances to the verified screen when the deposit is verified', async () => {
      await renderVerifyingStep(MicrodepositsStatuses.VERIFIED)

      expect(
        await screen.findByText('Deposits verified', {}, { timeout: 10000 }),
      ).toBeInTheDocument()
    }, 15000)
  })
})
