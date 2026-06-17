import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { PopularInstitutionsList } from 'src/views/search/views/PopularInstitutionsList'
import { render, screen } from 'src/utilities/testingLibrary'
import { FAVORITE_INSTITUTIONS, initialState } from 'src/services/mockedData'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import useSelectInstitution from 'src/hooks/useSelectInstitution'
import { PageviewInfo } from 'src/const/Analytics'
import { PostMessageContext } from 'src/ConnectWidget'

vi.mock('src/hooks/useAnalyticsPath')
vi.mock('src/hooks/useSelectInstitution')

export const dispatch = vi.fn()
vi.mock('react-redux', async (importActual) => {
  const actual = (await importActual()) as object
  return { ...actual, useDispatch: () => dispatch }
})

describe('PopularInstitutionsList', () => {
  let defaultProps: {
    institutions: typeof FAVORITE_INSTITUTIONS
    onSearchInstitutionClick: ReturnType<typeof vi.fn>
  }
  let handleSelectInstitution: ReturnType<typeof vi.fn>
  let onPostMessage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    handleSelectInstitution = vi.fn()
    onPostMessage = vi.fn()

    vi.mocked(useAnalyticsPath).mockReturnValue(undefined)
    vi.mocked(useSelectInstitution).mockReturnValue({
      handleSelectInstitution,
    })

    defaultProps = {
      institutions: FAVORITE_INSTITUTIONS,
      onSearchInstitutionClick: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders institution grid with institutions', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(screen.getByText('Gringotts')).toBeInTheDocument()
      expect(screen.getByText('American Express Credit Card')).toBeInTheDocument()
    })

    it('filters out disabled institutions', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(screen.queryByText('Chase')).not.toBeInTheDocument()
    })

    it('renders search for your institution button', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const searchButton = screen.getByRole('button', { name: 'Search for your institution' })
      expect(searchButton).toBeInTheDocument()
      expect(searchButton).toHaveClass('MuiButton-text')
    })

    it('renders horizontal rule separator', () => {
      const { container } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const hr = container.querySelector('hr')
      expect(hr).toBeInTheDocument()
      expect(hr).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not render manual account button when conditions are not met', () => {
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
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })
  })

  describe('Analytics', () => {
    it('calls useAnalyticsPath with CONNECT_SEARCH_POPULAR', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_SEARCH_POPULAR)
    })
  })

  describe('Institution Selection', () => {
    it('calls postMessage when institution is selected', async () => {
      const user = userEvent.setup()

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const institutionButton = screen.getByRole('button', {
        name: 'Add account with Gringotts',
      })
      await user.click(institutionButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/selectedInstitution', {
        name: 'Gringotts',
        guid: 'INS-123',
        url: 'https://gringotts.sand.internal.mx',
        code: 'gringotts',
      })
    })

    it('calls handleSelectInstitution when institution is selected', async () => {
      const user = userEvent.setup()

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const institutionButton = screen.getByRole('button', {
        name: 'Add account with Gringotts',
      })
      await user.click(institutionButton)

      expect(handleSelectInstitution).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Gringotts',
          guid: 'INS-123',
        }),
      )
    })
  })

  describe('Search Button', () => {
    it('calls onSearchInstitutionClick when search button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const searchButton = screen.getByRole('button', { name: 'Search for your institution' })
      await user.click(searchButton)

      expect(defaultProps.onSearchInstitutionClick).toHaveBeenCalled()
    })

    it('renders search button with correct test id', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const searchButton = screen.getByTestId('search-for-your-institution-button')
      expect(searchButton).toBeInTheDocument()
    })
  })

  describe('Manual Accounts', () => {
    it('renders add account manually button when conditions are met', () => {
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
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const manualAccountButton = screen.getByRole('button', { name: 'Add account manually' })
      expect(manualAccountButton).toBeInTheDocument()
      expect(manualAccountButton).toHaveClass('MuiButton-text')
    })

    it('does not render manual accounts button when enable_manual_accounts is false', () => {
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
            enable_manual_accounts: false,
          },
        },
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('does not render manual accounts button when mode is verification', () => {
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
          mode: 'verification',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
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
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(screen.queryByRole('button', { name: 'Add account manually' })).not.toBeInTheDocument()
    })

    it('manual account button is clickable', async () => {
      const user = userEvent.setup()

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
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const manualAccountButton = screen.getByRole('button', { name: 'Add account manually' })
      await user.click(manualAccountButton)

      expect(manualAccountButton).toBeInTheDocument()
    })

    it('renders manual account button with correct test id', () => {
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
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const manualAccountButton = screen.getByTestId('add-account-manually-button')
      expect(manualAccountButton).toBeInTheDocument()
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
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      const searchButton = screen.getByRole('button', { name: 'Search for your institution' })
      const manualAccountButton = screen.getByRole('button', { name: 'Add account manually' })

      expect(searchButton).toHaveClass('MuiButton-text')
      expect(manualAccountButton).toHaveClass('MuiButton-text')
    })

    it('renders institutions that are readable', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const gringottsButton = screen.getByRole('button', {
        name: 'Add account with Gringotts',
      })
      expect(gringottsButton).toBeVisible()
    })
  })

  describe('Styling', () => {
    it('renders with correct container styles', () => {
      const { container } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <PopularInstitutionsList {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const listContainer = container.querySelector('[style*="flex"]')
      expect(listContainer).toBeInTheDocument()
    })
  })
})
