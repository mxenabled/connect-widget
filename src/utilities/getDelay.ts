/**
 * A simple function to use with our SlideDown components delay prop
 * to allow for the incrementing value to automatically be increased
 * regardless of the number of SlideDown components that actually get rendered
 *
 * @param {int} startingValue Value to start our delays at (Probably start at 0)
 * @param {int} incrementer   Amount to increase between each delay (We've generally used 100)
 */
export const getDelay = (startingValue: number = 0, increment: number = 100) => {
  let localStartingValue = startingValue
  const getNextDelay = () => (localStartingValue += increment)

  return getNextDelay
}
