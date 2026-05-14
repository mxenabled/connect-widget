export const ActionTypes = {
  SESSION_IS_TIMED_OUT: 'app/session_is_timed_out',
  HUMAN_EVENT_HAPPENED: 'app/human_event_happened',
  SET_WIDGET_VERSION: 'app/set_widget_version',
}

export const setWidgetVersion = (version) => ({
  type: ActionTypes.SET_WIDGET_VERSION,
  payload: version,
})

export const dispatcher = (dispatch) => ({
  markSessionTimedOut: () => dispatch({ type: ActionTypes.SESSION_IS_TIMED_OUT }),
  handleHumanEvent: () => dispatch({ type: ActionTypes.HUMAN_EVENT_HAPPENED }),
})
