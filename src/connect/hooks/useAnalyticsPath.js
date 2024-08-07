import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addAnalyticPath,
  removeAnalyticPath,
  sendAnalyticPath,
} from "reduxify/reducers/analyticsSlice";
import { isRunningE2ETests } from "src/connect/utilities/e2e";
import { AnalyticContext } from "src/Connect";

/**
 * This will send a pageview analytic only once, during the render of the component it is
 * used in.
 *
 * Usage example code to place inside of your functional component:
 *
 * useAnalyticsPath("Connect MFA", "/mfa")
 *
 * @param {string} name of the component from src/connect/const/Analytics.js
 * @param {string} path for the component in src/connect/const/Analytics.js
 * @param {object} metadata for the event as requested by Product team
 * @param {boolean} send to posthog if true, just record in redux if false
 */
export const useAnalyticsPath = (name, path, metadata = {}, send = true) => {
  const { onAnalyticPageview = () => {} } = useContext(AnalyticContext);
  const analytics = useSelector((state) => state.analytics);
  const dispatch = useDispatch();

  useEffect(() => {
    if (send) {
      dispatch(sendAnalyticPath({ path, name, metadata }));

      if (!isRunningE2ETests()) {
        const builtPath = analytics.path.map((obj) => obj.path); // Get only the paths

        builtPath.push(path); // Add our current path before sending

        onAnalyticPageview(builtPath.join(""), metadata);
      }
    } else {
      dispatch(addAnalyticPath({ name, path }));
    }

    return () => dispatch(removeAnalyticPath(path));
  }, []);
};

export default useAnalyticsPath;
