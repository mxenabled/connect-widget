import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'src/redux/Store'
import { createSelector } from '@reduxjs/toolkit'

type AdditionalProductScreenText = {
  title?: string
  body?: string
  button_1?: string
  button_2?: string
}

type LocalizedContent = {
  connect?: {
    additional_product_screen?: {
      add_aggregation?: AdditionalProductScreenText
      add_verification?: AdditionalProductScreenText
    }
  }
}

const initialState: LocalizedContent = {}

const localizedContentSlice = createSlice({
  name: 'localizedContent',
  initialState,
  reducers: {
    setLocalizedContent(_state, action: PayloadAction<LocalizedContent>) {
      return action.payload
    },
  },
})

export const { setLocalizedContent } = localizedContentSlice.actions

export default localizedContentSlice.reducer

export const selectLocalizedContent = createSelector(
  (state: RootState) => state.localizedContent,
  (localizedContent) => localizedContent,
)
