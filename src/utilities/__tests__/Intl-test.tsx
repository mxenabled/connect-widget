import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'

import { __, _np, B } from 'src/utilities/Intl'

describe('Intl', () => {
  it('__ should produce text', () => {
    const TestComponent = (
      <B>{__('This is a *bold* statement. And *so* is this. But *not this.')}</B>
    )
    render(TestComponent)

    expect(
      screen.getAllByText(
        (_, node) =>
          node?.textContent === 'This is a bold statement. And so is this. But *not this.',
      )[0],
    ).toBeInTheDocument()
  })

  it('_np should produce text', () => {
    const TestComponent = <B>{_np('appearance', 'He is fair.', 'They are fair.', 2)}</B>
    render(TestComponent)

    expect(screen.getByText('They are fair.')).toBeInTheDocument()
  })

  it('should not have strong elements', () => {
    const TestComponent = <B>{__('This is a statement.')}</B>
    render(TestComponent)

    expect(screen.queryAllByText((_text, element) => element?.tagName === 'STRONG')).toHaveLength(0)
  })

  it('should have strong elements', () => {
    const TestComponent = (
      <B>{__('This is a *bold* statement. And *so* is this. But *not this.')}</B>
    )
    render(TestComponent)
    const boldComponents = screen.queryAllByText((_text, element) => element?.tagName === 'STRONG')

    expect(boldComponents).toHaveLength(2)
  })
})
