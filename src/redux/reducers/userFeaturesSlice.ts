import { createSlice, createSelector } from '@reduxjs/toolkit'
import * as UserFeatures from 'src/utilities/UserFeatures'
import { CONNECT_COMBO_JOBS } from 'src/const/UserFeatures'

export const initialState = {
  items: [],
}

const userFeaturesSlice = createSlice({
  name: 'userFeatures',
  initialState,
  reducers: {
    loadUserFeatures(state, action) {
      state.items = action.payload
    },
  },
})

// Selectors

export const getUserFeatures = (state: RootState) => state.userFeatures.items

export const isConnectComboJobsEnabled = createSelector(getUserFeatures, (userFeatures) => {
  return UserFeatures.isFeatureEnabled(userFeatures, CONNECT_COMBO_JOBS)
})

export const { loadUserFeatures } = userFeaturesSlice.actions

export default userFeaturesSlice.reducer
