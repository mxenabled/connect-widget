import React, { CSSProperties } from 'react'
import { useSelector } from 'react-redux'
import { getIsLightColorScheme } from 'src/redux/reducers/configSlice'
import ProgressBackdropDark from './ProgressBackdropDark.svg'
import ProgressBackdropLight from './ProgressBackdropLight.svg'

export const ProgressBackgroundImage = ({ style }: { style: CSSProperties }) => {
  const isLightColorScheme = useSelector(getIsLightColorScheme)

  return (
    <div style={style}>
      {isLightColorScheme ? <ProgressBackdropLight /> : <ProgressBackdropDark />}
    </div>
  )
}
