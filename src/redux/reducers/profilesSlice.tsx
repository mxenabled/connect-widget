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
        client_color_scheme: {
          primary_100: string
          primary_200: string
          primary_300: string
          primary_400: string
          primary_500: string
          color_scheme?: string
          widget_brand_color: string
        }
        client_profile: object
        user: object
        user_profile: object
        widget_profile: object
      }>,
    ) => {
      const {
        client = {},
        client_color_scheme = {},
        client_profile = {},
        user = {},
        user_profile = {},
        widget_profile = {},
      } = action.payload

      state.loading = false
      state.client = client
      state.clientColorScheme = {
        ...state.clientColorScheme,
        ...client_color_scheme,
      }
      state.clientProfile = client_profile
      state.user = user
      state.userProfile = user_profile
      state.widgetProfile = widget_profile
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
