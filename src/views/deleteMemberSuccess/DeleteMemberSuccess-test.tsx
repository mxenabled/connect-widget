import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { initialState, institutionData } from 'src/services/mockedData'
import { PostMessageContext } from 'src/ConnectWidget'
import { STEPS } from 'src/const/Connect'

type RenderDeleteMemberSuccessStepOptions = {
  institution?: typeof institutionData.institution
}

const renderDeleteMemberSuccessStep = ({
  institution = institutionData.institution,
}: RenderDeleteMemberSuccessStepOptions = {}) => {
  const onPostMessage = vi.fn()

  const preloadedState = {
    ...initialState,
    connect: {
      ...initialState.connect,
      location: [{ step: STEPS.DELETE_MEMBER_SUCCESS }],
      selectedInstitution: institution,
    },
  } as unknown as typeof initialState

  return {
    ...render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <RenderConnectStep
          availableAccountTypes={[]}
          handleConsentGoBack={() => {}}
          handleCredentialsGoBack={() => {}}
          navigationRef={React.createRef()}
          onManualAccountAdded={() => {}}
          onUpsertMember={() => {}}
          setConnectLocalState={() => {}}
        />
      </PostMessageContext.Provider>,
      { preloadedState },
    ),
    onPostMessage,
  }
}

describe('<DeleteMemberSuccess />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content Display', () => {
    it('renders the success content with the institution name', () => {
      renderDeleteMemberSuccessStep({
        institution: { ...institutionData.institution, name: 'Custom Bank' },
      })

      expect(screen.getByTestId('disconnected-primary-text')).toHaveTextContent('Disconnected')
      expect(screen.getByTestId('disconnected-secondary-text')).toHaveTextContent(
        'You have successfully disconnected Custom Bank.',
      )
      expect(screen.getByTestId('done-button')).toHaveTextContent('Done')
      expect(screen.getByText('Private and secure')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('posts back to search and returns to the search step when Done is clicked', async () => {
      const { onPostMessage, user } = renderDeleteMemberSuccessStep()

      await user.click(screen.getByTestId('done-button'))

      expect(onPostMessage).toHaveBeenCalledWith('connect/backToSearch')

      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
      expect(screen.queryByTestId('disconnected-primary-text')).not.toBeInTheDocument()
    })
  })
})
