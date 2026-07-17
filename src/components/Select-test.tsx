import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import userEvent from '@testing-library/user-event'
import { Select } from 'src/components/Select'

const options = [
  { label: 'Checking', value: 'checking' },
  { label: 'Savings', value: 'savings' },
]

const defaultProps = {
  label: 'Account type',
  name: 'account_type',
  onChange: vi.fn(),
  options,
  value: '',
}

describe('Select', () => {
  it('renders with default props', () => {
    render(<Select {...defaultProps} />)

    expect(screen.getByLabelText('Account type')).toBeInTheDocument()
    expect(screen.getByText('Select a value')).toBeInTheDocument()
  })

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Select {...defaultProps} onChange={handleChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Savings' }))

    await waitFor(() =>
      expect(handleChange).toHaveBeenCalledWith({
        target: { name: 'account_type', value: 'savings' },
      }),
    )
  })
})
