import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { StatusAlert } from 'src/views/loginError/StatusAlert'

describe('StatusAlert', () => {
  it('renders the provided message', () => {
    render(<StatusAlert message="Something went wrong" variant="error" />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('exposes the messagebox and text test hooks', () => {
    render(<StatusAlert message="Heads up" variant="warning" />)

    expect(screen.getByTestId('error-messagebox')).toBeInTheDocument()

    const text = screen.getByTestId('error-messagebox-text')
    expect(text).toBeInTheDocument()
    expect(text).toHaveTextContent('Heads up')
  })

  it('applies the severity from the variant prop', () => {
    render(<StatusAlert message="Critical failure" variant="error" />)

    expect(screen.getByTestId('error-messagebox')).toHaveClass('MuiAlert-colorError')
  })

  it('defaults to the info variant when none is provided', () => {
    render(<StatusAlert message="Just so you know" />)

    expect(screen.getByTestId('error-messagebox')).toHaveClass('MuiAlert-colorInfo')
  })
})
