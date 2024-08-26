export const isSafari = vi.fn(() => false)
export const isIE = vi.fn(() => false)
export const getHostname = vi.fn(() => 'mx.com')
export const isMobile = vi.fn(() => true)
export const isTablet = vi.fn(() => false)
export const getWindowHeight = vi.fn(() => 330)
export const getWindowWidth = vi.fn(() => 480)
export const getTrueWindowWidth = vi.fn(() => 435)
export const getWindowSize = vi.fn(() => 'small')
export const breakpointNumberOnly = vi.fn(() => 576)

export default {
  isSafari,
  isIE,
  getHostname,
  isMobile,
  isTablet,
  getWindowHeight,
  getWindowWidth,
  getTrueWindowWidth,
}
