import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { initialState, institutionData } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { STEPS } from 'src/const/Connect'

describe('<LeavingAction />', () => {
  const impededMember = {
    guid: 'MBR-123',
    error: {},
    name: 'Test Member',
    connection_status: ReadableStatuses.IMPEDED,
  }

  const preloadedState = {
    ...initialState,
    connect: {
      ...initialState.connect,
      location: [{ step: STEPS.ACTIONABLE_ERROR }],
      selectedInstitution: institutionData.institution,
      currentMemberGuid: impededMember.guid,
      members: [impededMember],
    },
  }

  const renderStepProps = {
    availableAccountTypes: [],
    handleConsentGoBack: vi.fn(),
    handleCredentialsGoBack: vi.fn(),
    navigationRef: React.createRef(),
    onManualAccountAdded: vi.fn(),
    onUpsertMember: vi.fn(),
    setConnectLocalState: vi.fn(),
  }

  let openSpy: MockInstance<typeof window.open>

  beforeEach(() => {
    vi.clearAllMocks()
    openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  const renderLeavingNotice = async () => {
    const view = render(
      <div id="connect-wrapper">
        <RenderConnectStep {...renderStepProps} />
      </div>,
      { preloadedState },
    )

    await view.user.click(screen.getByText('Visit website'))

    return view
  }

  describe('Content Display', () => {
    it('renders the leaving notice with continue and cancel actions', async () => {
      await renderLeavingNotice()

      expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      expect(screen.getByTestId('leaving-notice-flat-continue-button')).toBeInTheDocument()
      expect(screen.getByTestId('leaving-notice-flat-cancel-button')).toBeInTheDocument()
    })
  })

  describe('Cancel Button', () => {
    it('dismisses the leaving notice and returns to the error without navigating', async () => {
      const { user } = await renderLeavingNotice()

      await user.click(screen.getByTestId('leaving-notice-flat-cancel-button'))

      expect(await screen.findByText('Your attention is needed')).toBeInTheDocument()
      expect(screen.queryByTestId('leaving-notice-flat-header')).not.toBeInTheDocument()
      expect(openSpy).not.toHaveBeenCalled()
    })
  })

  describe('Continue Button', () => {
    it("opens the institution's login page in a new tab", async () => {
      const { user } = await renderLeavingNotice()

      await user.click(screen.getByTestId('leaving-notice-flat-continue-button'))

      expect(openSpy).toHaveBeenCalledWith('https://test.com', '_blank')
    })
  })
})
