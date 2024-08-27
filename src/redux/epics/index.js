import { combineEpics } from 'redux-observable'

import { loadConnect, selectInstitution } from 'src/redux/epics/Connect'
import { postMessages } from 'src/redux/epics/PostMessage'

export const rootEpic = combineEpics(loadConnect, selectInstitution, postMessages)
