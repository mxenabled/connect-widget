import { combineEpics } from 'redux-observable'

import { loadConnect, selectInstitution } from './Connect'
// import { loadConnections, updateAccountsAfterConnecting } from './Connections'
import { postMessages } from './PostMessage'

export const rootEpic = combineEpics(
  loadConnect,
  selectInstitution,
  // loadConnections,
  postMessages,
  // updateAccountsAfterConnecting,
)
