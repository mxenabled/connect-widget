// jest.mock('src/redux/Store')

// import { SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER } from 'src/const/UserFeatures'

// import {
//   getUserFeatures,
//   shouldShowConnectGlobalNavigationHeader,
// } from 'src/redux/selectors/UserFeatures'

// import Store from 'src/redux/Store'

// describe('UserFeatures Selectors', () => {
//   let state

//   beforeEach(() => {
//     state = Store.getState()
//   })

//   describe('getUserFeatures', () => {
//     it('should return all the user features', () => {
//       expect(getUserFeatures(state)).toEqual(state.userFeatures.items)
//     })
//   })

//   describe('shouldShowConnectGlobalNavigationHeader', () => {
//     it('should return false if feature is not enabled', () => {
//       const UpdatedStore = Store.__withUpdatedState({
//         userFeatures: {
//           items: [
//             {
//               feature_name: SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER,
//               is_enabled: false,
//               guid: 'GUI-1234',
//             },
//           ],
//         },
//       })

//       state = UpdatedStore.getState()

//       expect(shouldShowConnectGlobalNavigationHeader(state)).toEqual(false)
//     })

//     it('should return true if feature is enabled', () => {
//       const UpdatedStore = Store.__withUpdatedState({
//         userFeatures: {
//           items: [
//             {
//               feature_name: SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER,
//               is_enabled: true,
//               guid: 'GUI-123',
//             },
//           ],
//         },
//       })

//       state = UpdatedStore.getState()

//       expect(shouldShowConnectGlobalNavigationHeader(state)).toEqual(true)
//     })
//   })
// })
