import React from 'react'
import { useDispatch } from 'react-redux'
import { ActionTypes } from 'src/redux/actions/Connect'
import { initialState } from 'src/redux/reducers/configSlice'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { InstitutionDisabled } from 'src/views/institutionDisabled/InstitutionDisabled'

// Mock useDispatch
vitest.mock('react-redux', async () => {
  const actual = await vitest.importActual('react-redux')
  return { ...actual, useDispatch: vitest.fn() }
})
const mockDispatch = vitest.fn()
const mockedUseDispatch = vitest.mocked(useDispatch)

describe('InstitutionDisabled', () => {
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

  beforeEach(() => {
    // Reset the mock before each test
    mockDispatch.mockClear()
    mockedUseDispatch.mockReturnValue(mockDispatch)

    render(<InstitutionDisabled />, {
      preloadedState,
    })
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

  it('renders a primary button that dispatches the correct action', () => {
    const button = screen.getByRole('button', { name: 'Go back' })

    expect(button).toBeInTheDocument()
    button.click()
    waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: ActionTypes.GO_BACK_INSTITUTION_DISABLED,
        payload: {
          mode: 'AGG',
        },
      }),
    )
  })
})
