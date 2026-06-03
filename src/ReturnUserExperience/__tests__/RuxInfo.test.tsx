import React from 'react'
import { RuxInfo } from 'src/ReturnUserExperience/RuxInfo'
import { render } from 'src/utilities/testingLibrary'

describe('RuxInfo', () => {
  it('renders the main heading', () => {
    const { getByRole } = render(<RuxInfo handleRuxContinue={() => {}} />)
    const heading = getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Connect your accounts')
  })

  it('renders the subtitle', () => {
    const { getByText } = render(<RuxInfo handleRuxContinue={() => {}} />)
    const subtitle = getByText(/uses MX to connect your accounts./i)
    expect(subtitle).toBeInTheDocument()
  })

  it('renders the learn more link with correct attributes', () => {
    const { getByRole } = render(<RuxInfo handleRuxContinue={() => {}} />)
    const link = getByRole('link', { name: /learn more about mx/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://mx.com/learn-more')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders the information clusters with correct content', () => {
    const { getByText } = render(<RuxInfo handleRuxContinue={() => {}} />)
    expect(getByText('Trusted')).toBeInTheDocument()
    expect(getByText('Used by over 13,000 banks & credit unions.')).toBeInTheDocument()
    expect(getByText('Secure')).toBeInTheDocument()
    expect(
      getByText('Protected with multi-factor authentication and encryption.'),
    ).toBeInTheDocument()
    expect(getByText('Private')).toBeInTheDocument()
    expect(
      getByText('We never sell your phone number or use it for marketing.'),
    ).toBeInTheDocument()
  })
})
