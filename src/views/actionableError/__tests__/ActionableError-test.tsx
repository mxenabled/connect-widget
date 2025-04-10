import React from 'react'

import { render, screen } from 'src/utilities/testingLibrary'
import { ActionableError } from 'src/views/actionableError/ActionableError'
import { initialState as defaultState } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'

const institutionMock = {
  name: 'Institution',
  guid: 'INS-123',
}
const membersMock = [
  {
    guid: 'MEM-123',
    name: 'Member',
    most_recent_job_detail_code: '1000',
  },
  {
    guid: 'MEM-456',
    name: 'Member',
    most_recent_job_detail_code: null,
  },
]

describe('ActionableError', () => {
  const initialState = {
    ...defaultState,
    connect: {
      ...defaultState.connect,
      selectedInstitution: institutionMock,
      currentMemberGuid: membersMock[0].guid,
      members: membersMock,
      location: [{ step: STEPS.ACTIONABLE_ERROR }],
    },
  }

  it('should render an institution logo with a badge', () => {
    render(<ActionableError />, {
      preloadedState: initialState,
    })
    const institutionLogo = screen.getByRole('img')
    expect(institutionLogo).toBeInTheDocument()
    expect(institutionLogo).toHaveAttribute('alt', `${institutionMock.name} logo`)

    const badge = screen.getByText('!')
    expect(badge).toBeInTheDocument()
  })

  it('should render a title and paragraph', () => {
    render(<ActionableError />, {
      preloadedState: initialState,
    })
    expect(screen.getByText('No eligible accounts')).toBeInTheDocument()
    expect(
      screen.getByText(
        `Only checking or savings accounts can be used for transfers. If you have one at ${institutionMock.name}, make sure to select it when connecting. Otherwise, try connecting a different institution.`,
      ),
    ).toBeInTheDocument()
  })

  it('should render primary action button', async () => {
    render(<ActionableError />, {
      preloadedState: initialState,
    })
    const primaryButton = screen.getByRole('button', { name: 'Log in again' })
    expect(primaryButton).toBeInTheDocument()
    expect(primaryButton).toHaveClass('MuiButton-contained')
  })

  it('should render secondary action buttons', () => {
    render(<ActionableError />, {
      preloadedState: initialState,
    })
    const secondaryButton = screen.getByRole('button', { name: 'Connect a different institution' })
    expect(secondaryButton).toBeInTheDocument()
    expect(secondaryButton).toHaveClass('MuiButton-text')
  })
})
