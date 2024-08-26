export const ActionTypes = {
  SESSION_IS_TIMED_OUT: 'app/session_is_timed_out',
  HUMAN_EVENT_HAPPENED: 'app/human_event_happened',
}

export const dispatcher = (dispatch) => ({
  markSessionTimedOut: () => dispatch({ type: ActionTypes.SESSION_IS_TIMED_OUT }),
  handleHumanEvent: () => dispatch({ type: ActionTypes.HUMAN_EVENT_HAPPENED }),
})
