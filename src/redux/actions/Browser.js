import * as BrowserUtils from 'src/connect/utilities/Browser'

export const ActionTypes = { SET_BROWSER_DIMENSIONS: 'browser/set_browser_dimensions' }

const updateDimensions = (extraHeightOffset = 0) => {
  const fullHeight = BrowserUtils.getWindowHeight()
  const height = fullHeight - 51 - extraHeightOffset // (51 is) Buttons 30px + 10px margin top + 10px margin bottom + 1px border bottom

  return {
    type: ActionTypes.SET_BROWSER_DIMENSIONS,
    payload: {
      fullHeight,
      height,
      isMobile: BrowserUtils.isMobile(),
      isTablet: BrowserUtils.isTablet(),
      size: BrowserUtils.getWindowSize(),
      width: BrowserUtils.getWindowWidth(),
      trueWidth: BrowserUtils.getTrueWindowWidth(),
    },
  }
}

export default dispatch => ({
  updateDimensions: extraHeightOffset => dispatch(updateDimensions(extraHeightOffset)),
})
