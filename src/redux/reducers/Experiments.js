import { createReducer } from 'src/utilities/Reducer'

import { ActionTypes } from 'src/redux/actions/Experiments'

export const defaultState = {
  items: [],
  loading: true,
}

const loadExperiments = (state, action) => ({
  ...state,
  items: action.payload,
  loading: false,
})

export const experiments = createReducer(defaultState, {
  [ActionTypes.LOAD_EXPERIMENTS]: loadExperiments,
})
