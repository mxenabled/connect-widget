import React from 'react'
import { useSelector } from 'react-redux'
import { getIsLightColorScheme } from 'src/redux/reducers/configSlice'
import ProgressBackdropDark from './ProgressBackdropDark.svg'
import ProgressBackdropLight from './ProgressBackdropLight.svg'

export const ProgressBackgroundImage = ({ className }: { className: string }) => {
  const isLightColorScheme = useSelector(getIsLightColorScheme)

  return (
    <div className={className}>
      {isLightColorScheme ? <ProgressBackdropLight /> : <ProgressBackdropDark />}
    </div>
  )
}
