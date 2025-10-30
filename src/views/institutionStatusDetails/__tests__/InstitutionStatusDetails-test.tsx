import React from 'react'
import { useDispatch } from 'react-redux'
import { ActionTypes } from 'src/redux/actions/Connect'
import { initialState } from 'src/redux/reducers/configSlice'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { InstitutionStatusDetails } from 'src/views/institutionStatusDetails/InstitutionStatusDetails'

// Mock useDispatch
vitest.mock('react-redux', async () => {
  const actual = await vitest.importActual('react-redux')
  return { ...actual, useDispatch: vitest.fn() }
})
const mockDispatch = vitest.fn()
const mockedUseDispatch = vitest.mocked(useDispatch)

describe('InstitutionStatusDetails', () => {
  const preloadedState = {
    connect: {
      selectedInstitution: {
        name: 'Gringotts',
        guid: 'INS-123',
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
    const logo = screen.getByAltText('Logo for Gringotts')
    const disabledIcon = container.querySelector('.MuiSvgIcon-colorError')

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
