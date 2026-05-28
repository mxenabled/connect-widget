import reducer, {
  loadUserFeatures,
  initialState,
  getUserFeatures,
  isConnectRuxEnabled,
} from 'src/redux/reducers/userFeaturesSlice'
import Store from 'src/redux/Store'

describe('UserFeatures slice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('should set the items to an array of user features', () => {
    const items = [{ foo: 'bar' }, { bar: 'foo' }]
    const stateBefore = { items: [] }
    const stateAfter = { items }

    expect(reducer(stateBefore, loadUserFeatures(items))).toEqual(stateAfter)
  })
  describe('UserFeatures Selectors', () => {
    let state

    beforeEach(() => {
      state = Store.getState()
    })
    describe('getUserFeatures selector', () => {
      it('should return all the user features', () => {
        expect(getUserFeatures(state)).toEqual(state.userFeatures.items)
      })
    })

    describe('isConnectRuxEnabled selector', () => {
      it('should return true if the CONNECT_RUX feature is enabled', () => {
        const userFeatures = [{ feature_name: 'CONNECT_RUX', is_enabled: true }]
        const mockState = {
          ...state,
          userFeatures: {
            items: userFeatures,
          },
        }
        expect(isConnectRuxEnabled(mockState)).toBe(true)
      })

      it('should return false if the CONNECT_RUX feature is not enabled', () => {
        const userFeatures = [{ feature_name: 'CONNECT_RUX', is_enabled: false }]
        const mockState = {
          ...state,
          userFeatures: {
            items: userFeatures,
          },
        }
        expect(isConnectRuxEnabled(mockState)).toBe(false)
      })
    })
  })
})
