import { combineEpics } from 'redux-observable'

import { loadConnect } from 'src/redux/epics/Connect'
import { postMessages } from 'src/redux/epics/PostMessage'

export const rootEpic = combineEpics(loadConnect, postMessages)
