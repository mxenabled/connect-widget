import React from 'react'
import { useDispatch } from 'react-redux'
import { ActionTypes } from 'src/redux/actions/Connect'
import { initialState } from 'src/redux/reducers/configSlice'
import { getBlockedInstitutions, getUnavailableInstitutions } from 'src/utilities/institutionStatus'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { InstitutionStatusDetails } from 'src/views/institutionStatusDetails/InstitutionStatusDetails'

// Mock useDispatch
vitest.mock('react-redux', async () => {
  const actual = await vitest.importActual('react-redux')
  return { ...actual, useDispatch: vitest.fn() }
})
const mockDispatch = vitest.fn()
const mockedUseDispatch = vitest.mocked(useDispatch)

const blockedInstitution = getBlockedInstitutions()[0]
const unavailableInstitution = getUnavailableInstitutions()[0]

describe('InstitutionStatusDetails', () => {
  const preloadedState = {
    connect: {
      selectedInstitution: {
        ...blockedInstitution,
        is_disabled_by_client: true, // Key to getting the BLOCKED message and status
      },
    },
    config: {
      ...initialState,
      _initialValues: JSON.stringify(initialState),
    },
  }

  let container: HTMLElement

  beforeEach(() => {
    // Reset the mock before each test
    mockDispatch.mockClear()
    mockedUseDispatch.mockReturnValue(mockDispatch)

    const result = render(<InstitutionStatusDetails />, {
      preloadedState,
    })
    container = result.container
  })

  it('renders institution logo with disabled icon', () => {
    const logo = screen.getByAltText(`Logo for ${blockedInstitution.name}`)
    const disabledIcon = container.querySelector('.MuiSvgIcon-colorError')

    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', expect.stringContaining(blockedInstitution.guid))
    expect(disabledIcon).toBeInTheDocument()
  })

  it('BLOCKED status - renders the header title and paragraph explaination', () => {
    expect(
      screen.getByText(`Free ${blockedInstitution.name} Connections Are No Longer Available`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `${blockedInstitution.name} now charges a fee for us to access your account data. To avoid passing that cost on to you, we no longer support ${blockedInstitution.name} connections.`,
      ),
    ).toBeInTheDocument()
  })

  it('UNAVAILABLE status - renders the header title and paragraph explaination', () => {
    const result = render(<InstitutionStatusDetails />, {
      preloadedState: {
        connect: {
          selectedInstitution: unavailableInstitution,
        },
        config: {
          ...initialState,
          _initialValues: JSON.stringify(initialState),
        },
      },
    })
    container = result.container

    expect(
      screen.getByText(`Connection not supported by ${unavailableInstitution.name}`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `${unavailableInstitution.name} currently limits how your data can be shared. We'll enable this connection once ${unavailableInstitution.name} opens access.`,
      ),
    ).toBeInTheDocument()
  })

  it('renders a primary button that dispatches the correct action', () => {
    const button = screen.getByRole('button', { name: 'Go back' })

    expect(button).toBeInTheDocument()
    button.click()
    waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: ActionTypes.GO_BACK_INSTITUTION_STATUS_DETAILS,
        payload: {
          mode: 'AGG',
        },
      }),
    )
  })
})
