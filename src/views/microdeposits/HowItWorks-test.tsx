import React from 'react'
import { describe, expect, it } from 'vitest'

import { Microdeposits as MicrodepositsComponent } from 'src/views/microdeposits/Microdeposits'
import { render, screen } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

const Microdeposits = MicrodepositsComponent as unknown as React.ComponentType<
  Record<string, unknown>
>

describe('HowItWorks', () => {
  const renderHowItWorksStep = async () => {
    const utils = render(<Microdeposits microdepositGuid={null} stepToIAV={() => {}} />, {
      apiValue: { ...apiValueMock, verifyRoutingNumber: () => Promise.resolve({}) },
    })

    await utils.user.type(await screen.findByTestId('routing-number-input'), '123456789')
    await utils.user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    await screen.findByText('Connect your institution with account numbers')

    return utils
  }

  describe('Initial Rendering', () => {
    it('renders the header text', async () => {
      await renderHowItWorksStep()

      expect(screen.getByText('Connect your institution with account numbers')).toBeInTheDocument()
    })

    it('renders the continue button', async () => {
      await renderHowItWorksStep()

      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('renders the first instruction about entering account information', async () => {
      await renderHowItWorksStep()

      expect(screen.getByText('Enter your account information.')).toBeInTheDocument()
    })

    it('renders the second instruction about receiving deposits', async () => {
      await renderHowItWorksStep()

      expect(screen.getByText("You'll receive two small deposits.")).toBeInTheDocument()
    })

    it('renders the third instruction about verifying amounts', async () => {
      await renderHowItWorksStep()

      expect(screen.getByText('Return to verify the deposit amounts.')).toBeInTheDocument()
    })

    it('renders all three instructions in order', async () => {
      await renderHowItWorksStep()

      const instructions = screen.getAllByRole('listitem')
      expect(instructions).toHaveLength(3)
      expect(instructions[0]).toHaveTextContent('Enter your account information.')
      expect(instructions[1]).toHaveTextContent("You'll receive two small deposits.")
      expect(instructions[2]).toHaveTextContent('Return to verify the deposit amounts.')
    })
  })

  describe('Continue Button Interaction', () => {
    it('advances to the account information step when continue is clicked', async () => {
      const { user } = await renderHowItWorksStep()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByText('Enter account information')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic heading for title', async () => {
      await renderHowItWorksStep()

      const heading = screen.getByRole('heading', {
        name: 'Connect your institution with account numbers',
      })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('uses semantic list for instructions', async () => {
      await renderHowItWorksStep()

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })
  })
})
