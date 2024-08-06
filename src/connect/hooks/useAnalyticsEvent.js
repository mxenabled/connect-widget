import { useContext } from 'react'
import { AnalyticContext } from 'src/widgets/desktop/Connect'
import { defaultEventMetadata } from 'src/connect/const/Analytics'

/**
 * This will return a function that can be used for sending analytic events.
 * Prefixing event names with `connect_` are provided by this hook.
 *
 * Usage example code to place inside of your functional component:
 *
 * const sendPosthogEvent = useAnalyticsEvent()
 *
 * sendPosthogEvent(eventName, metadata)
 * @param {string} name of the AnalyticEvent from src/connect/const/Analytics.js
 * @param {object} metadata of the event as requested by Product team
 */
export const useAnalyticsEvent = () => {
  const analyticFunctions = useContext(AnalyticContext)

  return (eventName, metadata = {}) =>
    analyticFunctions.onAnalyticEvent(`connect_${eventName}`, {
      ...defaultEventMetadata,
      ...metadata,
    })
}

export default useAnalyticsEvent
