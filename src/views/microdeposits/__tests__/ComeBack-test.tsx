import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { ComeBack } from 'src/views/microdeposits/ComeBack'
import { render, screen } from 'src/utilities/testingLibrary'
import { POST_MESSAGES } from 'src/const/postMessages'
import { PostMessageContext } from 'src/ConnectWidget'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

interface Microdeposit {
  guid: string
  account_name: string
}

interface ComeBackProps {
  microdeposit: Microdeposit
  onDone: () => void
}

describe('ComeBack', () => {
  let defaultProps: ComeBackProps
  let onPostMessage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onPostMessage = vi.fn()
    vi.mocked(fadeOut).mockClear()

    defaultProps = {
      microdeposit: {
        guid: 'MD-123',
        account_name: 'My Checking Account',
      },
      onDone: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the check back soon header', () => {
      render(<ComeBack {...defaultProps} />)

      expect(screen.getByText('Check back soon')).toBeInTheDocument()
    })

    it('renders the ComeBack graphic', () => {
      render(<ComeBack {...defaultProps} />)

      const svg = screen.getByTestId('svg-header')
      expect(svg).toBeInTheDocument()
    })

    it('renders the done button', () => {
      render(<ComeBack {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    })

    it('displays the thanks message with account name', () => {
      render(<ComeBack {...defaultProps} />)

      const message = screen.getByTestId('thanks-paragraph')
      expect(message).toHaveTextContent(
        'Thanks for submitting your account info. Check back soon! In the next few days you should find two small deposits less than a dollar each in your My Checking Account account. When you see them, come back here and enter the amounts.',
      )
    })

    it('displays different account name when provided', () => {
      const propsWithDifferentAccount = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-456',
          account_name: 'Savings Account',
        },
      }
      render(<ComeBack {...propsWithDifferentAccount} />)

      const message = screen.getByTestId('thanks-paragraph')
      expect(message).toHaveTextContent('Savings Account')
    })
  })

  describe('Done Button Interaction', () => {
    it('calls fadeOut animation when done button is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ComeBack {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const doneButton = screen.getByRole('button', { name: 'Done' })
      await user.click(doneButton)

      expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'up', 300)
    })

    it('calls onDone callback after animation completes', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ComeBack {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const doneButton = screen.getByRole('button', { name: 'Done' })
      await user.click(doneButton)

      await waitFor(() => {
        expect(defaultProps.onDone).toHaveBeenCalled()
      })
    })

    it('posts comeBack primaryAction message with microdeposit guid when done is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ComeBack {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const doneButton = screen.getByRole('button', { name: 'Done' })
      await user.click(doneButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/comeBack/primaryAction', {
        microdeposit_guid: 'MD-123',
      })
    })

    it('posts BACK_TO_SEARCH message when done is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ComeBack {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const doneButton = screen.getByRole('button', { name: 'Done' })
      await user.click(doneButton)

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
    })

    it('posts messages in correct order when done is clicked', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ComeBack {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const doneButton = screen.getByRole('button', { name: 'Done' })
      await user.click(doneButton)

      expect(onPostMessage).toHaveBeenNthCalledWith(
        1,
        'connect/microdeposits/comeBack/primaryAction',
        {
          microdeposit_guid: 'MD-123',
        },
      )
      expect(onPostMessage).toHaveBeenNthCalledWith(2, POST_MESSAGES.BACK_TO_SEARCH)
    })

    it('posts correct microdeposit guid for different microdeposit', async () => {
      const propsWithDifferentGuid = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-789',
          account_name: 'Test Account',
        },
      }
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ComeBack {...propsWithDifferentGuid} />
        </PostMessageContext.Provider>,
      )

      const doneButton = screen.getByRole('button', { name: 'Done' })
      await user.click(doneButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/comeBack/primaryAction', {
        microdeposit_guid: 'MD-789',
      })
    })
  })

  describe('Full Workflow', () => {
    it('completes entire done flow correctly', async () => {
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ComeBack {...defaultProps} />
        </PostMessageContext.Provider>,
      )

      const doneButton = screen.getByRole('button', { name: 'Done' })
      await user.click(doneButton)

      await waitFor(() => {
        expect(onPostMessage).toHaveBeenCalledTimes(2)
        expect(vi.mocked(fadeOut)).toHaveBeenCalledTimes(1)
        expect(defaultProps.onDone).toHaveBeenCalledTimes(1)
      })
    })
  })
})
