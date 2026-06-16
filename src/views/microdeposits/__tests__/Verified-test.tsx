import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { Verified } from 'src/views/microdeposits/Verified'
import { render, screen } from 'src/utilities/testingLibrary'
import { POST_MESSAGES } from 'src/const/postMessages'
import { PostMessageContext } from 'src/ConnectWidget'
import { AnalyticContext } from 'src/Connect'
import { initialState } from 'src/services/mockedData'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

interface Microdeposit {
  guid: string
}

interface VerifiedProps {
  microdeposit: Microdeposit
  onDone: () => void
}

describe('Verified', () => {
  let defaultProps: VerifiedProps
  let onPostMessage: ReturnType<typeof vi.fn>
  let onAnalyticEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onPostMessage = vi.fn()
    onAnalyticEvent = vi.fn()
    vi.mocked(fadeOut).mockClear()

    defaultProps = {
      microdeposit: {
        guid: 'MD-123',
      },
      onDone: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the deposits verified header', () => {
      render(<Verified {...defaultProps} />)

      expect(screen.getByText('Deposits verified')).toBeInTheDocument()
    })

    it('renders the Verified graphic', () => {
      render(<Verified {...defaultProps} />)

      const svg = screen.getByTestId('svg-header')
      expect(svg).toBeInTheDocument()
    })

    it('renders the continue button', () => {
      render(<Verified {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('displays the success message', () => {
      render(<Verified {...defaultProps} />)

      const message = screen.getByTestId('verified-paragraph')
      expect(message).toHaveTextContent(
        "You're almost done setting things up. Continue to your institution.",
      )
    })

    it('renders accessibility announcement', () => {
      render(<Verified {...defaultProps} />)

      const ariaLive = document.querySelector('[aria-live="polite"]')
      expect(ariaLive).toBeInTheDocument()
    })
  })

  describe('PostMessage Events on Mount', () => {
    it('posts MICRODEPOSIT_VERIFIED message on mount', () => {
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Verified {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MICRODEPOSIT_VERIFIED, {
        microdeposit_guid: 'MD-123',
      })
    })

    it('posts MICRODEPOSIT_VERIFIED with correct guid for different microdeposit', () => {
      const propsWithDifferentGuid = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-789',
        },
      }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Verified {...propsWithDifferentGuid} />
        </PostMessageContext.Provider>,
      )

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MICRODEPOSIT_VERIFIED, {
        microdeposit_guid: 'MD-789',
      })
    })
  })

  describe('Analytics Events on Mount', () => {
    it('sends MEMBER_CONNECTED analytics event on mount with message type', () => {
      render(
        <AnalyticContext.Provider value={{ onAnalyticEvent }}>
          <Verified {...defaultProps} />
        </AnalyticContext.Provider>,
      )

      expect(onAnalyticEvent).toHaveBeenCalledWith(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
        type: 'message',
      })
    })

    it('sends MEMBER_CONNECTED analytics event with url type for mobile webview', () => {
      const preloadedState = {
        ...initialState,
        config: {
          ...initialState.config,
          is_mobile_webview: true,
        },
      }

      render(
        <AnalyticContext.Provider value={{ onAnalyticEvent }}>
          <Verified {...defaultProps} />
        </AnalyticContext.Provider>,
        { preloadedState },
      )

      expect(onAnalyticEvent).toHaveBeenCalledWith(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
        type: 'url',
      })
    })

    it('sends MEMBER_CONNECTED analytics event with message type for non-mobile', () => {
      const preloadedState = {
        ...initialState,
        config: {
          ...initialState.config,
          is_mobile_webview: false,
        },
      }

      render(
        <AnalyticContext.Provider value={{ onAnalyticEvent }}>
          <Verified {...defaultProps} />
        </AnalyticContext.Provider>,
        { preloadedState },
      )

      expect(onAnalyticEvent).toHaveBeenCalledWith(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
        type: 'message',
      })
    })
  })

  describe('Continue Button Interaction', () => {
    it('calls fadeOut animation when continue button is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Verified {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'down')
    })

    it('calls onDone callback after animation completes', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Verified {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(defaultProps.onDone).toHaveBeenCalled()
      })
    })

    it('posts verified primaryAction message when continue is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Verified {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/verified/primaryAction')
    })

    it('posts BACK_TO_SEARCH message when continue is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Verified {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
    })

    it('posts messages in correct order when continue is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Verified {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      onPostMessage.mockClear()

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onPostMessage).toHaveBeenNthCalledWith(
        1,
        'connect/microdeposits/verified/primaryAction',
      )
      expect(onPostMessage).toHaveBeenNthCalledWith(2, POST_MESSAGES.BACK_TO_SEARCH)
    })
  })

  describe('Full Workflow', () => {
    it('completes entire verified flow correctly', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <AnalyticContext.Provider value={{ onAnalyticEvent }}>
            <Verified {...defaultProps} />
          </AnalyticContext.Provider>
        </PostMessageContext.Provider>,
      )

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MICRODEPOSIT_VERIFIED, {
        microdeposit_guid: 'MD-123',
      })
      expect(onAnalyticEvent).toHaveBeenCalledWith(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
        type: 'message',
      })

      onPostMessage.mockClear()

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(onPostMessage).toHaveBeenCalledTimes(2)
        expect(vi.mocked(fadeOut)).toHaveBeenCalledTimes(1)
        expect(defaultProps.onDone).toHaveBeenCalledTimes(1)
      })
    })

    it('handles complete flow with different microdeposit guid', async () => {
      const propsWithDifferentGuid = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-456',
        },
      }
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <AnalyticContext.Provider value={{ onAnalyticEvent }}>
            <Verified {...propsWithDifferentGuid} />
          </AnalyticContext.Provider>
        </PostMessageContext.Provider>,
      )

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MICRODEPOSIT_VERIFIED, {
        microdeposit_guid: 'MD-456',
      })

      onPostMessage.mockClear()

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(propsWithDifferentGuid.onDone).toHaveBeenCalled()
      })
    })

    it('sends all events in correct sequence', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <AnalyticContext.Provider value={{ onAnalyticEvent }}>
            <Verified {...defaultProps} />
          </AnalyticContext.Provider>
        </PostMessageContext.Provider>,
      )

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MICRODEPOSIT_VERIFIED, {
        microdeposit_guid: 'MD-123',
      })
      expect(onAnalyticEvent).toHaveBeenCalledWith(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
        type: 'message',
      })

      onPostMessage.mockClear()
      onAnalyticEvent.mockClear()

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/verified/primaryAction')
      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
      expect(vi.mocked(fadeOut)).toHaveBeenCalled()

      await waitFor(() => {
        expect(defaultProps.onDone).toHaveBeenCalled()
      })

      expect(onAnalyticEvent).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic heading for title', () => {
      render(<Verified {...defaultProps} />)

      const heading = screen.getByRole('heading', { name: 'Deposits verified' })
      expect(heading.tagName).toBe('H2')
    })

    it('announces status change to screen readers', async () => {
      render(<Verified {...defaultProps} />)

      await waitFor(() => {
        const ariaLive = document.querySelector('[aria-live="polite"]')
        expect(ariaLive?.textContent).toBe(
          "Deposits verified. You're almost done setting things up. Continue to your institution.",
        )
      })
    })

    it('has accessible button', () => {
      render(<Verified {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Continue' })
      expect(button).toBeInTheDocument()
    })

    it('marks SVG as decorative with aria-hidden', () => {
      render(<Verified {...defaultProps} />)

      const svg = screen.getByTestId('svg-header')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
