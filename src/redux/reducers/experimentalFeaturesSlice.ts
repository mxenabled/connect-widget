import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'src/redux/Store'

type ExperimentalFeaturesSlice = {
  optOutOfEarlyUserRelease?: boolean
  unavailableInstitutions?: { guid: string; name: string }[]
  memberPollingMilliseconds?: number
  useWebSockets?: boolean
}

export const initialState: ExperimentalFeaturesSlice = {
  optOutOfEarlyUserRelease: false,
  unavailableInstitutions: [],
  memberPollingMilliseconds: undefined,
  useWebSockets: false,
}

const experimentalFeaturesSlice = createSlice({
  name: 'experimentalFeatures',
  initialState,
  reducers: {
    loadExperimentalFeatures(state, action) {
      state.unavailableInstitutions = action.payload?.unavailableInstitutions || []
      state.optOutOfEarlyUserRelease = action.payload?.optOutOfEarlyUserRelease || false
      state.memberPollingMilliseconds = action.payload?.memberPollingMilliseconds || undefined
      state.useWebSockets = action.payload?.useWebSockets || false
    },
  },
})

// Selectors

export const getExperimentalFeatures = (state: RootState) => state.experimentalFeatures

export const { loadExperimentalFeatures } = experimentalFeaturesSlice.actions

export default experimentalFeaturesSlice.reducer
