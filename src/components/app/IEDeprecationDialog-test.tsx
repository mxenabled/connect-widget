import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import userEvent from '@testing-library/user-event'
import { initialState } from 'src/services/mockedData'
import { PageviewInfo } from 'src/const/Analytics'
import type { RootState } from 'src/redux/Store'

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

  const setUserAgent = (userAgent: string) => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: userAgent,
      configurable: true,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('renders dialog when using IE with feature flag enabled', async () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko')
    vi.resetModules()

    const { IEDeprecationDialog } = await import('src/components/app/IEDeprecationDialog')

    render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

    expect(screen.getByText('This browser is not supported')).toBeInTheDocument()
    expect(mockOnAnalyticPageview).toHaveBeenCalledWith(PageviewInfo.CONNECT_IE_11_DEPRECATION[1])
  })

  it('does not render when not using IE', async () => {
    setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    )
    vi.resetModules()

    const { IEDeprecationDialog } = await import('src/components/app/IEDeprecationDialog')

    render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

    expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    expect(mockOnAnalyticPageview).not.toHaveBeenCalled()
  })

  it('does not render when feature flag is disabled', async () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko')
    vi.resetModules()

    const { IEDeprecationDialog } = await import('src/components/app/IEDeprecationDialog')

    const stateWithoutFlag = {
      ...initialState,
      profiles: {
        ...initialState.profiles,
        widgetProfile: {
          enable_ie_11_deprecation: false,
        },
      },
    } as unknown as Partial<RootState>

    render(<IEDeprecationDialog {...defaultProps} />, { preloadedState: stateWithoutFlag })

    expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
    expect(mockOnAnalyticPageview).not.toHaveBeenCalled()
  })

  it('hides dialog when close button is clicked', async () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko')
    vi.resetModules()

    const { IEDeprecationDialog } = await import('src/components/app/IEDeprecationDialog')
    const user = userEvent.setup()

    render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

    expect(screen.getByText('This browser is not supported')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close modal/i }))

    expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
  })

  it('hides dialog when continue button is clicked', async () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko')
    vi.resetModules()

    const { IEDeprecationDialog } = await import('src/components/app/IEDeprecationDialog')
    const user = userEvent.setup()

    render(<IEDeprecationDialog {...defaultProps} />, { preloadedState })

    expect(screen.getByText('This browser is not supported')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.queryByText('This browser is not supported')).not.toBeInTheDocument()
  })
})
