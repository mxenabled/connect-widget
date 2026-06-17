import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { SearchNoResult } from 'src/views/search/views/SearchNoResult'
import { render, screen } from 'src/utilities/testingLibrary'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { initialState } from 'src/services/mockedData'

vi.mock('src/hooks/useAnalyticsPath')

describe('SearchNoResult', () => {
  let defaultProps: {
    searchTerm: string
    setAriaLiveRegionMessage: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.mocked(useAnalyticsPath).mockReturnValue(undefined)

    defaultProps = {
      searchTerm: 'test bank',
      setAriaLiveRegionMessage: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders no results message with search term', () => {
      render(<SearchNoResult {...defaultProps} />)

      const results = screen.getByTestId('0-search-results')
      expect(results).toHaveTextContent(/No results found/)
      expect(results).toHaveTextContent(/test bank/)
    })

    it('renders with different search term', () => {
      render(<SearchNoResult {...defaultProps} searchTerm="another search" />)

      const results = screen.getByTestId('0-search-results')
      expect(results).toHaveTextContent(/No results found/)
      expect(results).toHaveTextContent(/another search/)
    })

    it('renders suggestion message', () => {
      render(<SearchNoResult {...defaultProps} />)

      expect(
        screen.getByText('Check spelling and try again, or try searching for another institution.'),
      ).toBeInTheDocument()
    })

    it('renders horizontal rule separator', () => {
      const { container } = render(<SearchNoResult {...defaultProps} />)

      const hr = container.querySelector('hr')
      expect(hr).toBeInTheDocument()
      expect(hr).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not render manual accounts button by default', () => {
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
      render(<SearchNoResult {...defaultProps} />, { preloadedState })

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('does not render microdeposits button by default', () => {
      const preloadedState = {
        ...initialState,
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
      }
      render(<SearchNoResult {...defaultProps} />, { preloadedState })

      expect(
        screen.queryByRole('button', { name: 'Connect with account numbers' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Analytics', () => {
    it('calls useAnalyticsPath with CONNECT_SEARCH_NO_RESULTS and search term', () => {
      render(<SearchNoResult {...defaultProps} />)

      expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_SEARCH_NO_RESULTS, {
        search_term: 'test bank',
      })
    })

    it('passes correct search term in analytics metadata', () => {
      render(<SearchNoResult {...defaultProps} searchTerm="custom search" />)

      expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_SEARCH_NO_RESULTS, {
        search_term: 'custom search',
      })
    })
  })

  describe('Aria-Live Region', () => {
    it('calls setAriaLiveRegionMessage after timeout', async () => {
      render(<SearchNoResult {...defaultProps} />)

      await waitFor(
        () => {
          expect(defaultProps.setAriaLiveRegionMessage).toHaveBeenCalled()
          const calls = defaultProps.setAriaLiveRegionMessage.mock.calls
          const messageCall = calls.find((call) => call[0].includes('No results'))
          expect(messageCall).toBeDefined()
        },
        { timeout: 1500 },
      )
    })

    it('clears aria-live message on unmount', async () => {
      const { unmount } = render(<SearchNoResult {...defaultProps} />)

      await waitFor(
        () => {
          expect(defaultProps.setAriaLiveRegionMessage).toHaveBeenCalled()
        },
        { timeout: 1500 },
      )

      unmount()

      expect(defaultProps.setAriaLiveRegionMessage).toHaveBeenCalledWith('')
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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('calls redux action when manual account button is clicked', async () => {
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

      const { user } = render(<SearchNoResult {...defaultProps} />, { preloadedState })

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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

      expect(
        screen.queryByRole('button', { name: 'Connect with account numbers' }),
      ).not.toBeInTheDocument()
    })

    it('calls redux action when microdeposits button is clicked', async () => {
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

      const { user } = render(<SearchNoResult {...defaultProps} />, { preloadedState })

      const microdepositsButton = screen.getByRole('button', {
        name: 'Connect with account numbers',
      })
      await user.click(microdepositsButton)

      expect(microdepositsButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders manual account button with text variant', () => {
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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

      const manualAccountButton = screen.getByRole('button', { name: 'Add account manually' })
      expect(manualAccountButton).toHaveClass('MuiButton-text')
    })

    it('renders microdeposits button with text variant', () => {
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

      render(<SearchNoResult {...defaultProps} />, { preloadedState })

      const microdepositsButton = screen.getByRole('button', {
        name: 'Connect with account numbers',
      })
      expect(microdepositsButton).toHaveClass('MuiButton-text')
    })

    it('renders messages that are readable', () => {
      render(<SearchNoResult {...defaultProps} />)

      const noResultsText = screen.getByTestId('0-search-results')
      const suggestionText = screen.getByTestId('0-search-results-paragraph')

      expect(noResultsText).toBeVisible()
      expect(suggestionText).toBeVisible()
    })
  })
})
