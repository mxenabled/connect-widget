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
    it('renders the how-it-works header, instructions, and continue button', async () => {
      await renderHowItWorksStep()

      expect(
        screen.getByRole('heading', { name: 'Connect your institution with account numbers' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()

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
})
