import React from 'react'
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { maskInputFn, withProtection } from '../withProtection'
import { render } from '../../utilities/testingLibrary'

describe('maskInputFn', () => {
  it('should mask input text with asterisks by default', () => {
    const result = maskInputFn('password123')
    expect(result).toBe('***********')
  })

  it('should mask input text when no element is provided', () => {
    const result = maskInputFn('secretText')
    expect(result).toBe('**********')
  })

  it('should mask input text when element does not have unmask attribute', () => {
    const element = document.createElement('input')
    const result = maskInputFn('myPassword', element)
    expect(result).toBe('**********')
  })

  it('should return original text when element has data-ph-unmask="true"', () => {
    const element = document.createElement('input')
    element.setAttribute('data-ph-unmask', 'true')
    const result = maskInputFn('plainText123', element)
    expect(result).toBe('plainText123')
  })

  it('should mask text when element has data-ph-unmask="false"', () => {
    const element = document.createElement('input')
    element.setAttribute('data-ph-unmask', 'false')
    const result = maskInputFn('secretData', element)
    expect(result).toBe('**********')
  })

  it('should mask empty string', () => {
    const result = maskInputFn('')
    expect(result).toBe('')
  })

  it('should mask single character', () => {
    const result = maskInputFn('x')
    expect(result).toBe('*')
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

  it('should not add data-ph-unmask attribute when allowCapture is false', () => {
    const TestComponent = React.forwardRef<
      HTMLInputElement,
      { 'data-test': string; 'data-ph-unmask'?: boolean }
    >((props, ref) => <input ref={ref} {...props} />)
    TestComponent.displayName = 'TestComponent'

    const ProtectedComponent = withProtection(TestComponent)

    render(<ProtectedComponent allowCapture={false} data-test="test-input" />)

    const wrapper = document.querySelector('.ph-no-capture')
    expect(wrapper).toBeTruthy()

    const input = screen.getByTestId('test-input')
    expect(input.hasAttribute('data-ph-unmask')).toBe(false)
  })

  it('should pass through other props correctly', () => {
    const TestComponent = ({
      'data-test': dataTest,
      className,
      id,
    }: {
      'data-test': string
      className?: string
      id?: string
    }) => (
      <div className={className} data-test={dataTest} id={id}>
        Content
      </div>
    )
    const ProtectedComponent = withProtection(TestComponent)

    render(
      <ProtectedComponent className="custom-class" data-test="test-component" id="custom-id" />,
    )

    const element = screen.getByTestId('test-component')
    expect(element).toHaveClass('custom-class')
    expect(element).toHaveAttribute('id', 'custom-id')
  })

  it('should forward ref correctly', () => {
    const TestComponent = React.forwardRef<
      HTMLButtonElement,
      { 'data-test': string; children: React.ReactNode }
    >((props, ref) => <button ref={ref} {...props} />)
    TestComponent.displayName = 'TestComponent'

    const ProtectedComponent = withProtection(TestComponent)

    const refObject = React.createRef<HTMLButtonElement>()

    const TestWrapper = () => (
      <ProtectedComponent data-test="test-button" ref={refObject}>
        Click Me
      </ProtectedComponent>
    )

    render(<TestWrapper />)

    expect(refObject.current).toBeTruthy()
    expect(refObject.current?.tagName).toBe('BUTTON')
  })

  it('should have displayName "ProtectedComponent"', () => {
    const TestComponent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
    const ProtectedComponent = withProtection(TestComponent)

    expect(ProtectedComponent.displayName).toBe('ProtectedComponent')
  })

  it('should work with native HTML elements', () => {
    const ProtectedInput = withProtection('input')

    render(<ProtectedInput data-test="native-input" placeholder="Enter password" type="password" />)

    const wrapper = document.querySelector('.ph-no-capture')
    expect(wrapper).toBeTruthy()

    const input = screen.getByTestId('native-input') as HTMLInputElement
    expect(input.type).toBe('password')
    expect(input.placeholder).toBe('Enter password')
  })

  it('should work with allowCapture and native elements', () => {
    const ProtectedInput = withProtection('input')

    render(
      <ProtectedInput
        allowCapture={true}
        data-test="native-input"
        defaultValue="visible"
        type="text"
      />,
    )

    const wrapper = document.querySelector('.ph-no-capture')
    expect(wrapper).toBeNull()

    const input = screen.getByTestId('native-input') as HTMLInputElement
    expect(input.getAttribute('data-ph-unmask')).toBe('true')
    expect(input.value).toBe('visible')
  })

  it('should handle multiple instances independently', () => {
    const TestComponent = ({ 'data-test': dataTest }: { 'data-test': string }) => (
      <div data-test={dataTest}>Content</div>
    )
    const ProtectedComponent = withProtection(TestComponent)

    render(
      <>
        <ProtectedComponent allowCapture={false} data-test="protected-1" />
        <ProtectedComponent allowCapture={true} data-test="protected-2" />
        <ProtectedComponent data-test="protected-3" />
      </>,
    )

    const wrappers = document.querySelectorAll('.ph-no-capture')
    expect(wrappers.length).toBe(2) // protected-1 and protected-3 should be wrapped

    expect(screen.getByTestId('protected-1')).toBeInTheDocument()
    expect(screen.getByTestId('protected-2')).toBeInTheDocument()
    expect(screen.getByTestId('protected-3')).toBeInTheDocument()
  })

  it('should handle allowCapture explicitly set to false', () => {
    const TestComponent = ({ 'data-test': dataTest }: { 'data-test': string }) => (
      <div data-test={dataTest}>Content</div>
    )
    const ProtectedComponent = withProtection(TestComponent)

    render(<ProtectedComponent allowCapture={false} data-test="test-component" />)

    const wrapper = document.querySelector('.ph-no-capture')
    expect(wrapper).toBeTruthy()
  })
})
