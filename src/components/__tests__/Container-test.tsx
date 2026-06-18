import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { Container } from 'src/components/Container.tsx'
import { STEPS } from 'src/const/Connect'
import { initialState } from 'src/services/mockedData'

describe('Container', () => {
  const preloadedState = initialState

  describe('rendering', () => {
    it('renders the container with correct data-test attribute', () => {
      const { container } = render(
        <Container>
          <div>Test Content</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <Container>
          <div data-test="child-content">Test Content</div>
        </Container>,
        { preloadedState },
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <Container>
          <div data-test="child-1">First Child</div>
          <div data-test="child-2">Second Child</div>
          <span data-test="child-3">Third Child</span>
        </Container>,
        { preloadedState },
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('renders without children', () => {
      const { container } = render(<Container />, { preloadedState })

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
    })

    it('renders with null children', () => {
      const { container } = render(<Container>{null}</Container>, { preloadedState })

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
    })
  })

  describe('step prop', () => {
    it('renders without step prop', () => {
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

    it('renders with SEARCH step and applies maxHeight', () => {
      const { container } = render(
        <Container step={STEPS.SEARCH}>
          <div>Search Content</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
      expect(containerDiv).toHaveStyle({ maxHeight: '100%' })
    })

    it('renders with non-SEARCH step without maxHeight constraint', () => {
      const { container } = render(
        <Container step={STEPS.CONNECTED}>
          <div>Connected Content</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
      expect(containerDiv).not.toHaveStyle({ maxHeight: '100%' })
    })

    it('renders correctly with ENTER_CREDENTIALS step', () => {
      render(
        <Container step={STEPS.ENTER_CREDENTIALS}>
          <div data-test="credentials-content">Enter Credentials</div>
        </Container>,
        { preloadedState },
      )

      expect(screen.getByTestId('credentials-content')).toBeInTheDocument()
    })

    it('renders correctly with MFA step', () => {
      render(
        <Container step={STEPS.MFA}>
          <div data-test="mfa-content">MFA Content</div>
        </Container>,
        { preloadedState },
      )

      expect(screen.getByTestId('mfa-content')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('applies consistent container styles', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toHaveStyle({
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
      })
    })

    it('has a content wrapper with proper constraints', () => {
      const { container } = render(
        <Container>
          <div data-test="inner-content">Content</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      const contentWrapper = containerDiv?.firstChild as HTMLElement

      expect(contentWrapper).toBeInTheDocument()
      expect(contentWrapper).toHaveStyle({
        maxWidth: '400px',
        minWidth: '270px',
        width: '100%',
      })
    })

    it('applies background color from tokens', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toHaveStyle({ backgroundColor: expect.any(String) })
    })
  })

  describe('integration', () => {
    it('renders complete structure with SEARCH step', () => {
      const { container } = render(
        <Container step={STEPS.SEARCH}>
          <div data-test="search-content">Search for institution</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
      expect(containerDiv).toHaveStyle({ maxHeight: '100%' })
      expect(screen.getByTestId('search-content')).toBeInTheDocument()
      expect(screen.getByText('Search for institution')).toBeInTheDocument()
    })

    it('renders complete structure with CONNECTED step', () => {
      const { container } = render(
        <Container step={STEPS.CONNECTED}>
          <div data-test="success-message">Successfully connected!</div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
      expect(screen.getByTestId('success-message')).toBeInTheDocument()
      expect(screen.getByText('Successfully connected!')).toBeInTheDocument()
    })

    it('renders nested component structure', () => {
      render(
        <Container step={STEPS.DISCLOSURE}>
          <div data-test="outer">
            <h1>Title</h1>
            <div data-test="inner">
              <p>Nested Content</p>
            </div>
          </div>
        </Container>,
        { preloadedState },
      )

      expect(screen.getByTestId('outer')).toBeInTheDocument()
      expect(screen.getByTestId('inner')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Nested Content')).toBeInTheDocument()
    })

    it('maintains structure with form elements', () => {
      render(
        <Container>
          <form data-test="test-form">
            <input data-test="test-input" type="text" />
            <button data-test="test-button">Submit</button>
          </form>
        </Container>,
        { preloadedState },
      )

      expect(screen.getByTestId('test-form')).toBeInTheDocument()
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
      expect(screen.getByTestId('test-button')).toBeInTheDocument()
    })

    it('wraps components consistently regardless of content type', () => {
      const { container } = render(
        <Container>
          <div>
            <span>Text</span>
            <img alt="test" src="test.png" />
            <button>Click</button>
          </div>
        </Container>,
        { preloadedState },
      )

      const containerDiv = container.querySelector('[data-test="container"]')
      expect(containerDiv).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
      expect(screen.getByAltText('test')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument()
    })
  })
})
