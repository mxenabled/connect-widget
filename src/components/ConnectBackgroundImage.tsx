import React from 'react'
import { useSelector } from 'react-redux'
import { COLOR_SCHEME } from 'src/const/Connect'
import { selectColorScheme } from 'src/redux/reducers/configSlice'
import ConnectHeaderBackdropDark from 'src/images/header/ConnectHeaderBackdropDark.svg'
import ConnectHeaderBackdropLight from 'src/images/header/ConnectHeaderBackdropLight.svg'

export const ConnectBackgroundImage = () => {
  const colorScheme = useSelector(selectColorScheme)

  return colorScheme === COLOR_SCHEME.LIGHT ? (
    <ConnectHeaderBackdropLight />
  ) : (
    <ConnectHeaderBackdropDark />
  )
}
