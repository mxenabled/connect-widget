import { createSlice, createSelector } from '@reduxjs/toolkit'
import * as UserFeatures from 'utils/UserFeatures'
import { CONNECT_COMBO_JOBS } from 'src/const/UserFeatures'

export const initialState = {
  items: [],
} satisfies UserFeaturesType as UserFeaturesType

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
