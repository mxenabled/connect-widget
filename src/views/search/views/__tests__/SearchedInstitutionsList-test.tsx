import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { of } from 'rxjs'

import { SearchedInstitutionsList } from 'src/views/search/views/SearchedInstitutionsList'
import { render, screen } from 'src/utilities/testingLibrary'
import { SEARCHED_INSTITUTIONS } from 'src/services/mockedData'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { useAnalyticsEvent } from 'src/hooks/useAnalyticsEvent'
import useSelectInstitution from 'src/hooks/useSelectInstitution'
import { PageviewInfo, AnalyticEvents, AuthenticationMethods } from 'src/const/Analytics'
import { PostMessageContext } from 'src/ConnectWidget'
import { initialState } from 'src/services/mockedData'

vi.mock('src/hooks/useAnalyticsPath')
vi.mock('src/hooks/useAnalyticsEvent')
vi.mock('src/hooks/useSelectInstitution')

describe('SearchedInstitutionsList', () => {
  let defaultProps: {
    currentSearchResults: unknown[]
    institutions: typeof SEARCHED_INSTITUTIONS
    institutionSearch: ReturnType<typeof vi.fn>
    setAriaLiveRegionMessage: ReturnType<typeof vi.fn>
  }
  let sendAnalyticsEvent: ReturnType<typeof vi.fn>
  let handleSelectInstitution: ReturnType<typeof vi.fn>
  let onPostMessage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    sendAnalyticsEvent = vi.fn()
    handleSelectInstitution = vi.fn()
    onPostMessage = vi.fn()

    vi.mocked(useAnalyticsPath).mockReturnValue(undefined)
    vi.mocked(useAnalyticsEvent).mockReturnValue(sendAnalyticsEvent)
    vi.mocked(useSelectInstitution).mockReturnValue({
      handleSelectInstitution,
    })

    defaultProps = {
      currentSearchResults: SEARCHED_INSTITUTIONS,
      institutions: SEARCHED_INSTITUTIONS,
      institutionSearch: vi.fn(() => of({})),
      setAriaLiveRegionMessage: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the search results count', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(screen.getByText('5 search results')).toBeInTheDocument()
    })

    it('renders singular result count when there is one institution', () => {
      const singleInstitution = [SEARCHED_INSTITUTIONS[0]]
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList
            {...defaultProps}
            currentSearchResults={singleInstitution}
            institutions={singleInstitution}
          />
        </PostMessageContext.Provider>,
      )

      expect(screen.getByText('1 search result')).toBeInTheDocument()
    })

    it('renders institution tiles for each institution', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      SEARCHED_INSTITUTIONS.forEach((institution) => {
        expect(screen.getByText(institution.name)).toBeInTheDocument()
      })
    })

    it('renders horizontal rule separator', () => {
      const { container } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const hr = container.querySelector('hr')
      expect(hr).toBeInTheDocument()
      expect(hr).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders load more institutions button when there are search results', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(screen.getByRole('button', { name: 'Load more institutions' })).toBeInTheDocument()
    })

    it('does not render load more button when currentSearchResults is empty', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} currentSearchResults={[]} />
        </PostMessageContext.Provider>,
      )

      expect(
        screen.queryByRole('button', { name: 'Load more institutions' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Analytics', () => {
    it('calls useAnalyticsPath with CONNECT_SEARCHED pageview info', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_SEARCHED)
    })
  })

  describe('Aria-Live Region', () => {
    it('calls setAriaLiveRegionMessage with search results count on mount', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(defaultProps.setAriaLiveRegionMessage).toHaveBeenCalledWith('5 search results')
    })

    it('updates aria-live message when institutions count changes', () => {
      const { rerender } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(defaultProps.setAriaLiveRegionMessage).toHaveBeenCalledWith('5 search results')

      const newInstitutions = SEARCHED_INSTITUTIONS.slice(0, 2)
      rerender(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} institutions={newInstitutions} />
        </PostMessageContext.Provider>,
      )

      expect(defaultProps.setAriaLiveRegionMessage).toHaveBeenCalledWith('2 search results')
    })

    it('clears aria-live message on unmount', () => {
      const { unmount } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      unmount()

      expect(defaultProps.setAriaLiveRegionMessage).toHaveBeenCalledWith('')
    })
  })

  describe('Institution Selection', () => {
    it('calls handleSelectInstitution when an institution is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const firstInstitution = screen.getByText(SEARCHED_INSTITUTIONS[0].name)
      await user.click(firstInstitution)

      expect(handleSelectInstitution).toHaveBeenCalledWith(SEARCHED_INSTITUTIONS[0])
    })

    it('sends analytics event when institution is selected', async () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          clientProfile: {
            ...initialState.profiles.clientProfile,
            uses_oauth: false,
          },
        },
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const firstInstitution = screen.getByText(SEARCHED_INSTITUTIONS[0].name)
      await user.click(firstInstitution)

      expect(sendAnalyticsEvent).toHaveBeenCalledWith(
        AnalyticEvents.SELECT_SEARCHED_INSTITUTION,
        expect.objectContaining({
          authentication_method: AuthenticationMethods.NON_OAUTH,
          institution_guid: SEARCHED_INSTITUTIONS[0].guid,
          institution_name: SEARCHED_INSTITUTIONS[0].name,
        }),
      )
    })

    it('sends OAuth authentication method when client uses OAuth and institution supports it', async () => {
      const oauthInstitution = { ...SEARCHED_INSTITUTIONS[0], supports_oauth: true }
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          clientProfile: {
            ...initialState.profiles.clientProfile,
            uses_oauth: true,
          },
        },
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList
            {...defaultProps}
            currentSearchResults={[oauthInstitution]}
            institutions={[oauthInstitution]}
          />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const institution = screen.getByText(oauthInstitution.name)
      await user.click(institution)

      expect(sendAnalyticsEvent).toHaveBeenCalledWith(
        AnalyticEvents.SELECT_SEARCHED_INSTITUTION,
        expect.objectContaining({
          authentication_method: AuthenticationMethods.OAUTH,
        }),
      )
    })

    it('sends postMessage when institution is selected', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const firstInstitution = screen.getByText(SEARCHED_INSTITUTIONS[0].name)
      await user.click(firstInstitution)

      expect(onPostMessage).toHaveBeenCalledWith('connect/selectedInstitution', {
        name: SEARCHED_INSTITUTIONS[0].name,
        guid: SEARCHED_INSTITUTIONS[0].guid,
        url: SEARCHED_INSTITUTIONS[0].url,
        code: SEARCHED_INSTITUTIONS[0].code,
      })
    })
  })

  describe('Load More Institutions', () => {
    it('calls institutionSearch when load more button is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const loadMoreButton = screen.getByRole('button', { name: 'Load more institutions' })
      await user.click(loadMoreButton)

      await waitFor(() => {
        expect(defaultProps.institutionSearch).toHaveBeenCalledWith(2)
      })
    })

    it('increments page number on successive load more clicks', async () => {
      const institutionSearchMock = vi.fn(() => of({}))
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} institutionSearch={institutionSearchMock} />
        </PostMessageContext.Provider>,
      )

      const loadMoreButton = screen.getByRole('button', { name: 'Load more institutions' })

      await user.click(loadMoreButton)
      await waitFor(() => {
        expect(institutionSearchMock).toHaveBeenCalledWith(2)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Load more institutions' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Load more institutions' }))
      await waitFor(() => {
        expect(institutionSearchMock).toHaveBeenCalledWith(3)
      })
    })
  })

  describe('Manual Accounts', () => {
    it('renders add account manually button when enableManualAccounts is true', () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          client: {
            ...initialState.profiles.client,
            has_atrium_api: false,
          },
          widgetProfile: {
            ...initialState.profiles.widgetProfile,
            enable_manual_accounts: true,
          },
        },
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(screen.getByRole('button', { name: 'Add account manually' })).toBeInTheDocument()
    })

    it('does not render manual accounts button when enable_manual_accounts is false', () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          widgetProfile: {
            ...initialState.profiles.widgetProfile,
            enable_manual_accounts: false,
          },
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('does not render manual accounts button when client has_atrium_api', () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          client: {
            ...initialState.profiles.client,
            has_atrium_api: true,
          },
          widgetProfile: {
            ...initialState.profiles.widgetProfile,
            enable_manual_accounts: true,
          },
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('calls redux action when button is clicked', async () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          client: {
            ...initialState.profiles.client,
            has_atrium_api: false,
          },
          widgetProfile: {
            ...initialState.profiles.widgetProfile,
            enable_manual_accounts: true,
          },
        },
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const manualAccountButton = screen.getByRole('button', { name: 'Add account manually' })
      await user.click(manualAccountButton)

      expect(manualAccountButton).toBeInTheDocument()
    })
  })

  describe('Microdeposits', () => {
    it('renders connect with account numbers button when microdeposits is enabled', () => {
      const preloadedState = {
        ...initialState,
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
        config: {
          ...initialState.config,
          mode: 'verification',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(
        screen.getByRole('button', { name: 'Connect with account numbers' }),
      ).toBeInTheDocument()
    })

    it('does not render microdeposits button when mode is not verification', () => {
      const preloadedState = {
        ...initialState,
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(
        screen.queryByRole('button', { name: 'Connect with account numbers' }),
      ).not.toBeInTheDocument()
    })

    it('does not render microdeposits button when account_verification_is_enabled is false', () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          clientProfile: {
            ...initialState.profiles.clientProfile,
            account_verification_is_enabled: false,
          },
        },
        config: {
          ...initialState.config,
          mode: 'verification',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(
        screen.queryByRole('button', { name: 'Connect with account numbers' }),
      ).not.toBeInTheDocument()
    })

    it('calls redux action when button is clicked', async () => {
      const preloadedState = {
        ...initialState,
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
        config: {
          ...initialState.config,
          mode: 'verification',
        },
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const microdepositsButton = screen.getByRole('button', {
        name: 'Connect with account numbers',
      })
      await user.click(microdepositsButton)

      expect(microdepositsButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders buttons with text variant', () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          client: {
            ...initialState.profiles.client,
            has_atrium_api: false,
          },
          widgetProfile: {
            ...initialState.profiles.widgetProfile,
            enable_manual_accounts: true,
          },
        },
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const loadMoreButton = screen.getByRole('button', { name: 'Load more institutions' })
      const manualAccountButton = screen.getByRole('button', { name: 'Add account manually' })

      expect(loadMoreButton).toHaveClass('MuiButton-text')
      expect(manualAccountButton).toHaveClass('MuiButton-text')
    })

    it('renders all institution names', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <SearchedInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      SEARCHED_INSTITUTIONS.forEach((institution) => {
        expect(screen.getByText(institution.name)).toBeVisible()
      })
    })
  })
})
