// import React from 'react'
// import { screen, render, waitFor } from 'src/utilities/testingLibrary'

// import { DataRequested } from 'src/views/disclosure/DataRequested'
// import {
//   aggDataCluster,
//   aggIdentityDataCluster,
//   verificationDataCluster,
//   verificationIdentityDataCluster,
// } from 'src/const/DataClusters'
// import { ConnectProvider } from 'src/hooks/useFetchConnect'
// import { VERIFY_MODE } from 'src/const/Connect'

// declare const global: {
//   app: { config: any; userFeatures: any }
// } & Window

// const handleGoBack = jest.fn()
// const setCurrentView = jest.fn()

// const dataRequestedProps = {
//   handleGoBack,
//   setCurrentView,
// }

// describe('DataRequested', () => {
//   it('is in agg mode and renders component with 4 data clusters', () => {
//     let clusterCount = 0
//     render(
//       <ConnectProvider>
//         <DataRequested {...dataRequestedProps} />
//       </ConnectProvider>,
//     )

//     aggDataCluster.forEach((cluster) => {
//       const dataCluster = screen.getByText(cluster.name)
//       expect(dataCluster).toBeInTheDocument()
//       clusterCount++
//     })
//     expect(clusterCount).toBe(4)
//   })

//   it('is in agg mode with identity, and renders component with 5 data clusters', async () => {
//     const newClientConfig = { ...global.app.clientConfig.connect }
//     newClientConfig['include_identity'] = true
//     global.app.clientConfig.connect = newClientConfig

//     let clusterCount = 0
//     render(
//       <ConnectProvider>
//         <DataRequested {...dataRequestedProps} />
//       </ConnectProvider>,
//     )

//     aggIdentityDataCluster.forEach((cluster) => {
//       const dataCluster = screen.getByText(cluster.name)
//       expect(dataCluster).toBeInTheDocument()
//       clusterCount++
//     })
//     expect(clusterCount).toBe(5)
//   })

//   it('is in verification mode and renders component with 1 data cluster', () => {
//     const newClientConfig = { ...global.app.clientConfig.connect }
//     newClientConfig['mode'] = VERIFY_MODE
//     newClientConfig['include_identity'] = false
//     global.app.clientConfig.connect = newClientConfig
//     let clusterCount = 0
//     render(
//       <ConnectProvider>
//         <DataRequested {...dataRequestedProps} />
//       </ConnectProvider>,
//     )

//     verificationDataCluster.forEach((cluster) => {
//       const dataCluster = screen.getByText(cluster.name)
//       expect(dataCluster).toBeInTheDocument()
//       clusterCount++
//     })
//     expect(clusterCount).toBe(1)
//   })

//   it('is in verification mode and renders component with 4 data clusters', () => {
//     const newClientConfig = { ...global.app.clientConfig.connect }
//     newClientConfig['mode'] = VERIFY_MODE
//     newClientConfig['include_identity'] = true
//     global.app.clientConfig.connect = newClientConfig
//     let clusterCount = 0
//     render(
//       <ConnectProvider>
//         <DataRequested {...dataRequestedProps} />
//       </ConnectProvider>,
//     )

//     verificationIdentityDataCluster.forEach((cluster) => {
//       const dataCluster = screen.getByText(cluster.name)
//       expect(dataCluster).toBeInTheDocument()
//       clusterCount++
//     })
//     expect(clusterCount).toBe(4)
//   })

//   it('go back button should render when feature is disabled', async () => {
//     const { user } = render(<DataRequested {...dataRequestedProps} />)
//     const backButton = screen.getByTestId('back-button')

//     expect(backButton).toBeInTheDocument()

//     await user.click(backButton)

//     expect(handleGoBack).toHaveBeenCalled()
//   })

//   it('go back button should not render when feature enabled', async () => {
//     global.app.userFeatures = [
//       {
//         feature_guid: 'FTR-123',
//         feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
//         guid: 'URF-123',
//         user_guid: 'USR-123',
//         is_enabled: true,
//       },
//     ]

//     render(<DataRequested {...dataRequestedProps} />)

//     const backButton = screen.queryByTestId('back-button')

//     await waitFor(() => {
//       expect(backButton).not.toBeInTheDocument()
//     })
//   })
// })
