import reducer, {
  loadUserFeatures,
  initialState,
  getUserFeatures,
} from 'reduxify/reducers/userFeaturesSlice'
import Store from 'reduxify/Store'

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
  })
})
