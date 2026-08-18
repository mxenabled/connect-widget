import React from 'react'
import { render, screen, fireEvent } from 'src/utilities/testingLibrary'
import { GoBackButtonHeader } from 'src/components/GoBackButtonHeader'

describe('GoBackButton', () => {
  const defaultProps = {
    handleGoBack: vi.fn(),
    shouldShowBackButton: true,
  }

  it('renders the go back button', () => {
    render(<GoBackButtonHeader {...defaultProps} />)
    const button = screen.getByRole('button', { name: /back/i })
    expect(button).toBeInTheDocument()
  })

  it('navigates back when clicked', () => {
    render(<GoBackButtonHeader {...defaultProps} />)
    const button = screen.getByRole('button', { name: /back/i })

    fireEvent.click(button)
    expect(defaultProps.handleGoBack).toHaveBeenCalled()
  })

  it('is accessible', () => {
    render(<GoBackButtonHeader {...defaultProps} />)
    const button = screen.getByRole('button', { name: /back/i })
    expect(button).toHaveAttribute('aria-label', 'Go Back')
  })
})
