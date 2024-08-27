import { render, screen } from 'src/utilities/testingLibrary'
import React from 'react'

import { VerifyError } from 'src/views/verification/VerifyError'

describe('VerifyError Test', () => {
  const NOT_SUPPORTED_RESPONSE = { response: { status: 403 } }
  const DUPLICATE_RESPONSE = { response: { status: 409 } }
  const THROTTLE_RESPONSE = { response: { status: 422 } }
  const INTERNAL_SERVER_ERROR = { response: { status: 500 } }

  it('should support a button to go back', async () => {
    const onGoBack = vi.fn()
    const { user } = render(<VerifyError error={NOT_SUPPORTED_RESPONSE} onGoBack={onGoBack} />)

    expect(
      await screen.findByText("This connection doesn't support verification."),
    ).toBeInTheDocument()

    const backButton = screen.getByRole('button', { name: 'Go back' })
    expect(backButton).toBeVisible()

    await user.click(backButton)
    expect(onGoBack).toHaveBeenCalled()
  })

  it('should render a non supported message for 403 response', async () => {
    render(<VerifyError error={NOT_SUPPORTED_RESPONSE} onGoBack={() => {}} />)

    expect(
      await screen.findByText("This connection doesn't support verification."),
    ).toBeInTheDocument()
  })

  it('should render a cant verify now message for 409 response', async () => {
    render(<VerifyError error={DUPLICATE_RESPONSE} onGoBack={() => {}} />)

    expect(
      await screen.findByText("We can't verify this connection right now. Please try again later."),
    ).toBeInTheDocument()
  })

  it('should render a cant verify now message for 422 response', async () => {
    render(<VerifyError error={THROTTLE_RESPONSE} onGoBack={() => {}} />)

    expect(
      await screen.findByText("We can't verify this connection right now. Please try again later."),
    ).toBeInTheDocument()
  })

  it('should render a general response with error code 500 response', async () => {
    render(<VerifyError error={INTERNAL_SERVER_ERROR} onGoBack={() => {}} />)

    expect(
      await screen.findByText('Oops! Something went wrong. Error code: 500'),
    ).toBeInTheDocument()
  })
})
