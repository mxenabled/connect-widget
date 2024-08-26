import { createSlice } from '@reduxjs/toolkit'
import _get from 'lodash/get'

const initialState: {
  currentSession: object
  featureVisit: object
  path: unknown[]
  dataSource: string
} = {
  currentSession: {},
  featureVisit: {},
  path: [],
  dataSource: _get(window, 'app.options.type', 'app'),
}
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    analyticsSessionInitialized: (state, action) => {
      state.currentSession = action.payload
    },
    addAnalyticPath: (state, action) => {
      state.path = [...state.path, action.payload]
    },
    removeAnalyticPath: (state, action) => {
      state.path = state.path.filter((obj) => obj.path !== action.payload)
    },
    sendAnalyticPath: (state, action) => {
      state.path = [...state.path, action.payload]
    },
  },
})

// Actions

export const {
  analyticsSessionInitialized,
  addAnalyticPath,
  removeAnalyticPath,
  sendAnalyticPath,
} = analyticsSlice.actions

export default analyticsSlice.reducer
