import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from 'src/utilities/testingLibrary'
import { Container } from 'src/components/Container'
import { STEPS } from 'src/const/Connect'
import { initialState } from 'src/services/mockedData'

describe('Container', () => {
  const preloadedState = initialState

  it('renders', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>,
      { preloadedState },
    )

    const containerDiv = container.querySelector('[data-test="container"]')
    expect(containerDiv).toBeInTheDocument()
    expect(containerDiv).not.toHaveStyle({ maxHeight: '100%' })
  })

  it('applies maxHeight when step is SEARCH', () => {
    const { container } = render(
      <Container step={STEPS.SEARCH}>
        <div>Content</div>
      </Container>,
      { preloadedState },
    )

    const containerDiv = container.querySelector('[data-test="container"]')
    expect(containerDiv).toHaveStyle({ maxHeight: '100%' })
  })
})
