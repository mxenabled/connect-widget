import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { ConfirmDetails } from 'src/views/microdeposits/ConfirmDetails'
import { initialState } from 'src/services/mockedData'
import userEvent from '@testing-library/user-event'
import { ReadableAccountTypes } from 'src/views/microdeposits/const'

describe('DetailReviewItem', () => {
  const preloadedState = initialState

  const accountDetails = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    routing_number: '123456789',
    account_type: ReadableAccountTypes.CHECKING,
    account_number: '9876543210',
  }

  const defaultProps = {
    accountDetails,
    currentMicrodeposit: {},
    onEditForm: () => {},
    onError: () => {},
    onSuccess: () => {},
    shouldShowUserDetails: true,
  }

  it('renders all account details correctly with enabled edit buttons', () => {
    render(<ConfirmDetails {...defaultProps} />, { preloadedState })

    expect(screen.getByText('First and last name')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit first and last name' })).toBeEnabled()

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit email' })).toBeEnabled()

    expect(screen.getByText('Routing number')).toBeInTheDocument()
    expect(screen.getByText('123456789')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit routing number' })).toBeEnabled()

    expect(screen.getByText('Account type')).toBeInTheDocument()
    expect(screen.getByText('Checking')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit account type' })).toBeEnabled()

    expect(screen.getByText('Account number')).toBeInTheDocument()
    expect(screen.getByText('9876543210')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit account number' })).toBeEnabled()
  })

  it('hides user details when shouldShowUserDetails is false', () => {
    render(<ConfirmDetails {...defaultProps} shouldShowUserDetails={false} />, { preloadedState })

    expect(screen.queryByText('First and last name')).not.toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Email')).not.toBeInTheDocument()
    expect(screen.queryByText('john.doe@example.com')).not.toBeInTheDocument()

    expect(screen.getByText('Routing number')).toBeInTheDocument()
    expect(screen.getByText('Account number')).toBeInTheDocument()
  })

  it('calls onEditForm with correct field when edit buttons are clicked', async () => {
    const user = userEvent.setup()
    const mockOnEditForm = vi.fn()

    render(<ConfirmDetails {...defaultProps} onEditForm={mockOnEditForm} />, { preloadedState })

    await user.click(screen.getByRole('button', { name: 'Edit first and last name' }))
    await waitFor(() => expect(mockOnEditForm).toHaveBeenCalledWith('userName'))

    await user.click(screen.getByRole('button', { name: 'Edit email' }))
    await waitFor(() => expect(mockOnEditForm).toHaveBeenCalledWith('email'))

    await user.click(screen.getByRole('button', { name: 'Edit routing number' }))
    await waitFor(() => expect(mockOnEditForm).toHaveBeenCalledWith('routingNumber'))

    await user.click(screen.getByRole('button', { name: 'Edit account type' }))
    await waitFor(() => expect(mockOnEditForm).toHaveBeenCalledWith('accountType'))

    await user.click(screen.getByRole('button', { name: 'Edit account number' }))
    await waitFor(() => expect(mockOnEditForm).toHaveBeenCalledWith('accountNumber'))
  })

  it('disables edit buttons when form is submitting', async () => {
    const user = userEvent.setup()

    render(<ConfirmDetails {...defaultProps} />, { preloadedState })

    expect(screen.getByRole('button', { name: 'Edit first and last name' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Edit email' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(screen.getByRole('button', { name: 'Edit first and last name' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edit email' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edit routing number' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edit account type' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edit account number' })).toBeDisabled()
  })
})
