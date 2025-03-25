import React from 'react'
import { AGG_MODE } from 'src/const/Connect'
import { ActionTypes } from 'src/redux/actions/Connect'

import { render, screen } from 'src/utilities/testingLibrary'
import { ActionableError } from 'src/views/actionableError/ActionableError'

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

const mockStoreDispatch = vi.fn()
vi.mock('src/redux/Store', () => ({
  ...vi.importActual('src/redux/Store'),
  dispatch: mockStoreDispatch,
}))

describe('ActionableError', () => {
  it('should render an institution logo with a badge', () => {
    render(<ActionableError />, {
      preloadedState: {
        connect: {
          selectedInstitution: institutionMock,
          currentMemberGuid: membersMock[0].guid,
          members: membersMock,
        },
      },
    })
    const institutionLogo = screen.getByRole('img')
    expect(institutionLogo).toBeInTheDocument()
    expect(institutionLogo).toHaveAttribute('alt', `${institutionMock.name} logo`)

    const badge = screen.getByRole('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('!')
  })

  it('should render a title and paragraph', () => {
    render(<ActionableError />)
    expect(screen.getByText('No eligible accounts')).toBeInTheDocument()
    expect(
      screen.getByText(
        `Only checking or savings accounts can be used for transfers. If you have one at ${institutionMock.name}, make sure to select it when connecting. Otherwise, try connecting a different institution.`,
      ),
    ).toBeInTheDocument()
  })

  it('should render primary action button', () => {
    render(<ActionableError />)
    const primaryButton = screen.getByRole('button', { name: 'Log in again' })
    expect(primaryButton).toBeInTheDocument()
    expect(primaryButton).toHaveAttribute('variant', 'contained')
    primaryButton.click()
    expect(mockStoreDispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_LOG_IN_AGAIN,
    })
  })

  it('should render secondary action buttons', () => {
    render(<ActionableError />)
    const secondaryButton = screen.getByRole('button', { name: 'Connect a different institution' })
    expect(secondaryButton).toBeInTheDocument()
    expect(secondaryButton).toHaveAttribute('variant', 'text')
    secondaryButton.click()
    expect(mockStoreDispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
      payload: AGG_MODE,
    })
  })
})
