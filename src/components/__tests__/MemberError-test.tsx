import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { MemberError } from 'src/components/MemberError'

describe('MemberError View', () => {
  const defaultProps = {
    error: null,
    institution: {},
  }

  describe('message box messaging', () => {
    it('renders verification message if 403', () => {
      const newProps = { ...defaultProps, error: { response: { status: 403 } } }

      render(<MemberError {...newProps} />)

      const messageBoxText = screen.getByText('Verification must be enabled to use this feature.')
      expect(messageBoxText).toBeInTheDocument()
    })

    it('renders check credentials message if 409', () => {
      const newProps = { ...defaultProps, error: { response: { status: 409 } } }

      render(<MemberError {...newProps} />)

      const messageBoxText = screen.getByText(
        'Oops! There was a problem. Please check your username and password, and try again.',
      )
      expect(messageBoxText).toBeInTheDocument()
    })

    it('renders generic validation message if any error other than 403', () => {
      const newProps = { ...defaultProps, error: { response: { status: 422 } } }

      render(<MemberError {...newProps} />)

      const messageBoxText = screen.getByText('Please try again or come back later.')
      expect(messageBoxText).toBeInTheDocument()
    })
  })
})
