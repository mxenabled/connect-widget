// import { initializeClientConfig } from 'src/redux/actions/Client'

// import {
//   initializedClientConfig as initializedReducer,
//   defaultClientConfig,
// } from 'src/redux/reducers/Client'

// describe('Client related reducers', () => {
//   describe('Initialized client config reducer', () => {
//     it('should have a default empty state', () => {
//       expect(initializedReducer(undefined, {})).toEqual(defaultClientConfig)
//     })

//     it('should merge the playload of the action on state', () => {
//       const action = initializeClientConfig({
//         something: 'else',
//         connect: {
//           update_credentials: true,
//           enable_app2app: false,
//         },
//       })
//       const afterState = initializedReducer(defaultClientConfig, action)

//       expect(afterState.something).toEqual('else')
//       expect(afterState.connect.update_credentials).toBe(true)
//       expect(afterState.connect.disable_institution_search).toBe(false)
//       expect(afterState.connect.enable_app2app).toBe(false)
//     })

//     it('should move is_mobile_webview to the top if it is configured via connect', () => {
//       const action = initializeClientConfig({
//         connect: {
//           is_mobile_webview: true,
//           update_credentials: true,
//         },
//       })

//       const afterState = initializedReducer(defaultClientConfig, action)

//       expect(afterState.is_mobile_webview).toBe(true)
//       expect(afterState.connect.update_credentials).toBe(true)
//       expect(afterState.connect.is_mobile_webview).toBe(undefined)
//     })

//     it('should move is_mobile_webview to the top if it is configured via master', () => {
//       const action = initializeClientConfig({
//         master: {
//           is_mobile_webview: true,
//         },
//       })

//       const afterState = initializedReducer(defaultClientConfig, action)

//       expect(afterState.is_mobile_webview).toBe(true)
//       expect(afterState.master.is_mobile_webview).toBe(undefined)
//     })

//     it('should move ui message version stuff and color_scheme to the top', () => {
//       const action = initializeClientConfig({
//         connect: {
//           ui_message_protocol: 'webview',
//           ui_message_version: 4,
//           ui_message_webview_url_scheme: 'atrium',
//           color_scheme: 'light',
//         },
//       })

//       const afterState = initializedReducer(defaultClientConfig, action)

//       expect(afterState.ui_message_version).toBe(4)
//       expect(afterState.ui_message_protocol).toBe('webview')
//       expect(afterState.ui_message_webview_url_scheme).toBe('atrium')
//       expect(afterState.color_scheme).toBe('light')
//       expect(afterState.connect.ui_message_version).toBe(undefined)
//       expect(afterState.connect.ui_message_protocol).toBe(undefined)
//       expect(afterState.connect.ui_message_webview_url_scheme).toBe(undefined)
//       expect(afterState.connect.color_scheme).toBe(undefined)
//     })
//   })
// })
