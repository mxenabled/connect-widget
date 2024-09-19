import { createSlice } from '@reduxjs/toolkit'

export type ProfileState = {
  loading: boolean
  client: {
    default_institution_guid?: string
    guid?: string
    name?: string
    has_atrium_api?: boolean
  }
  clientColorScheme: {
    primary_100: string
    primary_200: string
    primary_300: string
    primary_400: string
    primary_500: string
    color_scheme?: string
    widget_brand_color: string | null
  }
  clientProfile: {
    account_verification_is_enabled?: boolean
    tax_statement_is_enabled?: boolean
  }
  user: object
  userProfile: object
  widgetProfile: object
}

const initialState: ProfileState = {
  loading: true,
  client: {},
  clientColorScheme: {
    primary_100: '',
    primary_200: '',
    primary_300: '',
    primary_400: '',
    primary_500: '',
    color_scheme: 'light',
    widget_brand_color: null,
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
    loadProfiles: (state, action) => {
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
