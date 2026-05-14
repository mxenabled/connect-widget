import { ActionTypes } from 'src/redux/actions/App'

export const defaultState = {
  sessionIsTimedOut: false,
  // We are adding this to use for certain requests to try to identify bots and
  // credential stuffing. See https://gitlab.mx.com/mx/connect/issues/279
  // wether or not we consider a human has used the app.
  humanEvent: false,
  version: null,
}

const markSessionTimedOut = (state) => ({ ...state, sessionIsTimedOut: true })

const handleHumanEvent = (state) => ({ ...state, humanEvent: true })

const setWidgetVersion = (state, action) => ({ ...state, version: action.payload || null })

export const app = (state = defaultState, action) => {
  switch (action.type) {
    case ActionTypes.SESSION_IS_TIMED_OUT:
      return markSessionTimedOut(state)
    case ActionTypes.HUMAN_EVENT_HAPPENED:
      return handleHumanEvent(state)
    case ActionTypes.SET_WIDGET_VERSION:
      return setWidgetVersion(state, action)
    default:
      return state
  }
}
