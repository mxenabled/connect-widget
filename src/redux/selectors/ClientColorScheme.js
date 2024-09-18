import _get from 'lodash/get'
import _every from 'lodash/every'
import { createSelector } from 'reselect'

export const getNewClientColors = (state) => ({
  Brand100: state.profiles.clientColorScheme.primary_100,
  Brand200: state.profiles.clientColorScheme.primary_200,
  Brand300: state.profiles.clientColorScheme.primary_300,
  Brand400: state.profiles.clientColorScheme.primary_400,
  Brand500: state.profiles.clientColorScheme.primary_500,
})

// This should only be used in conjuction with the TokenProvider to accomodate custom brand color via `widget_brand_color`.
export const getOldClientColors = (state) => {
  // Set in Batcave>Client>Client Color Scheme>Widget Brand Color
  const widgetBrandColor = _get(state, 'profiles.clientColorScheme.widget_brand_color')

  if (!widgetBrandColor) {
    return {}
  }

  return {
    Brand100: '#F8F9FB', // We couldn't come up with a consistent good looking color with the proper aspect ratio. Defaults to Neutral_100.
    Brand200: adjustColor(widgetBrandColor, +15),
    Brand300: widgetBrandColor,
    Brand400: adjustColor(widgetBrandColor, -15),
    Brand500: adjustColor(widgetBrandColor, -30),
  }
}

export const getTokenProviderValues = createSelector(
  (state) => state.config.color_scheme,
  getNewClientColors,
  getOldClientColors,
  (theme, newColors, oldColors) => {
    // If we have all the new client colors from the database, use the new colors
    const hasNewColors = _every(Object.values(newColors), (color) => !!color)

    if (hasNewColors) {
      return {
        tokenOverrides: {
          Color: {
            ...newColors,
          },
        },
        theme,
      }
    }

    return {
      tokenOverrides: {
        Color: {
          ...oldColors,
        },
      },
      theme,
    }
  },
)

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

  // subtract amount from each individual red green blue value
  let intRVal = parseInt(colorPadded.slice(0, 2), 16) + amt
  let intGVal = parseInt(colorPadded.slice(2, 4), 16) + amt
  let intBVal = parseInt(colorPadded.slice(4, 6), 16) + amt

  if (intRVal > 255) {
    intRVal = 255
  } else if (intRVal < 0) {
    intRVal = 0
  }
  if (intGVal > 255) {
    intGVal = 255
  } else if (intGVal < 0) {
    intGVal = 0
  }

  if (intBVal > 255) {
    intBVal = 255
  } else if (intBVal < 0) {
    intBVal = 0
  }

  // pad each 2 digit hex value to ensure it is in the correct format for css
  const hexR = intRVal.toString(16).padStart(2, '0')
  const hexG = intGVal.toString(16).padStart(2, '0')
  const hexB = intBVal.toString(16).padStart(2, '0')

  // concatenate the 3 values
  return (usePound ? '#' : '') + (hexR + hexG + hexB)
}
