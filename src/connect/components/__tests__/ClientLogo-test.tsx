import React from 'react'
import { render, screen, fireEvent } from 'src/connect/utilities/testingLibrary'
import { ClientLogo } from 'src/connect/components/ClientLogo'
import ConnectHeaderRecipientDark from 'src/connect/images/header/ConnectHeaderRecipientDark.png'

describe('ClientLogo', () => {
  const defaultProps = {
    alt: 'Client logo',
    size: 32,
    style: {},
    className: '',
    clientGuid: 'CLT-123',
  }

  it('should render an image with default props', () => {
    render(<ClientLogo {...defaultProps} />)

    const image = screen.getByAltText('Client logo')

    expect(image).toHaveAttribute(
      'src',
      `https://content.moneydesktop.com/storage/MD_Client/oauth_logos/${defaultProps.clientGuid}.png`,
    )
  })

  it('should render backup image if there is an error', () => {
    render(<ClientLogo {...defaultProps} />)

    const image = screen.getByAltText('Client logo')
    fireEvent.error(image)

    expect(image).toHaveAttribute('src', ConnectHeaderRecipientDark)
  })
})
