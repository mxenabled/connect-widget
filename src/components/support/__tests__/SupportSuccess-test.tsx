// import React from 'react'
// import { screen, render } from 'src/utilities/testingLibrary'
// import { waitFor } from '@testing-library/react'

// import { SupportSuccess } from 'src/components/support/SupportSuccess'

// const handleCloseMock = jest.fn()
// const supportSuccessProps = {
//   email: 'first.last@mx.com',
//   handleClose: handleCloseMock,
// }

// describe('SupportSuccess', () => {
//   it('renders and closes when Continue is clicked', async () => {
//     const ref = React.createRef()
//     const { user } = render(<SupportSuccess {...supportSuccessProps} ref={ref} />)

//     expect(screen.getByText('Request received')).toBeInTheDocument()
//     await user.click(screen.getByText('Continue'))
//     await waitFor(() => {
//       expect(handleCloseMock).toHaveBeenCalled()
//     })
//   })
// })
