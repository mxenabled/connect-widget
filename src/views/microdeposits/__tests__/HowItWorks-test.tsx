import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { HowItWorks } from 'src/views/microdeposits/HowItWorks'
import { render, screen } from 'src/utilities/testingLibrary'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

interface HowItWorksProps {
  onContinue: () => void
}

describe('HowItWorks', () => {
  let defaultProps: HowItWorksProps

  beforeEach(() => {
    vi.mocked(fadeOut).mockClear()

    defaultProps = {
      onContinue: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the header text', () => {
      render(<HowItWorks {...defaultProps} />)

      expect(screen.getByText('Connect your institution with account numbers')).toBeInTheDocument()
    })

    it('renders the continue button', () => {
      render(<HowItWorks {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('renders the first instruction about entering account information', () => {
      render(<HowItWorks {...defaultProps} />)

      expect(screen.getByText('Enter your account information.')).toBeInTheDocument()
    })

    it('renders the second instruction about receiving deposits', () => {
      render(<HowItWorks {...defaultProps} />)

      expect(screen.getByText("You'll receive two small deposits.")).toBeInTheDocument()
    })

    it('renders the third instruction about verifying amounts', () => {
      render(<HowItWorks {...defaultProps} />)

      expect(screen.getByText('Return to verify the deposit amounts.')).toBeInTheDocument()
    })

    it('renders all three instructions in order', () => {
      render(<HowItWorks {...defaultProps} />)

      const instructions = screen.getAllByRole('listitem')
      expect(instructions).toHaveLength(3)
      expect(instructions[0]).toHaveTextContent('Enter your account information.')
      expect(instructions[1]).toHaveTextContent("You'll receive two small deposits.")
      expect(instructions[2]).toHaveTextContent('Return to verify the deposit amounts.')
    })
  })

  describe('Continue Button Interaction', () => {
    it('calls fadeOut animation when continue button is clicked', async () => {
      const { user } = render(<HowItWorks {...defaultProps} />)

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'up', 300)
    })

    it('calls onContinue callback after animation completes', async () => {
      const { user } = render(<HowItWorks {...defaultProps} />)

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalled()
      })
    })

    it('calls onContinue only once when button is clicked', async () => {
      const { user } = render(<HowItWorks {...defaultProps} />)

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalledTimes(1)
      })
    })

    it('executes fadeOut before calling onContinue', async () => {
      const callOrder: string[] = []
      vi.mocked(fadeOut).mockImplementation(() => {
        callOrder.push('fadeOut')
        return Promise.resolve()
      })
      const onContinue = vi.fn(() => {
        callOrder.push('onContinue')
      })

      const { user } = render(<HowItWorks {...defaultProps} onContinue={onContinue} />)

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(callOrder).toEqual(['fadeOut', 'onContinue'])
      })
    })
  })

  describe('Accessibility', () => {
    it('uses semantic heading for title', () => {
      render(<HowItWorks {...defaultProps} />)

      const heading = screen.getByRole('heading', {
        name: 'Connect your institution with account numbers',
      })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('uses semantic list for instructions', () => {
      render(<HowItWorks {...defaultProps} />)

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })
  })

  describe('Full Workflow', () => {
    it('completes entire continue flow correctly', async () => {
      const { user } = render(<HowItWorks {...defaultProps} />)

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalledTimes(1)
        expect(defaultProps.onContinue).toHaveBeenCalledTimes(1)
      })
    })
  })
})
