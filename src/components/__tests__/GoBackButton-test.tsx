import React from 'react'
import { render, screen, fireEvent } from 'src/utilities/testingLibrary'
import { GoBackButton } from '../GoBackButton'

describe('GoBackButton', () => {
  const defaultProps = {
    handleGoBack: vi.fn(),
    shouldShowBackButton: true,
  }

  it('renders the go back button', () => {
    render(<GoBackButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /back/i })
    expect(button).toBeInTheDocument()
  })

  it('navigates back when clicked', () => {
    render(<GoBackButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /back/i })

    fireEvent.click(button)
    expect(defaultProps.handleGoBack).toHaveBeenCalled()
  })

  it('is accessible', () => {
    render(<GoBackButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /back/i })
    expect(button).toHaveAttribute('aria-label', 'Go Back')
  })
})
