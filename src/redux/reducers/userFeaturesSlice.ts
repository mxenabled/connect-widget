import { createSlice, createSelector } from '@reduxjs/toolkit'
import type { RootState } from 'src/redux/Store'
import * as UserFeatures from 'src/utilities/UserFeatures'
import { CONNECT_COMBO_JOBS, SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER } from 'src/const/UserFeatures'

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

export const shouldShowConnectGlobalNavigationHeader = createSelector(
  getUserFeatures,
  (userFeatures) => {
    return UserFeatures.isFeatureEnabled(userFeatures, SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER)
  },
)

export const isConnectComboJobsEnabled = createSelector(getUserFeatures, (userFeatures) => {
  return UserFeatures.isFeatureEnabled(userFeatures, CONNECT_COMBO_JOBS)
})

export const { loadUserFeatures } = userFeaturesSlice.actions

export default userFeaturesSlice.reducer
