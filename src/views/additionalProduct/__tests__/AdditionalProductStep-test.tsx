import React from 'react'

import AdditionalProductStep from '../AdditionalProductStep'
import { render, screen } from 'src/utilities/testingLibrary'
import { initialState as defaultState } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'
import { CONNECT_CONSENT } from 'src/const/UserFeatures'
import { ActionTypes } from 'src/redux/actions/Connect'
import { addAggregationData, addVerificationData } from 'src/redux/reducers/configSlice'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

const institutionMock = {
  name: 'Institution',
  guid: 'INS-123',
}

const locationMock = [{ step: STEPS.SEARCH }, { step: STEPS.ADDITIONAL_PRODUCT }]

export const dispatch = vitest.fn()
vitest.mock('react-redux', async (importActual) => {
  const actual = (await importActual()) as object
  return { ...actual, useDispatch: () => dispatch }
})

describe('AdditionalProductStep - Account verification', () => {
  const initialState = {
    ...defaultState,
    connect: {
      ...defaultState.connect,
      selectedInstitution: institutionMock,
      location: locationMock,
    },
    config: {
      ...defaultState.config,
      additional_product_option: COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER,
    },
    userFeatures: {
      ...defaultState.userFeatures,
      items: [{ feature_name: CONNECT_CONSENT, is_enabled: true }],
    },
  }

  beforeEach(() => {
    vitest.clearAllMocks()
  })

  it('should render the add account_verification text and handle yes click', () => {
    render(<AdditionalProductStep />, {
      preloadedState: initialState,
    })
    const titleText = screen.getByText('Add transfers and payments?')
    expect(titleText).toBeInTheDocument()

    screen
      .getByRole('button', {
        name: 'Yes, add transfers and payments',
      })
      .click()
    expect(dispatch).toHaveBeenCalledWith(addVerificationData())

    screen
      .getByRole('button', {
        name: 'No, only add financial management',
      })
      .click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.REJECT_ADDITIONAL_PRODUCT,
      payload: { consentIsEnabled: true },
    })
  })
})

describe('AdditionalProductStep - Transactions', () => {
  const initialState = {
    ...defaultState,
    config: {
      ...defaultState.config,
      additional_product_option: COMBO_JOB_DATA_TYPES.TRANSACTIONS,
    },
    connect: {
      ...defaultState.connect,
      selectedInstitution: institutionMock,
      location: locationMock,
    },
    userFeatures: {
      ...defaultState.userFeatures,
      items: [{ feature_name: CONNECT_CONSENT, is_enabled: true }],
    },
  }

  it('should render the add transactions text and handle yes click', () => {
    render(<AdditionalProductStep />, {
      preloadedState: initialState,
    })
    const titleText = screen.getByText('Add financial management?')
    expect(titleText).toBeInTheDocument()

    screen
      .getByRole('button', {
        name: 'Yes, add financial management',
      })
      .click()
    expect(dispatch).toHaveBeenCalledWith(addAggregationData())

    screen
      .getByRole('button', {
        name: 'No, only add transfers and payments',
      })
      .click()
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.REJECT_ADDITIONAL_PRODUCT,
      payload: { consentIsEnabled: true },
    })
  })
})
