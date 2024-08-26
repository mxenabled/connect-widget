import React from 'react'

import { css, keyframes } from '@mxenabled/cssinjs'

interface SlideDownProps {
  delay?: number
  duration?: number
  children?: React.ReactNode
}

/**
 * @param {int} delay    How long until the animation starts in ms
 * @param {int} duration How long the animation runs in ms
 */
export const SlideDown: React.FC<SlideDownProps> = ({ delay = 0, duration = 300, children }) => {
  const styles = getStyles(delay, duration)

  return <div className={styles}>{children}</div>
}

const getStyles = (delay: number, duration: number) => {
  const slideAnimation = keyframes({
    from: {
      opacity: 0,
      top: '-10px',
    },
    to: {
      opacity: 1,
      top: '0px',
    },
  })

  return css({
    position: 'relative',
    animationName: slideAnimation,
    animationFillMode: 'both',
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationTimingFunction: 'ease-in-out',
  })
}
