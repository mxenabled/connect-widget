import { ActionTypes, setWidgetVersion } from 'src/redux/actions/App'
import { app as reducer, defaultState } from 'src/redux/reducers/App'

const { SESSION_IS_TIMED_OUT } = ActionTypes

describe('app reducers', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(defaultState)
  })

  describe('SESSION_IS_TIMED_OUT', () => {
    it('should mark the session timed out', () => {
      const action = { type: SESSION_IS_TIMED_OUT }

      expect(reducer(undefined, action).sessionIsTimedOut).toBe(true)
    })
  })

  describe('SET_WIDGET_VERSION', () => {
    it('should store the widget version', () => {
      expect(reducer(undefined, setWidgetVersion('abc1234')).version).toBe('abc1234')
    })
  })
})
