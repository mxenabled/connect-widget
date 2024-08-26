import _memoize from 'lodash/memoize'
import connectAPI from 'src/services/api'

export const closeAnalyticsSessionFactory = _memoize(
  (currentSession) => () => connectAPI.closeAnalyticsSession({ analytics_session: currentSession }),
)
