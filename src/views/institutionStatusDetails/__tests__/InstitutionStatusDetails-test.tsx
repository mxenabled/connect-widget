import React from 'react'
import { useDispatch } from 'react-redux'
import { ActionTypes } from 'src/redux/actions/Connect'
import { initialState } from 'src/redux/reducers/configSlice'
import { InstitutionStatusField } from 'src/utilities/institutionStatus'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { InstitutionStatusDetails } from 'src/views/institutionStatusDetails/InstitutionStatusDetails'

// Mock useDispatch
vitest.mock('react-redux', async () => {
  const actual = await vitest.importActual('react-redux')
  return { ...actual, useDispatch: vitest.fn() }
})
const mockDispatch = vitest.fn()
const mockedUseDispatch = vitest.mocked(useDispatch)

const blockedInstitution = {
  name: 'Chase Bank',
  guid: 'INS-78c7b591-6512-9c17-b092-1cddbd3c85ba', // PROD INS guid
}
const unavailableInstitution = { guid: 'INST-unavailable', name: 'Unavailable Bank' }
const apiUnavailableInstitution = {
  guid: 'INST-api-unavailable',
  name: 'API Unavailable Bank',
  status: InstitutionStatusField.UNAVAILABLE,
}

describe('InstitutionStatusDetails', () => {
  const preloadedState = {
    connect: {
      selectedInstitution: {
        ...blockedInstitution,
        is_disabled_by_client: true, // Key to getting the CLIENT_BLOCKED_FOR_FEES message and status
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

  it('CLIENT_BLOCKED_FOR_FEES status - renders the header title and paragraph explanation', () => {
    const result = render(<InstitutionStatusDetails />, {
      preloadedState: {
        connect: {
          selectedInstitution: blockedInstitution,
        },
        config: {
          ...initialState,
          _initialValues: JSON.stringify(initialState),
        },
      },
    })
    container = result.container

    expect(
      screen.getByText(`Free ${blockedInstitution.name} Connections Are No Longer Available`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `${blockedInstitution.name} now charges a fee for us to access your account data. To avoid passing that cost on to you, we no longer support ${blockedInstitution.name} connections.`,
      ),
    ).toBeInTheDocument()
  })

  it('UNAVAILABLE status - renders the header title and paragraph explanation', () => {
    const result = render(<InstitutionStatusDetails />, {
      preloadedState: {
        connect: {
          selectedInstitution: unavailableInstitution,
        },
        config: {
          ...initialState,
          _initialValues: JSON.stringify(initialState),
        },
        experimentalFeatures: {
          unavailableInstitutions: [unavailableInstitution],
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

  it('UNAVAILABLE institution.status from API - renders the header title and paragraph explanation', () => {
    const result = render(<InstitutionStatusDetails />, {
      preloadedState: {
        connect: {
          selectedInstitution: apiUnavailableInstitution,
        },
        config: {
          ...initialState,
          _initialValues: JSON.stringify(initialState),
        },
        experimentalFeatures: {
          unavailableInstitutions: [],
        },
      },
    })
    container = result.container

    expect(screen.getByText(`Connection unavailable`)).toBeInTheDocument()
    expect(
      screen.getByText(
        (content, element) =>
          element?.tagName.toLowerCase() === 'p' &&
          content.includes(
            'This institution is experiencing issues that prevent successful connections',
          ),
      ),
    ).toBeInTheDocument()
  })

  it('renders a primary button that dispatches the correct action', () => {
    const button = screen.getByRole('button', { name: 'Back' })

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
