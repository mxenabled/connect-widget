import React from 'react'
import { useDispatch } from 'react-redux'
import { render, screen } from 'src/utilities/testingLibrary'
import { DemoConnectGuard } from './DemoConnectGuard'
import { initialState } from 'src/services/mockedData'
import * as connectActions from 'src/redux/actions/Connect'

// Mock useDispatch
vitest.mock('react-redux', async () => {
  const actual = await vitest.importActual('react-redux')
  return { ...actual, useDispatch: vitest.fn() }
})
const mockDispatch = vitest.fn()
const mockedUseDispatch = vitest.mocked(useDispatch)

describe('DemoConnectGuard', () => {
  const mockInstitution = {
    guid: 'INS-test-123',
    name: 'Test Bank',
    logo_url: 'https://example.com/logo.png',
    code: 'TEST',
    url: 'https://testbank.com',
  }

  const mockInitialState = {
    ...initialState,
    connect: {
      ...initialState.connect,
      selectedInstitution: mockInstitution,
    },
  }

  beforeEach(() => {
    mockDispatch.mockClear()
    mockedUseDispatch.mockReturnValue(mockDispatch)
  })

  it('renders all component elements correctly', () => {
    const { container } = render(<DemoConnectGuard />, { preloadedState: mockInitialState })

    expect(screen.getByText('Demo mode active')).toBeInTheDocument()
    expect(
      screen.getByText(/Live institutions are not available in the demo environment/i),
    ).toBeInTheDocument()
    expect(screen.getByText('MX Bank')).toBeInTheDocument()

    const logo = screen.getByAltText('Logo for Test Bank')
    expect(logo).toBeInTheDocument()

    const errorIcon = container.querySelector('svg.MuiSvgIcon-colorError')
    expect(errorIcon).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /return to institution selection/i })
    expect(button).toBeInTheDocument()
  })

  it('dispatches the correct action when return button is clicked', async () => {
    const { user } = render(<DemoConnectGuard />, { preloadedState: mockInitialState })

    const returnButton = screen.getByRole('button', { name: /return to institution selection/i })
    await user.click(returnButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: connectActions.ActionTypes.DEMO_CONNECT_GUARD_RETURN_TO_SEARCH,
      payload: {},
    })
  })
})
