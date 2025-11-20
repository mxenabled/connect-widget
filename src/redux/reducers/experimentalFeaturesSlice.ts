import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'src/redux/Store'

type ExperimentalFeaturesSlice = {
  optOutOfEarlyUserRelease?: boolean
  unavailableInstitutions?: { guid: string; name: string }[]
}

export const initialState: ExperimentalFeaturesSlice = {
  optOutOfEarlyUserRelease: false,
  unavailableInstitutions: [],
}

const experimentalFeaturesSlice = createSlice({
  name: 'experimentalFeatures',
  initialState,
  reducers: {
    loadExperimentalFeatures(state, action) {
      state.unavailableInstitutions = action.payload?.unavailableInstitutions || []
      state.optOutOfEarlyUserRelease = action.payload?.optOutOfEarlyUserRelease || false
    },
  },
})

// Selectors

export const getExperimentalFeatures = (state: RootState) => state.experimentalFeatures

export const { loadExperimentalFeatures } = experimentalFeaturesSlice.actions

export default experimentalFeaturesSlice.reducer
