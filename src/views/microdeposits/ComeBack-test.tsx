import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { render, screen } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'

describe('ComeBack', () => {
  const microdeposit = {
    guid: 'MD-123',
    account_name: 'My Checking Account',
    status: MicrodepositsStatuses.REQUESTED,
  }

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

  const renderComeBackStep = () =>
    render(<RenderConnectStep {...connectStepProps} />, {
      apiValue: {
        ...apiValueMock,
        loadMicrodepositByGuid: vi
          .fn()
          .mockResolvedValueOnce({ ...microdeposit, status: MicrodepositsStatuses.PREINITIATED })
          .mockResolvedValue(microdeposit),
        refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
      } as unknown as typeof apiValueMock,
      preloadedState: microdepositsEnabledState(microdeposit.guid),
    })

  it('shows the come-back message once the microdeposit loads', async () => {
    renderComeBackStep()

    expect(await screen.findByText('Check back soon', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByTestId('thanks-paragraph')).toHaveTextContent('My Checking Account')
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('returns the user to institution search when Done is clicked', async () => {
    const { user } = renderComeBackStep()

    const doneButton = await screen.findByRole('button', { name: 'Done' }, { timeout: 4000 })
    await user.click(doneButton)

    expect(await screen.findByTestId('search-header')).toBeInTheDocument()
  })
})
