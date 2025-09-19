import React from 'react'

import { render, screen } from 'src/utilities/testingLibrary'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'
import { useActionableErrorMap } from 'src/views/actionableError/useActionableErrorMap'
import { ActionTypes } from 'src/redux/actions/Connect'
import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'

// Setup Mocks
const setShowSupport = vitest.fn()
export const dispatch = vitest.fn()
vitest.mock('react-redux', async (importActual) => {
  const actual = (await importActual()) as object
  return {
    ...actual,
    useDispatch: () => dispatch,
  }
})

// Mock preloaded states
const verificationPreloadedState = { connect: { initialConfig: { mode: VERIFY_MODE } } }
const aggregationPreloadedState = { connect: { initialConfig: { mode: AGG_MODE } } }

// Test Component to utilize the hook
const TestComponent = ({ errorCode }: { errorCode: number }) => {
  const errorDetails = useActionableErrorMap(errorCode, setShowSupport)

  return (
    <div>
      <h1>{errorDetails.title}</h1>
      <button onClick={errorDetails.primaryAction.action}>
        {errorDetails.primaryAction.label}
      </button>
      <button onClick={errorDetails.secondaryActions.action}>
        {errorDetails.secondaryActions.label}
      </button>
    </div>
  )
}

describe('useActionableErrorMap', () => {
  beforeEach(() => {
    vitest.clearAllMocks()
  })

  it('should return correct mapping and actions for NO_ELIGIBLE_ACCOUNTS', () => {
    render(<TestComponent errorCode={ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS} />, {
      preloadedState: verificationPreloadedState,
    })
    expect(screen.getByText('No eligible accounts')).toBeInTheDocument()
    expect(screen.getByText('Log in again')).toBeInTheDocument()
    expect(screen.getByText('Connect a different institution')).toBeInTheDocument()

    const primaryButton = screen.getByText('Log in again')
    const secondaryButton = screen.getByText('Connect a different institution')

    primaryButton.click()
    expect(dispatch).toHaveBeenCalledWith({ type: ActionTypes.ACTIONABLE_ERROR_LOG_IN_AGAIN })

    secondaryButton.click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
      payload: VERIFY_MODE,
    })
  })

  it('should return correct mapping and actions for NO_ACCOUNTS', () => {
    render(<TestComponent errorCode={ACTIONABLE_ERROR_CODES.NO_ACCOUNTS} />, {
      preloadedState: aggregationPreloadedState,
    })
    expect(screen.getByText('No accounts found')).toBeInTheDocument()
    expect(screen.getByText('Return to institution selection')).toBeInTheDocument()
    expect(screen.getByText('Get help')).toBeInTheDocument()

    const primaryButton = screen.getByText('Return to institution selection')
    const secondaryButton = screen.getByText('Get help')

    primaryButton.click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
      payload: AGG_MODE,
    })

    secondaryButton.click()
    expect(setShowSupport).toHaveBeenCalledTimes(1)
  })

  it('should return correct mapping and actions for ACCESS_DENIED', () => {
    render(<TestComponent errorCode={ACTIONABLE_ERROR_CODES.ACCESS_DENIED} />, {
      preloadedState: aggregationPreloadedState,
    })
    expect(screen.getByText('Additional permissions needed')).toBeInTheDocument()
    expect(screen.getByText('Review instructions')).toBeInTheDocument()
    expect(screen.getByText('Get help')).toBeInTheDocument()

    const primaryButton = screen.getByText('Review instructions')
    const secondaryButton = screen.getByText('Get help')

    primaryButton.click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_LOG_IN_AGAIN,
    })

    secondaryButton.click()
    expect(setShowSupport).toHaveBeenCalledTimes(1)
  })

  it('should return correct mapping and actions for INSTITUTION_DOWN', () => {
    render(<TestComponent errorCode={ACTIONABLE_ERROR_CODES.INSTITUTION_DOWN} />, {
      preloadedState: aggregationPreloadedState,
    })
    expect(screen.getByText('Unable to connect')).toBeInTheDocument()
    expect(screen.getByText('Return to institution selection')).toBeInTheDocument()
    expect(screen.getByText('Get help')).toBeInTheDocument()

    const primaryButton = screen.getByText('Return to institution selection')
    const secondaryButton = screen.getByText('Get help')

    primaryButton.click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
      payload: AGG_MODE,
    })

    secondaryButton.click()
    expect(setShowSupport).toHaveBeenCalledTimes(1)
  })

  it('should return correct mapping and actions for INSTITUTION_MAINTENANCE', () => {
    render(<TestComponent errorCode={ACTIONABLE_ERROR_CODES.INSTITUTION_MAINTENANCE} />, {
      preloadedState: aggregationPreloadedState,
    })
    expect(screen.getByText('Maintenance in progress')).toBeInTheDocument()
    expect(screen.getByText('Return to institution selection')).toBeInTheDocument()
    expect(screen.getByText('Get help')).toBeInTheDocument()

    const primaryButton = screen.getByText('Return to institution selection')
    const secondaryButton = screen.getByText('Get help')

    primaryButton.click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
      payload: AGG_MODE,
    })

    secondaryButton.click()
    expect(setShowSupport).toHaveBeenCalledTimes(1)
  })

  it('should return correct mapping and actions for INSTITUTION_UNAVAILABLE', () => {
    render(<TestComponent errorCode={ACTIONABLE_ERROR_CODES.INSTITUTION_UNAVAILABLE} />, {
      preloadedState: aggregationPreloadedState,
    })
    expect(screen.getByText('Unable to connect')).toBeInTheDocument()
    expect(screen.getByText('Return to institution selection')).toBeInTheDocument()
    expect(screen.getByText('Get help')).toBeInTheDocument()

    const primaryButton = screen.getByText('Return to institution selection')
    const secondaryButton = screen.getByText('Get help')

    primaryButton.click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
      payload: AGG_MODE,
    })

    secondaryButton.click()
    expect(setShowSupport).toHaveBeenCalledTimes(1)
  })
})
