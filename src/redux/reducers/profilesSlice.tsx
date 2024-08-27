import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  loading: true,
  client: {},
  clientColorScheme: {
    primary_100: '',
    primary_200: '',
    primary_300: '',
    primary_400: '',
    primary_500: '',
    color_scheme: 'light',
    widget_brand_color: null as string | null,
  },
  clientProfile: {},
  user: {},
  userProfile: {},
  widgetProfile: {},
}

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    loadProfiles: (
      state,
      action: PayloadAction<{
        client: object
        clientColorScheme: {
          primary_100: string
          primary_200: string
          primary_300: string
          primary_400: string
          primary_500: string
          color_scheme?: string
          widget_brand_color: string
        }
        clientProfile: object
        user: object
        userProfile: object
        widgetProfile: object
      }>,
    ) => {
      const {
        client = {},
        clientColorScheme = {},
        clientProfile = {},
        user = {},
        userProfile = {},
        widgetProfile = {},
      } = action.payload

      state.loading = false
      state.client = client
      state.clientColorScheme = {
        ...state.clientColorScheme,
        ...clientColorScheme,
      }
      state.clientProfile = clientProfile
      state.user = user
      state.userProfile = userProfile
      state.widgetProfile = widgetProfile
    },
    loadWidgetProfile: (state, action) => {
      state.widgetProfile = action.payload
    },
    updateUserProfile: (state, action) => {
      state.userProfile = action.payload.user_profile
    },
  },
})

// Actions
export const { loadProfiles, loadWidgetProfile, updateUserProfile } = profilesSlice.actions

export default profilesSlice.reducer
