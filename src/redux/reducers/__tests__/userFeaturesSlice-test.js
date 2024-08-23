import reducer, {
  loadUserFeatures,
  initialState,
  getUserFeatures,
  shouldShowConnectGlobalNavigationHeader,
} from 'src/redux/reducers/userFeaturesSlice'
import Store from 'src/redux/Store'
import { SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER } from 'src/const/UserFeatures'

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
    describe('shouldShowConnectGlobalNavigationHeader', () => {
      it('should return false if feature is not enabled', () => {
        expect(
          shouldShowConnectGlobalNavigationHeader({
            userFeatures: {
              items: [
                {
                  feature_name: SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER,
                  is_enabled: false,
                  guid: 'GUI-1234',
                },
              ],
            },
          }),
        ).toEqual(false)
      })

      it('should return true if feature is enabled', () => {
        expect(
          shouldShowConnectGlobalNavigationHeader({
            userFeatures: {
              items: [
                {
                  feature_name: SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER,
                  is_enabled: true,
                  guid: 'GUI-123',
                },
              ],
            },
          }),
        ).toEqual(true)
      })
    })
  })
})
