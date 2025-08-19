import React from 'react'
import { useSelector } from 'react-redux'
import { COLOR_SCHEME } from 'src/const/Connect'
import { selectColorScheme } from 'src/redux/reducers/configSlice'
import ProgressBackdropDark from './ProgressBackdropDark.svg'
import ProgressBackdropLight from './ProgressBackdropLight.svg'

export const ProgressBackgroundImage = () => {
  const colorScheme = useSelector(selectColorScheme)

  return colorScheme === COLOR_SCHEME.LIGHT ? <ProgressBackdropLight /> : <ProgressBackdropDark />
}
