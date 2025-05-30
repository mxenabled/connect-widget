import React from 'react'

import AdditionalProductStep from '../AdditionalProductStep'
import { render, screen } from 'src/utilities/testingLibrary'
import { initialState as defaultState } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'

const institutionMock = {
  name: 'Institution',
  guid: 'INS-123',
}

const locationMock = [{ step: STEPS.SEARCH }, { step: STEPS.ADDITIONAL_PRODUCT }]

const yesButtonFn = vi.fn()
const noButtonFn = vi.fn()

beforeEach(() => {
  yesButtonFn.mockRestore()
  noButtonFn.mockRestore()
})

describe('AdditionalProductStep - Account verification', () => {
  const initialState = {
    ...defaultState,
    connect: {
      ...defaultState.connect,
      selectedInstitution: institutionMock,
      location: locationMock,
    },
  }

  it('should render the add account_verification text and handle yes click', () => {
    render(
      <AdditionalProductStep
        additionalProductName="account_verification"
        onNoClick={noButtonFn}
        onYesClick={yesButtonFn}
      />,
      {
        preloadedState: initialState,
      },
    )
    const titleText = screen.getByText('Add transfers and payments?')
    expect(titleText).toBeInTheDocument()

    screen
      .getByRole('button', {
        name: 'Yes, add transfers and payments',
      })
      .click()
    expect(yesButtonFn).toHaveBeenCalled()

    screen
      .getByRole('button', {
        name: 'No, just financial management',
      })
      .click()
    expect(noButtonFn).toHaveBeenCalled()
  })
})

describe('AdditionalProductStep - Transactions', () => {
  const initialState = {
    ...defaultState,
    connect: {
      ...defaultState.connect,
      selectedInstitution: institutionMock,
      location: locationMock,
    },
  }

  it('should render the add transactions text and handle yes click', () => {
    render(
      <AdditionalProductStep
        additionalProductName="transactions"
        onNoClick={noButtonFn}
        onYesClick={yesButtonFn}
      />,
      {
        preloadedState: initialState,
      },
    )
    const titleText = screen.getByText('Add financial management?')
    expect(titleText).toBeInTheDocument()

    screen
      .getByRole('button', {
        name: 'Yes, add financial management',
      })
      .click()
    expect(yesButtonFn).toHaveBeenCalled()

    screen
      .getByRole('button', {
        name: 'No, just transfers and payment',
      })
      .click()
    expect(noButtonFn).toHaveBeenCalled()
  })
})
