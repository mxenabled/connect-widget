import Velocity from 'velocity-animate'

export const fadeOut = (el, direction = 'up', duration = 500) => {
  return new Promise((resolve) =>
    resolve(
      Velocity(
        el,
        {
          translateY: direction === 'up' ? '-25px' : '25px',
          opacity: 0,
        },
        {
          duration,
          easing: 'ease-in',
        },
      ),
    ),
  )
}
