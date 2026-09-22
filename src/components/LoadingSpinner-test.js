import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { LoadingSpinner } from 'src/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders a progressbar by default', () => {
    render(<LoadingSpinner />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('does not render the loading text by default', () => {
    render(<LoadingSpinner />)

    expect(screen.queryByText('Loading ...')).not.toBeInTheDocument()
  })

  it('renders the loading text when showText is true', () => {
    render(<LoadingSpinner showText={true} />)

    expect(screen.getByText('Loading ...')).toBeInTheDocument()
  })

  it('does not render the loading text when showText is false', () => {
    render(<LoadingSpinner showText={false} />)

    expect(screen.queryByText('Loading ...')).not.toBeInTheDocument()
  })

  it('renders the spinner at the default size of 48px', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByRole('progressbar')
    expect(spinner).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('renders the spinner at a custom size', () => {
    render(<LoadingSpinner size={24} />)

    const spinner = screen.getByRole('progressbar')
    expect(spinner).toHaveStyle({ width: '24px', height: '24px' })
  })
})
