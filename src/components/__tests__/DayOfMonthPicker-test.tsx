import React from 'react'

import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { DayOfMonthPicker } from 'src/components/DayOfMonthPicker'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

const handleClose = vi.fn()
const handleSelect = vi.fn()

const dayOfMonthPickerProps = {
  handleClose,
  handleSelect,
  name: 'test',
}

describe('DayOfMonthPicker', () => {
  it('renders DayofMonthPicker and clicks a date', async () => {
    const { user } = render(<DayOfMonthPicker {...dayOfMonthPickerProps} />)

    expect(screen.getByText('Payment due day')).toBeInTheDocument()
    expect(
      screen.getByText('Choose what day of the month your payment is due.'),
    ).toBeInTheDocument()
    await user.click(screen.getByTestId('date-picker-button-4'))
    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalled()
    })
  })

  it('renders DayofMonthPicker and closes it', async () => {
    const { user } = render(<DayOfMonthPicker {...dayOfMonthPickerProps} />)

    await user.click(screen.getByTestId('back-button'))
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })
})
