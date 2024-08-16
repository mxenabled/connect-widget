// import React from 'react'
// import { screen, render } from 'src/utilities/testingLibrary'

// import { waitFor } from '@testing-library/react'
// import { GeneralSupport } from 'src/components/support/GeneralSupport'

// declare const global: {
//   app: { userFeatures: any }
// } & Window
// const handleTicketSuccess = jest.fn()
// const handleClose = jest.fn()
// const GeneralSupportProps = {
//   handleClose,
//   handleTicketSuccess,
//   user: { details: {} },
// }

// describe('GeneralSupport', () => {
//   afterEach(() => {
//     handleTicketSuccess.mockReset()
//     handleClose.mockReset()
//   })

//   it('renders generalSupport ticket', async () => {
//     const ref = React.createRef()
//     const { user } = render(<GeneralSupport {...GeneralSupportProps} ref={ref} />)

//     await user.type(screen.getByLabelText('Your email address'), 'fake@fake.com')
//     await user.type(screen.getByLabelText('Brief description of the issue'), 'issues')
//     await user.type(screen.getByLabelText('Details of the issue'), 'lots of issues')
//     await user.click(screen.getByText('Continue'))
//     await waitFor(() => {
//       expect(handleTicketSuccess).toHaveBeenCalled()
//     })
//   })

//   it('renders generalSupport ticket and cancels', async () => {
//     const ref = React.createRef()
//     const { user } = render(<GeneralSupport {...GeneralSupportProps} ref={ref} />)
//     await user.click(screen.getByText('Cancel'))
//     await waitFor(() => {
//       expect(handleClose).toHaveBeenCalled()
//     })
//   })

//   it('renders its own back button when the global nav is off', async () => {
//     const ref = React.createRef()
//     const { user } = render(<GeneralSupport {...GeneralSupportProps} ref={ref} />)

//     await user.click(await screen.findByTestId('back-button'))
//     await waitFor(() => {
//       expect(handleClose).toHaveBeenCalled()
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
//     render(<GeneralSupport {...GeneralSupportProps} ref={ref} />)
//     await waitFor(() => {
//       expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
//     })
//   })
// })
