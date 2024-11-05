import React from 'react'
import { render, screen, fireEvent } from 'src/utilities/testingLibrary'
import { GoBackButton } from '../GoBackButton'

describe.only('GoBackButton', () => {
  const handleGoBack = vi.fn()

  it('renders the go back button', () => {
    render(<GoBackButton handleGoBack={handleGoBack} />)
    const button = screen.getByRole('button', { name: /back/i })
    expect(button).toBeInTheDocument()
  })

  it('navigates back when clicked', () => {
    render(<GoBackButton handleGoBack={handleGoBack} />)
    const button = screen.getByRole('button', { name: /back/i })

    fireEvent.click(button)
    expect(handleGoBack).toHaveBeenCalled()
  })

  it('is accessible', () => {
    render(<GoBackButton handleGoBack={handleGoBack} />)
    const button = screen.getByRole('button', { name: /back/i })
    expect(button).toHaveAttribute('aria-label', 'Go Back')
  })
})
