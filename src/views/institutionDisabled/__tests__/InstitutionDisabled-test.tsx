import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { InstitutionDisabled } from 'src/views/institutionDisabled/InstitutionDisabled'

describe('InstitutionDisabled', () => {
  const preloadedState = {
    connect: {
      selectedInstitution: {
        name: 'Gringotts',
        guid: 'INS-123',
      },
    },
  }
  const mockOnGoBackClick = vitest.fn()

  beforeEach(() => {
    render(<InstitutionDisabled onGoBackClick={mockOnGoBackClick} />, {
      preloadedState,
    })
  })
  afterEach(() => {
    mockOnGoBackClick.mockClear()
  })

  it('renders institution logo with disabled icon', () => {
    const logo = screen.getByAltText('Logo for Gringotts')
    const disabledIcon = screen.getByTestId('institution-disabled-icon')

    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', expect.stringContaining('INS-123'))
    expect(disabledIcon).toBeInTheDocument()
  })

  it('renders the header title and paragraph explaination', () => {
    expect(
      screen.getByText('Free Gringotts Connections Are No Longer Available'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Gringotts now charges a fee for us to access your account data. To avoid passing that cost on to you, we no longer support Gringotts connections.',
      ),
    ).toBeInTheDocument()
  })

  it('renders a primary button that calls onGoBackClick', () => {
    const button = screen.getByRole('button', { name: 'Go back' })

    expect(button).toBeInTheDocument()
    button.click()
    waitFor(() => expect(mockOnGoBackClick).toHaveBeenCalledTimes(1))
  })
})
