import _every from 'lodash/every'
import { createSelector } from '@reduxjs/toolkit'

// Memoized selectors for individual pieces of state
const getTheme = (state) => state.config.color_scheme
const getClientColorScheme = (state) => state.profiles.clientColorScheme

// Memoized selector for new client colors(primary 100-500)
export const getNewClientColors = createSelector([getClientColorScheme], (colorScheme) => ({
  Brand100: colorScheme?.primary_100,
  Brand200: colorScheme?.primary_200,
  Brand300: colorScheme?.primary_300,
  Brand400: colorScheme?.primary_400,
  Brand500: colorScheme?.primary_500,
}))

// Memoized selector for old client colors
// This should only be used in conjuction with the TokenProvider to accomodate custom brand color via `widget_brand_color`.
// Set in Batcave>Client>Client Color Scheme>Widget Brand Color
export const getOldClientColors = createSelector(
  [getClientColorScheme],
  ({ widget_brand_color }) => {
    return widget_brand_color
      ? {
          Brand100: '#F8F9FB', // We couldn't come up with a consistent good looking color with the proper aspect ratio. Defaults to Neutral_100.
          Brand200: adjustColor(widget_brand_color, +15),
          Brand300: widget_brand_color,
          Brand400: adjustColor(widget_brand_color, -15),
          Brand500: adjustColor(widget_brand_color, -30),
        }
      : {}
  },
)

// Main selector that combines the results
export const getTokenProviderValues = createSelector(
  [getTheme, getNewClientColors, getOldClientColors],
  (theme, newColors, oldColors) => {
    // If we have all the new client colors from the database, use the new colors
    const hasNewColors = _every(Object.values(newColors), Boolean)

    return {
      tokenOverrides: { Color: hasNewColors ? newColors : oldColors },
      theme,
    }
  },
)

// Helper function for color adjustment
export const adjustColor = (col, amt) => {
  let color = col
  let usePound = false

  if (color[0] === '#') {
    // remove hash sign
    color = color.slice(1)
    usePound = true
  }

  // turn it into a 6 digit string
  const colorPadded = color.padStart(6, '0')

  // subtract amount from each individual red/green/blue value
  let intRVal = parseInt(colorPadded.slice(0, 2), 16) + amt
  let intGVal = parseInt(colorPadded.slice(2, 4), 16) + amt
  let intBVal = parseInt(colorPadded.slice(4, 6), 16) + amt

  // ensure each value is between 0 and 255
  intRVal = Math.min(Math.max(intRVal, 0), 255)
  intGVal = Math.min(Math.max(intGVal, 0), 255)
  intBVal = Math.min(Math.max(intBVal, 0), 255)

  // pad each 2 digit hex value to ensure it is in the correct format for css
  const hexR = intRVal.toString(16).padStart(2, '0')
  const hexG = intGVal.toString(16).padStart(2, '0')
  const hexB = intBVal.toString(16).padStart(2, '0')

  return (usePound ? '#' : '') + (hexR + hexG + hexB)
}
