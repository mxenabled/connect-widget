// jest.mock('src/redux/Store')
// import { getTokenProviderValues } from 'src/redux/selectors/ClientColorScheme'
// import Store from 'src/redux/Store'

// describe('ClientcolorScheme Selectors', () => {
//   let state = {}
//   let updatedState = {}

//   describe('getTokenProviderValues', () => {
//     beforeEach(() => {
//       updatedState = {
//         profiles: {
//           clientColorScheme: {
//             color_scheme: 'light',
//             widget_brand_color: '#bada55',
//           },
//         },
//       }
//       state = Store.__withUpdatedState(updatedState).getState()
//     })

//     it('should return the theme primary color if there is no client color scheme', () => {
//       const res = getTokenProviderValues(state)

//       expect(res.tokenOverrides.Color.Brand300).toEqual(
//         updatedState.profiles.clientColorScheme.widget_brand_color,
//       )
//     })

//     it('should have five different colors based on widget_brand_color', () => {
//       const res = getTokenProviderValues(state)
//       const colors = [
//         res.tokenOverrides.Color.Brand100,
//         res.tokenOverrides.Color.Brand200,
//         res.tokenOverrides.Color.Brand300,
//         res.tokenOverrides.Color.Brand400,
//         res.tokenOverrides.Color.Brand500,
//       ]
//       const distinctColors = [...new Set(colors)]

//       expect(distinctColors).toHaveLength(5)
//     })

//     it('should use the client color scheme if it exist', () => {
//       state = Store.__withUpdatedState({
//         profiles: {
//           clientColorScheme: {
//             primary_100: '100',
//             primary_200: '200',
//             primary_300: '300',
//             primary_400: '400',
//             primary_500: '500',
//           },
//         },
//       }).getState()

//       const res = getTokenProviderValues(state)

//       expect(res.tokenOverrides.Color.Brand100).toEqual(
//         state.profiles.clientColorScheme.primary_100,
//       )
//       expect(res.tokenOverrides.Color.Brand200).toEqual(
//         state.profiles.clientColorScheme.primary_200,
//       )
//       expect(res.tokenOverrides.Color.Brand300).toEqual(
//         state.profiles.clientColorScheme.primary_300,
//       )
//       expect(res.tokenOverrides.Color.Brand400).toEqual(
//         state.profiles.clientColorScheme.primary_400,
//       )
//       expect(res.tokenOverrides.Color.Brand500).toEqual(
//         state.profiles.clientColorScheme.primary_500,
//       )
//     })
//   })
// })
