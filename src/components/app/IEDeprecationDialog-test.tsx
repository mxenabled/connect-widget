import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import userEvent from '@testing-library/user-event'
import { initialState } from 'src/services/mockedData'
import { IEDeprecationDialog } from 'src/components/app/IEDeprecationDialog'
import { PageviewInfo } from 'src/const/Analytics'
import { isIE } from 'src/utilities/Browser'
import type { RootState } from 'src/redux/Store'

vi.mock('src/utilities/Browser')

describe('IEDeprecationDialog', () => {
  const mockOnAnalyticPageview = vi.fn()

  const defaultProps = {
    onAnalyticPageview: mockOnAnalyticPageview,
  }

  const preloadedState = {
    ...initialState,
    profiles: {
      ...initialState.profiles,
      widgetProfile: {
        enable_ie_11_deprecation: true,
      },
    },
  } as unknown as Partial<RootState>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dialog when isIE is true and feature flag is enabled', () => {
      vi.mocked(isIE).mockReturnValue(true)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(screen.getByText('This browser is not supported')).toBeInTheDocument()
    })

    it('does not render when isIE is false', () => {
      vi.mocked(isIE).mockReturnValue(false)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    })

    it('does not render when feature flag is disabled', () => {
      vi.mocked(isIE).mockReturnValue(true)

      const stateWithoutFlag = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          widgetProfile: {
            enable_ie_11_deprecation: false,
          },
        },
      } as unknown as Partial<RootState>

      render(<IEDeprecationDialog {...defaultProps} />, {
        preloadedState: stateWithoutFlag,
      })

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    })

    it('does not render when widgetProfile is null', () => {
      vi.mocked(isIE).mockReturnValue(true)

      const stateWithoutProfile = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          widgetProfile: null,
        },
      } as unknown as Partial<RootState>

      render(<IEDeprecationDialog {...defaultProps} />, {
        preloadedState: stateWithoutProfile,
      })

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    })

    it('renders all text content', () => {
      vi.mocked(isIE).mockReturnValue(true)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(screen.getByText('This browser is not supported')).toBeInTheDocument()
      expect(screen.getByText(/We no longer support Internet Explorer/i)).toBeInTheDocument()
      expect(screen.getByText('Continue')).toBeInTheDocument()
      expect(screen.getByText(/Clicking the links to supported browsers/i)).toBeInTheDocument()
    })

    it('renders browser links with correct hrefs', () => {
      vi.mocked(isIE).mockReturnValue(true)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      const edgeLink = screen.getByText('Edge').closest('a')
      const chromeLink = screen.getByText('Chrome').closest('a')
      const firefoxLink = screen.getByText('Firefox').closest('a')

      expect(edgeLink).toHaveAttribute('href', 'https://www.microsoft.com/edge')
      expect(edgeLink).toHaveAttribute('target', '_blank')
      expect(edgeLink).toHaveAttribute('rel', 'noreferrer noopener')

      expect(chromeLink).toHaveAttribute('href', 'https://www.google.com/chrome/')
      expect(chromeLink).toHaveAttribute('target', '_blank')
      expect(chromeLink).toHaveAttribute('rel', 'noreferrer noopener')

      expect(firefoxLink).toHaveAttribute('href', 'https://www.mozilla.org/firefox/')
      expect(firefoxLink).toHaveAttribute('target', '_blank')
      expect(firefoxLink).toHaveAttribute('rel', 'noreferrer noopener')
    })

    it('renders close button with correct aria-label', () => {
      vi.mocked(isIE).mockReturnValue(true)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('hides dialog when close button is clicked', async () => {
      vi.mocked(isIE).mockReturnValue(true)
      const user = userEvent.setup()
      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      expect(screen.getByText('This browser is not supported')).toBeInTheDocument()

      await user.click(closeButton)

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    })

    it('hides dialog when continue button is clicked', async () => {
      vi.mocked(isIE).mockReturnValue(true)
      const user = userEvent.setup()

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(screen.getByText('This browser is not supported')).toBeInTheDocument()

      await user.click(continueButton)

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    })

    it('keeps dialog hidden after being closed', async () => {
      vi.mocked(isIE).mockReturnValue(true)
      const user = userEvent.setup()

      const { rerender } = render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      await user.click(closeButton)

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()

      rerender(<IEDeprecationDialog {...defaultProps} />)

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    })
  })

  describe('Analytics', () => {
    it('tracks pageview when dialog is shown', () => {
      vi.mocked(isIE).mockReturnValue(true)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(mockOnAnalyticPageview).toHaveBeenCalledWith(PageviewInfo.CONNECT_IE_11_DEPRECATION[1])
      expect(mockOnAnalyticPageview).toHaveBeenCalledTimes(1)
    })

    it('does not track pageview when not IE', () => {
      vi.mocked(isIE).mockReturnValue(false)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(mockOnAnalyticPageview).not.toHaveBeenCalled()
    })

    it('does not track pageview when feature flag is disabled', () => {
      vi.mocked(isIE).mockReturnValue(true)

      const stateWithoutFlag = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          widgetProfile: {
            enable_ie_11_deprecation: false,
          },
        },
      } as unknown as Partial<RootState>

      render(<IEDeprecationDialog {...defaultProps} />, {
        preloadedState: stateWithoutFlag,
      })

      expect(mockOnAnalyticPageview).not.toHaveBeenCalled()
    })

    it('does not track pageview after dialog is closed', async () => {
      vi.mocked(isIE).mockReturnValue(true)
      const user = userEvent.setup()

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(mockOnAnalyticPageview).toHaveBeenCalledTimes(1)

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      await user.click(closeButton)

      expect(mockOnAnalyticPageview).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration', () => {
    it('renders complete dialog structure with all elements', () => {
      vi.mocked(isIE).mockReturnValue(true)

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()

      expect(screen.getByText('This browser is not supported')).toBeInTheDocument()

      expect(screen.getByText('Edge')).toBeInTheDocument()
      expect(screen.getByText('Chrome')).toBeInTheDocument()
      expect(screen.getByText('Firefox')).toBeInTheDocument()
    })

    it('handles full user interaction flow', async () => {
      vi.mocked(isIE).mockReturnValue(true)
      const user = userEvent.setup()

      render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

      expect(screen.getByText('This browser is not supported')).toBeInTheDocument()

      expect(mockOnAnalyticPageview).toHaveBeenCalledWith(PageviewInfo.CONNECT_IE_11_DEPRECATION[1])

      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)

      expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()

      expect(mockOnAnalyticPageview).toHaveBeenCalledTimes(1)
    })

    it('respects all conditional rendering flags', () => {
      const testCases = [
        { isIE: false, flag: false, shouldRender: false },
        { isIE: false, flag: true, shouldRender: false },
        { isIE: true, flag: false, shouldRender: false },
        { isIE: true, flag: true, shouldRender: true },
      ]

      testCases.forEach(({ isIE: ieValue, flag, shouldRender }) => {
        vi.mocked(isIE).mockReturnValue(ieValue)

        const testState = {
          ...initialState,
          profiles: {
            ...initialState.profiles,
            widgetProfile: {
              enable_ie_11_deprecation: flag,
            },
          },
        } as unknown as Partial<RootState>

        const { unmount } = render(<IEDeprecationDialog {...defaultProps} />, {
          preloadedState: testState,
        })

        if (shouldRender) {
          expect(screen.getByText('This browser is not supported')).toBeInTheDocument()
        } else {
          expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
        }

        unmount()
        vi.clearAllMocks()
      })
    })
  })
})
