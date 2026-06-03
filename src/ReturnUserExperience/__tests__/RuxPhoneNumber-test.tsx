import React from 'react'
import { RuxPhoneNumber } from 'src/ReturnUserExperience/RuxPhoneNumber'
import { render, screen } from 'src/utilities/testingLibrary'

describe('RuxPhoneNumber', () => {
  it('renders the main heading', () => {
    render(
      <RuxPhoneNumber
        handleContinueWithoutPhone={() => {}}
        handleRuxContinue={() => {}}
        setUserEnteredPhone={() => {}}
        userEnteredPhone=""
      />,
    )
    const heading = screen.getByText('Connect faster with your phone number')
    expect(heading).toBeInTheDocument()
  })

  it('renders the subtitle with a learn more link', () => {
    render(
      <RuxPhoneNumber
        handleContinueWithoutPhone={() => {}}
        handleRuxContinue={() => {}}
        setUserEnteredPhone={() => {}}
        userEnteredPhone=""
      />,
    )
    const subtitle = screen.getByText(
      /Login or sign up with MX to securely access your saved accounts./i,
    )
    expect(subtitle).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /learn more about mx/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://mx.com/learn-more')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders the phone number input with correct label', () => {
    render(
      <RuxPhoneNumber
        handleContinueWithoutPhone={() => {}}
        handleRuxContinue={() => {}}
        setUserEnteredPhone={() => {}}
        userEnteredPhone=""
      />,
    )
    const phoneInput = screen.getByRole('textbox')
    expect(phoneInput).toBeInTheDocument()
  })

  it('renders the continue without phone number button', () => {
    render(
      <RuxPhoneNumber
        handleContinueWithoutPhone={() => {}}
        handleRuxContinue={() => {}}
        setUserEnteredPhone={() => {}}
        userEnteredPhone=""
      />,
    )
    const continueWithoutPhoneButton = screen.getByRole('button', {
      name: 'Continue without phone number',
    })
    expect(continueWithoutPhoneButton).toBeInTheDocument()
  })

  it('calls handleContinueWithoutPhone when the continue without phone number button is clicked', () => {
    const handleContinueWithoutPhoneMock = vi.fn()
    render(
      <RuxPhoneNumber
        handleContinueWithoutPhone={handleContinueWithoutPhoneMock}
        handleRuxContinue={() => {}}
        setUserEnteredPhone={() => {}}
        userEnteredPhone=""
      />,
    )
    const continueWithoutPhoneButton = screen.getByRole('button', {
      name: 'Continue without phone number',
    })
    continueWithoutPhoneButton.click()
    expect(handleContinueWithoutPhoneMock).toHaveBeenCalledTimes(1)
  })

  it('calls handleRuxContinue when the continue button is clicked', () => {
    const handleRuxContinueMock = vi.fn()
    render(
      <RuxPhoneNumber
        handleContinueWithoutPhone={() => {}}
        handleRuxContinue={handleRuxContinueMock}
        setUserEnteredPhone={() => {}}
        userEnteredPhone=""
      />,
    )
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    continueButton.click()
    expect(handleRuxContinueMock).toHaveBeenCalledTimes(1)
  })
})
