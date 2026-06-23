import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { DetailReviewItem } from 'src/components/DetailReviewItem'
import { initialState } from 'src/services/mockedData'
import userEvent from '@testing-library/user-event'

describe('DetailReviewItem', () => {
  const preloadedState = initialState

  const defaultProps = {
    label: 'Email',
    value: 'user@example.com',
    ariaButtonLabel: 'Edit email',
    isEditable: false,
    onEditClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the label', () => {
      render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('renders the value', () => {
      render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      expect(screen.getByText('user@example.com')).toBeInTheDocument()
    })

    it('renders with correct data-test attributes for label', () => {
      const { container } = render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      const labelElement = container.querySelector('[data-test="Email-row"]')
      expect(labelElement).toBeInTheDocument()
    })

    it('renders with correct data-test attributes for value', () => {
      const { container } = render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      const valueElement = container.querySelector('[data-test="user@example.com-row"]')
      expect(valueElement).toBeInTheDocument()
    })

    it('renders edit button with correct aria-label', () => {
      render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      const button = screen.getByRole('button', { name: 'Edit email' })
      expect(button).toBeInTheDocument()
    })

    it('renders edit icon', () => {
      const { container } = render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      expect(container.querySelector('[data-test="Email-edit-button"]')).toBeInTheDocument()
    })

    it('sanitizes label with spaces for data-test attribute', () => {
      const { container } = render(<DetailReviewItem {...defaultProps} label="Full Name" />, {
        preloadedState,
      })

      expect(container.querySelector('[data-test="Full-Name-row"]')).toBeInTheDocument()
      expect(container.querySelector('[data-test="Full-Name-edit-button"]')).toBeInTheDocument()
    })
  })

  describe('edit button functionality', () => {
    it('calls onEditClick when edit button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnEditClick = vi.fn()

      render(<DetailReviewItem {...defaultProps} onEditClick={mockOnEditClick} />, {
        preloadedState,
      })

      const button = screen.getByRole('button', { name: 'Edit email' })
      await user.click(button)

      expect(mockOnEditClick).toHaveBeenCalledTimes(1)
    })

    it('enables edit button when isEditable is false', () => {
      render(<DetailReviewItem {...defaultProps} isEditable={false} />, { preloadedState })

      const button = screen.getByRole('button', { name: 'Edit email' })
      expect(button).toBeEnabled()
    })

    it('disables edit button when isEditable is true', () => {
      render(<DetailReviewItem {...defaultProps} isEditable={true} />, { preloadedState })

      const button = screen.getByRole('button', { name: 'Edit email' })
      expect(button).toBeDisabled()
    })
  })

  describe('different content types', () => {
    it('renders with phone number', () => {
      render(
        <DetailReviewItem
          {...defaultProps}
          ariaButtonLabel="Edit phone"
          label="Phone"
          value="555-123-4567"
        />,
        { preloadedState },
      )

      expect(screen.getByText('Phone')).toBeInTheDocument()
      expect(screen.getByText('555-123-4567')).toBeInTheDocument()
    })

    it('renders with address', () => {
      render(
        <DetailReviewItem
          {...defaultProps}
          ariaButtonLabel="Edit address"
          label="Address"
          value="123 Main St, City, ST 12345"
        />,
        { preloadedState },
      )

      expect(screen.getByText('Address')).toBeInTheDocument()
      expect(screen.getByText('123 Main St, City, ST 12345')).toBeInTheDocument()
    })

    it('renders with date', () => {
      render(
        <DetailReviewItem
          {...defaultProps}
          ariaButtonLabel="Edit date of birth"
          label="Date of Birth"
          value="01/01/1990"
        />,
        { preloadedState },
      )

      expect(screen.getByText('Date of Birth')).toBeInTheDocument()
      expect(screen.getByText('01/01/1990')).toBeInTheDocument()
    })

    it('renders with long text value', () => {
      const longValue =
        'This is a very long value that might wrap to multiple lines depending on the container width'

      render(
        <DetailReviewItem
          {...defaultProps}
          ariaButtonLabel="Edit description"
          label="Description"
          value={longValue}
        />,
        { preloadedState },
      )

      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText(longValue)).toBeInTheDocument()
    })
  })

  describe('data-test attribute handling', () => {
    it('handles special characters in label', () => {
      const { container } = render(
        <DetailReviewItem
          {...defaultProps}
          ariaButtonLabel="Edit name"
          label="First & Last Name"
          value="John Doe"
        />,
        { preloadedState },
      )

      expect(container.querySelector('[data-test="First-&-Last-Name-row"]')).toBeInTheDocument()
      expect(
        container.querySelector('[data-test="First-&-Last-Name-edit-button"]'),
      ).toBeInTheDocument()
    })

    it('handles special characters in value', () => {
      const { container } = render(
        <DetailReviewItem
          {...defaultProps}
          ariaButtonLabel="Edit email"
          label="Email"
          value="user+test@example.com"
        />,
        { preloadedState },
      )

      expect(container.querySelector('[data-test="user+test@example.com-row"]')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('renders complete structure with all elements', () => {
      const { container } = render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      expect(screen.getByText('Email')).toBeInTheDocument()

      expect(screen.getByText('user@example.com')).toBeInTheDocument()

      expect(screen.getByRole('button', { name: 'Edit email' })).toBeInTheDocument()

      expect(container.querySelector('[data-test="Email-row"]')).toBeInTheDocument()
      expect(container.querySelector('[data-test="user@example.com-row"]')).toBeInTheDocument()
      expect(container.querySelector('[data-test="Email-edit-button"]')).toBeInTheDocument()
    })

    it('handles complete user interaction flow', async () => {
      const user = userEvent.setup()
      const mockOnEditClick = vi.fn()

      render(<DetailReviewItem {...defaultProps} onEditClick={mockOnEditClick} />, {
        preloadedState,
      })

      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('user@example.com')).toBeInTheDocument()

      const button = screen.getByRole('button', { name: 'Edit email' })
      expect(button).toBeEnabled()

      await user.click(button)

      expect(mockOnEditClick).toHaveBeenCalledTimes(1)
    })

    it('renders correctly with multiple items scenario', () => {
      const { rerender } = render(<DetailReviewItem {...defaultProps} />, { preloadedState })

      expect(screen.getByText('Email')).toBeInTheDocument()

      rerender(
        <DetailReviewItem
          {...defaultProps}
          ariaButtonLabel="Edit phone"
          label="Phone"
          value="555-1234"
        />,
      )

      expect(screen.getByText('Phone')).toBeInTheDocument()
      expect(screen.getByText('555-1234')).toBeInTheDocument()
    })
  })
})
