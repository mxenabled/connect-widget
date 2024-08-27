import { useContext, useEffect } from 'react'
import { useDispatch, useSelector, RootStateOrAny } from 'react-redux'

import {
  addAnalyticPath,
  removeAnalyticPath,
  sendAnalyticPath,
} from 'src/redux/reducers/analyticsSlice'
import { isRunningE2ETests } from 'src/utilities/e2e'
import { AnalyticContext } from 'src/Connect'

/**
 * This will send a pageview analytic only once, during the render of the component it is
 * used in.
 *
 * Usage example code to place inside of your functional component:
 *
 * useAnalyticsPath("Connect MFA", "/mfa")
 *
 * @param {string} name of the component from src/const/Analytics.js
 * @param {string} path for the component in src/const/Analytics.js
 * @param {object} metadata for the event as requested by Product team
 * @param {boolean} send to posthog if true, just record in redux if false
 */
export const useAnalyticsPath = (
  name?: string,
  path?: string,
  metadata: object = {},
  send: boolean = true,
) => {
  const { onAnalyticPageview = () => {} } = useContext(AnalyticContext)
  const analytics = useSelector((state: RootStateOrAny) => state.analytics)
  const dispatch = useDispatch()

  useEffect(() => {
    if (send) {
      dispatch(sendAnalyticPath({ path, name, metadata }))

      if (!isRunningE2ETests()) {
        const builtPath = analytics.path.map((obj: { path: string }) => obj.path) // Get only the paths

        builtPath.push(path) // Add our current path before sending

        onAnalyticPageview(builtPath.join(''), metadata)
      }
    } else {
      dispatch(addAnalyticPath({ name, path }))
    }

    return () => {
      dispatch(removeAnalyticPath(path))
    }
  }, [])
}

export default useAnalyticsPath
