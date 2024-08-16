// import React from 'react'
// import { Store } from 'redux'
// import { render, screen, createTestReduxStore } from 'src/utilities/testingLibrary'

// import { ActionTypes as ClientActionTypes } from 'src/redux/actions/Client'
// import { loadProfiles } from 'src/redux/reducers/profilesSlice'
// import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'

// describe('ConnectLogoHeader', () => {
//   const clientGuid = 'CLT-123'
//   let store: Store

//   beforeEach(() => {
//     store = createTestReduxStore()
//     store.dispatch({ type: ClientActionTypes.INITIALIZED_CLIENT_CONFIG })
//     store.dispatch(
//       loadProfiles({
//         client: {
//           default_institution_guid: 'HOMEACCOUNT',
//           guid: clientGuid,
//           name: 'Client Name',
//         },
//         client_color_scheme: {
//           primary_100: '',
//           primary_200: '',
//           primary_300: '',
//           primary_400: '',
//           primary_500: '',
//           color_scheme: 'light',
//           widget_brand_color: '',
//         },
//         client_profile: {},
//         user: {},
//         user_profile: {},
//         widget_profile: {},
//       }),
//     )
//   })

//   it('renders a ClientLogo', () => {
//     render(<ConnectLogoHeader />, { store })
//     const img = screen.getByAltText('Client logo')
//     expect(img.getAttribute('src')).toEqual(
//       `https://content.moneydesktop.com/storage/MD_Client/oauth_logos/${clientGuid}.png`,
//     )
//   })

//   it('renders an InstitutionLogo if an institutionGuid was passed in props', () => {
//     const institutionGuid = 'INS-123'
//     render(<ConnectLogoHeader institutionGuid={institutionGuid} />, { store })

//     const img = screen.getByAltText('Institution logo')
//     expect(img.getAttribute('src')).toEqual(
//       `https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/${institutionGuid}_100x100.png`,
//     )
//   })

//   it('renders two SVGImage if an institutionGuid is not passed in props', () => {
//     render(<ConnectLogoHeader />, { store })
//     expect(screen.queryAllByTestId('svg-image').length).toBe(2)
//   })
// })
