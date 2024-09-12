import { combineEpics } from 'redux-observable'

import { loadConnect, selectInstitution } from 'src/redux/epics/Connect'

export const rootEpic = combineEpics(loadConnect, selectInstitution)
