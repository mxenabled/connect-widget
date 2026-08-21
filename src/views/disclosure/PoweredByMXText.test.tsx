import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import PoweredByMXText from 'src/views/disclosure/PoweredByMXText'

describe('<PoweredByMXText />', () => {
  it('renders the visible "Data access by" text with an aria hidden, the logo, and the full string for screen readers', () => {
    const { container } = render(<PoweredByMXText />)

    expect(screen.getByText('Data access by')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Data access by MX')).toBeInTheDocument()

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
