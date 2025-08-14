/**
 * Some components add a listener to the window or document. For example, AccountDetails
 * adds a 'keyup' listener for arrow key traversal through the accounts. The only way to
 * prevent that global listener from firing from a React component listener is to call
 * stopImmediatePropagation on the native event and stopPropagation and preventDefault
 * on the synthetic event.
 */
export const preventDefaultAndStopAllPropagation = (event) => {
  event.preventDefault()
  event.stopPropagation()
  event.nativeEvent.stopImmediatePropagation()
}
