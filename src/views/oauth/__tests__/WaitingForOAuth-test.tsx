// import React from 'react'
// import { render, screen, waitFor } from 'src/utilities/testingLibrary'
// import { WaitingForOAuth } from 'src/views/oauth/WaitingForOAuth'
// import { server } from 'src/services/testServer'
// import { ApiEndpoints } from 'src/services/FireflyDataSource'
// import { HttpResponse, http } from 'msw'
// import { OAUTH_STATE } from 'src/services/mockedData'
// import { __ } from 'src/utilities/Intl'

// describe('WaitingForOAuth view', () => {
//   describe('Button delay for try again and cancel', () => {
//     const defaultProps = {
//       institution: { guid: 'INS-123', name: 'MX Bank' },
//       member: { guid: 'MBR-123' },
//       onOAuthError: jest.fn(),
//       onOAuthRetry: jest.fn(),
//       onOAuthSuccess: jest.fn(),
//       onReturnToSearch: jest.fn(),
//     }

//     it('should disable the buttons when the component loads', () => {
//       render(<WaitingForOAuth {...defaultProps} />)
//       const tryAgainButton = screen.getByRole('button', { name: 'Try again' })
//       const cancelButton = screen.getByRole('button', { name: 'Cancel' })
//       expect(
//         screen.getByText(
//           __(
//             'You should have been directed to %1 to sign in and connect your account.',
//             defaultProps.institution.name,
//           ),
//         ),
//       ).toBeInTheDocument()
//       expect(tryAgainButton).toHaveClass('kyper-button-disabled')
//       expect(cancelButton).toHaveClass('kyper-button-disabled')
//     })

//     it('should enable the tryAgain button after 2 seconds and call onOAuthRetry when clicked ', async () => {
//       const { user } = render(<WaitingForOAuth {...defaultProps} />)
//       const tryAgainButton = await screen.findByRole('button', { name: 'Try again' })
//       await waitFor(
//         async () => {
//           expect(tryAgainButton).not.toHaveClass('kyper-button-disabled')
//           await user.click(tryAgainButton)
//           expect(defaultProps.onOAuthRetry).toHaveBeenCalledTimes(1)
//         },
//         { timeout: 2500 },
//       )
//     })

//     it('should enable the cancel button after 2 seconds and call onReturnToSearch when clicked ', async () => {
//       const { user } = render(<WaitingForOAuth {...defaultProps} />)
//       const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
//       await waitFor(
//         async () => {
//           expect(cancelButton).not.toHaveClass('kyper-button-disabled')
//           await user.click(cancelButton)
//           expect(defaultProps.onReturnToSearch).toHaveBeenCalledTimes(1)
//         },
//         { timeout: 2500 },
//       )
//     })

//     it('should call onOAuthSuccess if polling an oauth state was successful', async () => {
//       render(<WaitingForOAuth {...defaultProps} />)
//       await waitFor(
//         async () => {
//           expect(defaultProps.onOAuthSuccess).toHaveBeenCalledTimes(1)
//         },
//         { timeout: 3000 },
//       )
//     })

//     it('should call onOAuthError if polling an oauth state was unsuccessful', async () => {
//       server.use(
//         http.get(`${ApiEndpoints.OAUTH_STATES}/:id`, () => {
//           return HttpResponse.json({
//             oauth_state: {
//               ...OAUTH_STATE.oauth_state,
//               auth_status: 3,
//               error_reason: 2,
//             },
//           })
//         }),
//       )
//       render(<WaitingForOAuth {...defaultProps} />)
//       await waitFor(
//         async () => {
//           expect(defaultProps.onOAuthError).toHaveBeenCalledTimes(1)
//         },
//         { timeout: 3000 },
//       )
//     })
//   })
// })
