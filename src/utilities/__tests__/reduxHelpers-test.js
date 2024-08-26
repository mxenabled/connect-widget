import _keys from 'lodash/keys'
import { createReducer, combineDispatchers } from 'src/utilities/reduxHelpers'
import { ActionTypes } from 'src/redux/actions/Connect'

describe('ActionHelpers', () => {
  let dispatchCalled = false
  const dispatch = () => (dispatchCalled = true)
  const dispatcherA = (dispatch) => ({
    create: () => dispatch(),
    read: () => dispatch(),
  })
  const dispatcherB = (dispatch) => ({
    update: () => dispatch(),
    delete: () => dispatch(),
  })

  beforeEach(() => {
    dispatchCalled = false
  })

  describe('createReducer', () => {
    const defaultState = {
      isComponentLoading: true,
    }
    const handlers = {
      [ActionTypes.LOAD_CONNECT]: (state) => ({
        ...state,
        isComponentLoading: true,
      }),
      [ActionTypes.LOAD_CONNECT_SUCCESS]: (state) => ({
        ...state,
        isComponentLoading: false,
      }),
    }
    const actionHandlers = createReducer(defaultState, handlers)

    it('creates a reducer that handles different actions', () => {
      let state = actionHandlers(defaultState, { type: ActionTypes.LOAD_CONNECT })

      expect(state).toEqual({ isComponentLoading: true })

      state = actionHandlers(state, { type: ActionTypes.LOAD_CONNECT_SUCCESS })

      expect(state).toEqual({ isComponentLoading: false })
    })
  })

  describe('combineDispatchers', () => {
    it('combines dispatchers', () => {
      const actionHandlers = combineDispatchers(dispatcherA, dispatcherB)(dispatch)

      expect(_keys(actionHandlers).sort()).toEqual(['create', 'delete', 'read', 'update'])

      actionHandlers.read()
      expect(dispatchCalled).toEqual(true)
    })

    it('throws if there would be duplicate keys when combined', () => {
      expect(() => {
        combineDispatchers(dispatcherA, dispatcherA)(dispatch)
      }).toThrowError('Duplicate action keys found: create,read')
    })
  })
})
