import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { Verified } from 'src/views/microdeposits/Verified'
import { render, screen } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'

describe('Verified', () => {
  const renderVerified = () =>
    render(<Verified microdeposit={{ guid: 'MD-123' }} onDone={() => {}} />)

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

  const renderVerifiedStep = async () => {
    const utils = render(<RenderConnectStep {...connectStepProps} />, {
      apiValue: {
        ...apiValueMock,
        loadMicrodepositByGuid: vi
          .fn()
          .mockResolvedValueOnce({ guid: 'MD-123', status: MicrodepositsStatuses.PREINITIATED })
          .mockResolvedValue({ guid: 'MD-123', status: MicrodepositsStatuses.VERIFIED }),
        refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
      } as unknown as typeof apiValueMock,
      preloadedState: microdepositsEnabledState('MD-123'),
    })

    await screen.findByText('Deposits verified', {}, { timeout: 4000 })

    return utils
  }

  describe('Rendering', () => {
    it('renders the deposits verified header and success message', () => {
      renderVerified()

      expect(screen.getByText('Deposits verified')).toBeInTheDocument()
      expect(screen.getByTestId('verified-paragraph')).toHaveTextContent(
        "You're almost done setting things up. Continue to your institution.",
      )
    })

    it('renders the verified graphic and continue button', () => {
      renderVerified()

      expect(screen.getByTestId('svg-header')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('announces the verified status to screen readers', async () => {
      renderVerified()

      expect(
        await screen.findByText(
          "Deposits verified. You're almost done setting things up. Continue to your institution.",
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Continue', () => {
    it('returns the user to search when continue is clicked', async () => {
      const { user } = await renderVerifiedStep()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses a semantic H2 heading for the title', () => {
      renderVerified()

      const heading = screen.getByRole('heading', { name: 'Deposits verified' })
      expect(heading.tagName).toBe('H2')
    })

    it('marks the decorative graphic as hidden from assistive tech', () => {
      renderVerified()

      expect(screen.getByTestId('svg-header')).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
