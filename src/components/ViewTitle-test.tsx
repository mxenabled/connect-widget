import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { ViewTitle } from 'src/components/ViewTitle'
import { ReadableStatuses } from 'src/const/Statuses'

describe('ViewTitle', () => {
  it('renders the title text', () => {
    render(<ViewTitle title="Account Details" />)

    const title = screen.getByTestId('title-text')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Account Details')
  })

  it('renders the title as an h1 heading', () => {
    render(<ViewTitle title="Account Details" />)

    expect(screen.getByRole('heading', { level: 1, name: 'Account Details' })).toBeInTheDocument()
  })

  it('renders the error icon when connectionStatus is DEGRADED', () => {
    const { container } = render(
      <ViewTitle connectionStatus={ReadableStatuses.DEGRADED} title="Account Details" />,
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the error icon when connectionStatus is REJECTED', () => {
    const { container } = render(
      <ViewTitle connectionStatus={ReadableStatuses.REJECTED} title="Account Details" />,
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not render the error icon when connectionStatus is CONNECTED', () => {
    const { container } = render(
      <ViewTitle connectionStatus={ReadableStatuses.CONNECTED} title="Account Details" />,
    )

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('does not render the error icon when connectionStatus is not provided', () => {
    const { container } = render(<ViewTitle title="Account Details" />)

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})
