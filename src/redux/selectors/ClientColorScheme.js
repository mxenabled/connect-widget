import { createSelector } from '@reduxjs/toolkit'

const getClientColorScheme = (state) => state.profiles.clientColorScheme
export const getPrimarySeedColor = createSelector(
  getClientColorScheme,
  // The primary seed color is either the `widget_brand_color` or the `primary_300`
  // This is used to set the primary color in the theme paletteOptions and let MXUI generate the rest of the colors(primary 100-500)
  (colorScheme) => colorScheme?.widget_brand_color || colorScheme?.primary_300,
)
