import { dispatcher as appDispatcher, ActionTypes, setWidgetVersion } from 'src/redux/actions/App'
import { createReduxActionUtils } from 'src/utilities/Test'

const { actions, expectDispatch, resetDispatch } = createReduxActionUtils(appDispatcher)

describe('app Dispatcher', () => {
  beforeEach(() => {
    resetDispatch()
  })

  it('should dispatch SESSION_IS_TIMED_OUT', () => {
    actions.markSessionTimedOut()
    expectDispatch({ type: ActionTypes.SESSION_IS_TIMED_OUT })
  })

  it('should dispatch SET_WIDGET_VERSION', () => {
    actions.setWidgetVersion('abc1234')
    expectDispatch({ type: ActionTypes.SET_WIDGET_VERSION, payload: 'abc1234' })
  })

  it('should create SET_WIDGET_VERSION action', () => {
    expect(setWidgetVersion('abc1234')).toEqual({
      type: ActionTypes.SET_WIDGET_VERSION,
      payload: 'abc1234',
    })
  })
})
