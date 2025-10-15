import { createSlice, createSelector } from '@reduxjs/toolkit'
import * as UserFeatures from 'src/utilities/UserFeatures'
import { CONNECT_COMBO_JOBS, CONNECT_CONSENT } from 'src/const/UserFeatures'
import { RootState } from 'src/redux/Store'

type UserFeaturesSlice = {
  items: { feature_name: string; is_enabled: boolean }[]
}

export const initialState: UserFeaturesSlice = {
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

export const isConsentEnabled = createSelector(getUserFeatures, (userFeatures) => {
  return UserFeatures.isFeatureEnabled(userFeatures, CONNECT_CONSENT)
})

export const { loadUserFeatures } = userFeaturesSlice.actions

export default userFeaturesSlice.reducer
