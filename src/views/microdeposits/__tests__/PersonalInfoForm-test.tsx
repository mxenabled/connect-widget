import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PersonalInfoForm } from 'src/views/microdeposits/PersonalInfoForm'
import { render, screen } from 'src/utilities/testingLibrary'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

interface AccountDetails {
  first_name?: string
  last_name?: string
  email?: string
}

interface PersonalInfoFormProps {
  accountDetails: AccountDetails
  onContinue: (details: AccountDetails) => void
}

describe('PersonalInfoForm', () => {
  let defaultProps: PersonalInfoFormProps

  beforeEach(() => {
    defaultProps = {
      accountDetails: {},
      onContinue: vi.fn(),
    }
    vi.mocked(fadeOut).mockClear()
  })

  describe('Initial Rendering', () => {
    it('renders the form with correct header', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      expect(screen.getByText('Enter account holder information')).toBeInTheDocument()
      expect(
        screen.getByText(
          'This helps verify account ownership, and should match the first and last name on this account.',
        ),
      ).toBeInTheDocument()
    })

    it('renders all three input fields', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      expect(screen.getByLabelText('First name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Last name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Email *')).toBeInTheDocument()
    })

    it('renders continue button', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Continue to account details' }),
      ).toBeInTheDocument()
    })

    it('shows required field note', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('auto-focuses the first name input', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      const input = screen.getByTestId('first-name-input')
      expect(input).toHaveFocus()
    })

    it('renders empty form fields when no accountDetails provided', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      expect(screen.getByTestId('first-name-input')).toHaveValue('')
      expect(screen.getByTestId('last-name-input')).toHaveValue('')
      expect(screen.getByTestId('email-input')).toHaveValue('')
    })
  })

  describe('Pre-populated Values', () => {
    it('pre-fills first name from accountDetails', () => {
      const propsWithData = {
        ...defaultProps,
        accountDetails: { first_name: 'John' },
      }
      render(<PersonalInfoForm {...propsWithData} />)

      expect(screen.getByTestId('first-name-input')).toHaveValue('John')
    })

    it('pre-fills last name from accountDetails', () => {
      const propsWithData = {
        ...defaultProps,
        accountDetails: { last_name: 'Doe' },
      }
      render(<PersonalInfoForm {...propsWithData} />)

      expect(screen.getByTestId('last-name-input')).toHaveValue('Doe')
    })

    it('pre-fills email from accountDetails', () => {
      const propsWithData = {
        ...defaultProps,
        accountDetails: { email: 'john.doe@example.com' },
      }
      render(<PersonalInfoForm {...propsWithData} />)

      expect(screen.getByTestId('email-input')).toHaveValue('john.doe@example.com')
    })

    it('pre-fills all fields from complete accountDetails', () => {
      const propsWithData = {
        ...defaultProps,
        accountDetails: {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
        },
      }
      render(<PersonalInfoForm {...propsWithData} />)

      expect(screen.getByTestId('first-name-input')).toHaveValue('Jane')
      expect(screen.getByTestId('last-name-input')).toHaveValue('Smith')
      expect(screen.getByTestId('email-input')).toHaveValue('jane.smith@example.com')
    })
  })

  describe('Form Input', () => {
    it('updates first name when user types', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const input = screen.getByTestId('first-name-input')
      await user.type(input, 'Alice')

      expect(input).toHaveValue('Alice')
    })

    it('updates last name when user types', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const input = screen.getByTestId('last-name-input')
      await user.type(input, 'Johnson')

      expect(input).toHaveValue('Johnson')
    })

    it('updates email when user types', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const input = screen.getByTestId('email-input')
      await user.type(input, 'alice@test.com')

      expect(input).toHaveValue('alice@test.com')
    })

    it('allows clearing pre-filled values', async () => {
      const user = userEvent.setup()
      const propsWithData = {
        ...defaultProps,
        accountDetails: { first_name: 'John' },
      }
      render(<PersonalInfoForm {...propsWithData} />)

      const input = screen.getByTestId('first-name-input')
      await user.clear(input)

      expect(input).toHaveValue('')
    })
  })

  describe('Form Validation', () => {
    it('shows error when first name is empty on submit', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('first-name-input')
        expect(input).toHaveAttribute('aria-invalid')
      })
    })

    it('shows error when last name is empty on submit', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      await user.type(firstNameInput, 'John')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('last-name-input')
        expect(input).toHaveAttribute('aria-invalid')
      })
    })

    it('shows error when email is empty on submit', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      const lastNameInput = screen.getByTestId('last-name-input')
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('email-input')
        expect(input).toHaveAttribute('aria-invalid')
      })
    })

    it('shows error when email format is invalid', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      const lastNameInput = screen.getByTestId('last-name-input')
      const emailInput = screen.getByTestId('email-input')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'invalid-email')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid')
      })
    })
  })

  describe('Form Submission', () => {
    it('does not call onContinue when form has validation errors', async () => {
      const user = userEvent.setup()
      const mockOnContinue = vi.fn()
      render(<PersonalInfoForm {...defaultProps} onContinue={mockOnContinue} />)

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('first-name-input')
        expect(input).toHaveAttribute('aria-invalid')
      })

      expect(mockOnContinue).not.toHaveBeenCalled()
    })

    it('calls fadeOut animation on valid form submission', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      const lastNameInput = screen.getByTestId('last-name-input')
      const emailInput = screen.getByTestId('email-input')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john.doe@example.com')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalled()
      })
    })

    it('calls onContinue with form values after fadeOut completes', async () => {
      const user = userEvent.setup()
      const mockOnContinue = vi.fn()
      render(<PersonalInfoForm {...defaultProps} onContinue={mockOnContinue} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      const lastNameInput = screen.getByTestId('last-name-input')
      const emailInput = screen.getByTestId('email-input')

      await user.type(firstNameInput, 'Alice')
      await user.type(lastNameInput, 'Johnson')
      await user.type(emailInput, 'alice.johnson@example.com')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        expect(mockOnContinue).toHaveBeenCalledWith({
          first_name: 'Alice',
          last_name: 'Johnson',
          email: 'alice.johnson@example.com',
        })
      })
    })

    it('submits pre-filled values from accountDetails', async () => {
      const user = userEvent.setup()
      const mockOnContinue = vi.fn()
      const propsWithData = {
        ...defaultProps,
        accountDetails: {
          first_name: 'Bob',
          last_name: 'Smith',
          email: 'bob.smith@example.com',
        },
        onContinue: mockOnContinue,
      }
      render(<PersonalInfoForm {...propsWithData} />)

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        expect(mockOnContinue).toHaveBeenCalledWith({
          first_name: 'Bob',
          last_name: 'Smith',
          email: 'bob.smith@example.com',
        })
      })
    })

    it('submits updated values when user modifies pre-filled data', async () => {
      const user = userEvent.setup()
      const mockOnContinue = vi.fn()
      const propsWithData = {
        ...defaultProps,
        accountDetails: {
          first_name: 'Original',
          last_name: 'Name',
          email: 'original@example.com',
        },
        onContinue: mockOnContinue,
      }
      render(<PersonalInfoForm {...propsWithData} />)

      const emailInput = screen.getByTestId('email-input')
      await user.clear(emailInput)
      await user.type(emailInput, 'updated@example.com')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        expect(mockOnContinue).toHaveBeenCalledWith({
          first_name: 'Original',
          last_name: 'Name',
          email: 'updated@example.com',
        })
      })
    })

    it('accepts valid email formats', async () => {
      const user = userEvent.setup()
      const mockOnContinue = vi.fn()
      render(<PersonalInfoForm {...defaultProps} onContinue={mockOnContinue} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      const lastNameInput = screen.getByTestId('last-name-input')
      const emailInput = screen.getByTestId('email-input')

      await user.type(firstNameInput, 'Test')
      await user.type(lastNameInput, 'User')
      await user.type(emailInput, 'test.user+tag@example.co.uk')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        expect(mockOnContinue).toHaveBeenCalledWith({
          first_name: 'Test',
          last_name: 'User',
          email: 'test.user+tag@example.co.uk',
        })
      })
    })

    it('prevents form submission when pressing enter on invalid form', async () => {
      const user = userEvent.setup()
      const mockOnContinue = vi.fn()
      render(<PersonalInfoForm {...defaultProps} onContinue={mockOnContinue} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      await user.type(firstNameInput, '{Enter}')

      expect(mockOnContinue).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic heading for title', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      const heading = screen.getByRole('heading', {
        name: 'Enter account holder information',
      })
      expect(heading.tagName).toBe('H2')
    })

    it('marks all fields as required', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      expect(screen.getByLabelText('First name *')).toBeRequired()
      expect(screen.getByLabelText('Last name *')).toBeRequired()
      expect(screen.getByLabelText('Email *')).toBeRequired()
    })

    it('provides helper text for email field when validation fails', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoForm {...defaultProps} />)

      const firstNameInput = screen.getByTestId('first-name-input')
      const lastNameInput = screen.getByTestId('last-name-input')
      const emailInput = screen.getByTestId('email-input')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'bad-email')

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      await user.click(button)

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid')
      })
    })

    it('has accessible button label', () => {
      render(<PersonalInfoForm {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Continue to account details' })
      expect(button).toHaveAttribute('aria-label', 'Continue to account details')
    })
  })
})
