import React from 'react'
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { maskInputFn, withProtection } from 'src/privacy/withProtection'
import { render } from 'src/utilities/testingLibrary'

describe('maskInputFn', () => {
  it('should mask input text by default', () => {
    const result = maskInputFn('password123')
    expect(result).toBe('***********')
  })

  it('should return original text when element has data-ph-unmask="true"', () => {
    const element = document.createElement('input')
    element.setAttribute('data-ph-unmask', 'true')
    const result = maskInputFn('plainText123', element)
    expect(result).toBe('plainText123')
  })
})

describe('withProtection', () => {
  it('should wrap component with ph-no-capture class by default', () => {
    const TestComponent = ({ 'data-test': dataTest }: { 'data-test': string }) => (
      <div data-test={dataTest}>Sensitive Content</div>
    )
    const ProtectedComponent = withProtection(TestComponent)

    render(<ProtectedComponent data-test="test-component" />)

    const wrapper = document.querySelector('.ph-no-capture')
    expect(wrapper).toBeTruthy()
    expect(screen.getByTestId('test-component')).toHaveTextContent('Sensitive Content')
  })

  it('should not wrap component when allowCapture is true', () => {
    const TestComponent = ({ 'data-test': dataTest }: { 'data-test': string }) => (
      <div data-test={dataTest}>Public Content</div>
    )
    const ProtectedComponent = withProtection(TestComponent)

    render(<ProtectedComponent allowCapture={true} data-test="test-component" />)

    const wrapper = document.querySelector('.ph-no-capture')
    expect(wrapper).toBeNull()
    expect(screen.getByTestId('test-component')).toHaveTextContent('Public Content')
  })

  it('should add data-ph-unmask attribute when allowCapture is true', () => {
    const TestComponent = React.forwardRef<
      HTMLInputElement,
      { 'data-test': string; 'data-ph-unmask'?: boolean }
    >((props, ref) => <input ref={ref} {...props} />)
    TestComponent.displayName = 'TestComponent'

    const ProtectedComponent = withProtection(TestComponent)

    render(<ProtectedComponent allowCapture={true} data-test="test-input" />)

    const input = screen.getByTestId('test-input')
    expect(input.getAttribute('data-ph-unmask')).toBe('true')
  })
})
