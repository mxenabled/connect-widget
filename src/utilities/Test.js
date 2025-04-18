import _isFunction from 'lodash/isFunction'
import { TestScheduler } from 'rxjs/testing'

/**
 * Adapter to bridge Jest and Rx test utils
 *
 * The TestScheduler in Rx has an `expectObservable().toBe()` interface that is
 * intended to be a testing-library-agnostic interface to whatever testing
 * library you're using. The `toBe` name is unfortunate because it means
 * something specific in some testing libraries like Jest which is confusing.
 *
 * The expectRx methods below map that `expectObservable.toBe()` method to
 * various Jest expect methods that we may be interested in calling.
 *
 * For example, `expectRx.toMatchObject()` causes the enclosed
 * `expectObservable().toBe()` to call Jest's `expect().toMatchObject()`
 * method.
 *
 * Usage:
 *  expectRx.toMatchObject.run(yourTestSchedulerRunCallbackHere)
 *  expectRx.toBe.run(yourTestSchedulerRunCallbackHere)
 */
const wrapScheduler = (compFn) => (cb) => {
  const scheduler = new TestScheduler(compFn)

  return scheduler.run(({ ...params }) => cb({ scheduler, ...params }))
}

export const expectRx = {
  toBe: { run: wrapScheduler((a, b) => expect(a).toBe(b)) },
  toEqual: { run: wrapScheduler((a, b) => expect(a).toEqual(b)) },
  toMatchObject: { run: wrapScheduler((a, b) => expect(a).toMatchObject(b)) },
}

/**
 * Usage example:
 *   const { createReduxActionUtils, resetSpyObj } = require('src/utilities/Test/');
 *   const { itemAction } = require('src/utilities/ActionHelpers');
 *   const FireflyAPIMock = jest.fn();
 *   const FooActions = require('inject!src/redux/actions/foo');
 *   const dispatcher = FooActions({
 *     'src/utilities/FireflyAPI': FireflyAPIMock
 *   });
 *   const { actions, expectDispatch, resetDispatch } = createReduxActionUtils(dispatcher);
 *
 *   describe('Reduxy Actions', () => {
 *     let actions;
 *     beforeEach(() => {
 *       resetDispatch();
 *       resetSpyObj(FireflyAPIMock);
 *     });
 *     it('tests async stuff', done => {
 *       actions.myAction().then(() => {
 *         expectDispatch(itemAction(DID_SOME_STUFF, true));
 *         done();
 *       });
 *     });
 *   });
 */

export const createReduxActionUtils = (dispatcher, state = {}) => {
  const getState = vi.fn().mockReturnValue(state)
  const dispatch = vi.fn((arg) => (_isFunction(arg) ? arg(dispatch, getState) : arg))
  const actions = dispatcher(dispatch)

  /* filter out the initial dispatch call that receives the action function
   * e.g.
   *   const dispatcher = dispatch => ({
   *     updateRetirementGoal: goal => dispatch(fetchUpdateRetirementGoal(goal))
   *   });
   */
  const allCallArgs = () => dispatch.mock.calls.filter((c) => !_isFunction(c[0]))

  return {
    actions,

    expectDispatch: (action) => {
      expect(allCallArgs()).toEqual(expect.arrayContaining([[action]]))
    },

    expectNoDispatch: (action) => {
      expect(allCallArgs()).not.toEqual(expect.arrayContaining([[action]]))
    },

    resetDispatch: () => {
      // dispatch.mockClear() this is not working as expected
      vi.clearAllMocks()
    },
  }
}
