// import React from 'react'
// import { screen, render, waitFor } from 'src/utilities/testingLibrary'

// import { DataAvailable } from 'src/views/disclosure/DataAvailable'
// import { dataClusters } from 'src/const/DataClusters'

// declare const global: {
//   app: { userFeatures: any }
// } & Window

// describe('DataAvailable', () => {
//   const defaultProps = { handleGoBack: jest.fn() }

//   it('renders component with 8 dataClusters', async () => {
//     let clusterCount = 0
//     render(<DataAvailable {...defaultProps} />)

//     Object.values(dataClusters).forEach((cluster) => {
//       const dataCluster = screen.getByText(cluster.name)

//       expect(dataCluster).toBeInTheDocument()
//       clusterCount++
//     })

//     expect(clusterCount).toBe(8)
//   })

//   it('go back button should render when feature enabled', async () => {
//     const { user } = render(<DataAvailable {...defaultProps} />)
//     const backButton = screen.getByTestId('back-button')

//     expect(backButton).toBeInTheDocument()

//     await user.click(backButton)

//     expect(defaultProps.handleGoBack).toHaveBeenCalled()
//   })

//   it('go back button should not render when feature disabled', async () => {
//     global.app.userFeatures = [
//       {
//         feature_guid: 'FTR-123',
//         feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
//         guid: 'URF-123',
//         user_guid: 'USR-123',
//         is_enabled: true,
//       },
//     ]

//     render(<DataAvailable {...defaultProps} />)

//     const backButton = screen.queryByTestId('back-button')

//     await waitFor(() => {
//       expect(backButton).not.toBeInTheDocument()
//     })
//   })
// })
