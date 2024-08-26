import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import browserDispatcher from 'src/redux/actions/Browser'

interface WidgetDimensionObserverProps {
  heightOffset?: number
  children?: React.ReactNode
}

export const WidgetDimensionObserver: React.FC<WidgetDimensionObserverProps> = (props) => {
  const { heightOffset } = props
  const dispatch = useDispatch()
  const _handleResize = () => browserDispatcher(dispatch).updateDimensions(heightOffset)
  useEffect(() => {
    //Prevents honeybadger in legacy browsers that do not have this event
    if (!window.onorientationchange) window.onorientationchange = () => {}

    window.addEventListener('orientationchange', _handleResize)
    window.addEventListener('resize', _handleResize)
    _handleResize()
    return () => {
      window.removeEventListener('orientationchange', _handleResize)
      window.removeEventListener('resize', _handleResize)
    }
  }, [])

  return props.children
}
