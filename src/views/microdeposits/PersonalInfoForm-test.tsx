import React from 'react'
import { describe, expect, it } from 'vitest'

import { PersonalInfoForm } from 'src/views/microdeposits/PersonalInfoForm'
import { Microdeposits as MicrodepositsComponent } from 'src/views/microdeposits/Microdeposits'
import { render, screen } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

const Microdeposits = MicrodepositsComponent as unknown as React.ComponentType<
  Record<string, unknown>
>

interface AccountDetails {
  first_name?: string
  last_name?: string
  email?: string
}

interface PersonalInfoFormProps {
  accountDetails?: AccountDetails
}

describe('PersonalInfoForm', () => {
  const renderPersonalInfoForm = (props: PersonalInfoFormProps = {}) =>
    render(<PersonalInfoForm accountDetails={{}} onContinue={() => {}} {...props} />)

  const renderPersonalInfoFormStep = async () => {
    const utils = render(<Microdeposits microdepositGuid={null} stepToIAV={() => {}} />, {
      apiValue: { ...apiValueMock, verifyRoutingNumber: () => Promise.resolve({}) },
    })

    await utils.user.type(await screen.findByTestId('routing-number-input'), '123456789')
    await utils.user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    await utils.user.click(await screen.findByRole('button', { name: 'Continue' }))

    await utils.user.type(await screen.findByTestId('account-number-input'), '123456789')
    await utils.user.type(screen.getByTestId('confirm-account-number-input'), '123456789')
    await utils.user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    await screen.findByText('Enter account holder information')

    return utils
  }

  describe('Rendering', () => {
    it('renders the header, helper text, required fields, and continue button', () => {
      renderPersonalInfoForm()

      expect(
        screen.getByRole('heading', { name: 'Enter account holder information' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'This helps verify account ownership, and should match the first and last name on this account.',
        ),
      ).toBeInTheDocument()

      expect(screen.getByLabelText('First name *')).toBeRequired()
      expect(screen.getByLabelText('Last name *')).toBeRequired()
      expect(screen.getByLabelText('Email *')).toBeRequired()

      expect(
        screen.getByRole('button', { name: 'Continue to account details' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Required')).toBeInTheDocument()

      expect(screen.getByTestId('first-name-input')).toHaveFocus()
      expect(screen.getByTestId('first-name-input')).toHaveValue('')
      expect(screen.getByTestId('last-name-input')).toHaveValue('')
      expect(screen.getByTestId('email-input')).toHaveValue('')
    })
  })

  describe('Pre-populated values', () => {
    it('pre-fills each field from the provided account details', () => {
      renderPersonalInfoForm({
        accountDetails: {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
        },
      })

      expect(screen.getByTestId('first-name-input')).toHaveValue('Jane')
      expect(screen.getByTestId('last-name-input')).toHaveValue('Smith')
      expect(screen.getByTestId('email-input')).toHaveValue('jane.smith@example.com')
    })
  })

  describe('Form input', () => {
    it('updates each field as the user types', async () => {
      const { user } = renderPersonalInfoForm()

      await user.type(screen.getByTestId('first-name-input'), 'Alice')
      await user.type(screen.getByTestId('last-name-input'), 'Johnson')
      await user.type(screen.getByTestId('email-input'), 'alice@test.com')

      expect(screen.getByTestId('first-name-input')).toHaveValue('Alice')
      expect(screen.getByTestId('last-name-input')).toHaveValue('Johnson')
      expect(screen.getByTestId('email-input')).toHaveValue('alice@test.com')
    })

    it('lets the user clear a pre-filled value', async () => {
      const { user } = renderPersonalInfoForm({ accountDetails: { first_name: 'John' } })

      await user.clear(screen.getByTestId('first-name-input'))

      expect(screen.getByTestId('first-name-input')).toHaveValue('')
    })
  })

  describe('Validation', () => {
    it('flags every empty required field on submit', async () => {
      const { user } = renderPersonalInfoForm()

      await user.click(screen.getByRole('button', { name: 'Continue to account details' }))

      expect(await screen.findByTestId('first-name-input')).toHaveAttribute(
        'aria-invalid',
        'First name is required',
      )
      expect(screen.getByTestId('last-name-input')).toHaveAttribute(
        'aria-invalid',
        'Last name is required',
      )
      expect(screen.getByTestId('email-input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('flags an email with an invalid format', async () => {
      const { user } = renderPersonalInfoForm()

      await user.type(screen.getByTestId('first-name-input'), 'John')
      await user.type(screen.getByTestId('last-name-input'), 'Doe')
      await user.type(screen.getByTestId('email-input'), 'invalid-email')
      await user.click(screen.getByRole('button', { name: 'Continue to account details' }))

      expect(await screen.findByTestId('email-input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('announces validation errors to screen readers', async () => {
      const { user } = renderPersonalInfoForm()

      await user.click(screen.getByRole('button', { name: 'Continue to account details' }))

      await screen.findByTestId('first-name-input')
      const ariaLive = document.querySelector('[aria-live="assertive"]')
      expect(ariaLive?.textContent).toContain('First name is required')
      expect(ariaLive?.textContent).toContain('Last name is required')
      expect(ariaLive?.textContent).toContain('Email is required')
    })
  })

  describe('Submission', () => {
    it('advances to the review step with the submitted details', async () => {
      const { user } = await renderPersonalInfoFormStep()

      await user.type(screen.getByTestId('first-name-input'), 'Alice')
      await user.type(screen.getByTestId('last-name-input'), 'Johnson')
      await user.type(screen.getByTestId('email-input'), 'alice.johnson@example.com')
      await user.click(screen.getByRole('button', { name: 'Continue to account details' }))

      expect(await screen.findByText('Review your information')).toBeInTheDocument()
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('alice.johnson@example.com')).toBeInTheDocument()
    })

    it('accepts complex but valid email formats', async () => {
      const { user } = await renderPersonalInfoFormStep()

      await user.type(screen.getByTestId('first-name-input'), 'Test')
      await user.type(screen.getByTestId('last-name-input'), 'User')
      await user.type(screen.getByTestId('email-input'), 'test.user+tag@example.co.uk')
      await user.click(screen.getByRole('button', { name: 'Continue to account details' }))

      expect(await screen.findByText('Review your information')).toBeInTheDocument()
      expect(screen.getByText('test.user+tag@example.co.uk')).toBeInTheDocument()
    })

    it('stays on the form when submitted with validation errors', async () => {
      const { user } = await renderPersonalInfoFormStep()

      await user.click(screen.getByRole('button', { name: 'Continue to account details' }))

      expect(await screen.findByTestId('first-name-input')).toHaveAttribute(
        'aria-invalid',
        'First name is required',
      )
      expect(screen.getByText('Enter account holder information')).toBeInTheDocument()
    })
  })
})
