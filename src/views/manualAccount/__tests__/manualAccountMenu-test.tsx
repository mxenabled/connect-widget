// import React from 'react'

// import { screen, render, waitFor } from 'src/utilities/testingLibrary'

// import { ManualAccountMenu } from 'src/views/manualAccount/ManualAccountMenu'

// declare const global: {
//   app: { userFeatures: any }
// } & Window
// const handleGoBack = jest.fn()
// const handleAccountTypeSelect = jest.fn()

// const accountMenuProps = {
//   handleGoBack,
//   handleAccountTypeSelect,
//   availableAccountTypes: [],
// }

// describe('manualAccountMenu', () => {
//   it('renders manual account menu and clicks on a checking account', async () => {
//     const ref = React.createRef()

//     const { user } = render(<ManualAccountMenu {...accountMenuProps} ref={ref} />)

//     await user.click(await screen.findByRole('button', { name: 'Checking' }))
//     expect(handleAccountTypeSelect).toHaveBeenCalled()
//   })

//   it('renders its own back button when global nav is off', async () => {
//     const ref = React.createRef()
//     const { user } = render(<ManualAccountMenu {...accountMenuProps} ref={ref} />)

//     await user.click(await screen.findByTestId('back-button'))
//     await waitFor(() => {
//       expect(handleGoBack).toHaveBeenCalled()
//     })
//   })

//   it('does not render its own back button when global nav is on', async () => {
//     global.app.userFeatures = [
//       {
//         feature_guid: 'FTR-123',
//         feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
//         guid: 'URF-123',
//         user_guid: 'USR-123',
//         is_enabled: true,
//       },
//     ]
//     const ref = React.createRef()
//     render(<ManualAccountMenu {...accountMenuProps} ref={ref} />)
//     await waitFor(() => {
//       expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
//     })
//   })
// })
