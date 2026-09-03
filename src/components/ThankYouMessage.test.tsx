import React from 'react'

import { render, screen } from 'src/utilities/testingLibrary'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { AnalyticContext } from 'src/Connect'
import { STEPS } from 'src/const/Connect'
import { createRenderConnectStepInitialState } from 'src/utilities/test/createRenderConnectStepInitialState'
import { institutionData } from 'src/services/mockedData'

vi.mock('react-confetti', () => ({ default: () => null }))

describe('<ThankYouMessage />', () => {
  const defaultProps = {
    availableAccountTypes: [],
    handleConsentGoBack: vi.fn(),
    handleCredentialsGoBack: vi.fn(),
    handleOAuthGoBack: vi.fn(),
    navigationRef: React.createRef(),
    onManualAccountAdded: vi.fn(),
    onSuccessfulAggregation: vi.fn(),
    onUpsertMember: vi.fn(),
    setConnectLocalState: vi.fn(),
  }

  const institution = institutionData.institution

  const renderConnectedStep = () => {
    const mockMember = { guid: 'MEM-123', name: 'Test Member' }
    const baseState = createRenderConnectStepInitialState(STEPS.CONNECTED, institution)
    const preloadedState = {
      ...baseState,
      connect: {
        ...baseState.connect,
        currentMemberGuid: mockMember.guid,
        members: [mockMember],
      },
    }

    const portalTarget = document.createElement('div')
    portalTarget.id = 'connect-wrapper'
    document.body.appendChild(portalTarget)

    return render(
      <AnalyticContext.Provider
        value={{
          onAnalyticEvent: () => {},
          onAnalyticPageview: () => {},
          onShowConnectSuccessSurvey: () => {},
          onSubmitConnectSuccessSurvey: () => {},
        }}
      >
        <RenderConnectStep {...defaultProps} />
      </AnalyticContext.Provider>,
      { preloadedState },
    )
  }

  it('shows the thank you confirmation after submitting feedback and returns the user to search when Done is pressed', async () => {
    const { user } = renderConnectedStep()

    await user.click(await screen.findByRole('button', { name: /give feedback/i }))
    await user.click(screen.getByRole('button', { name: '4' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: '4' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    expect(
      await screen.findByRole('heading', { name: 'Thank you for your feedback' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(await screen.findByText('Select your institution')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Thank you for your feedback' }),
    ).not.toBeInTheDocument()
  })
})
