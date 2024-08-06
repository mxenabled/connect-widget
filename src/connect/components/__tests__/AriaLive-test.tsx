import React from 'react'
import { render, screen } from 'src/connect/utilities/testingLibrary'

import { AriaLive } from 'src/connect/components/AriaLive'

describe('AriaLive', () => {
  it('should contain no message if the message prop is not provided', async () => {
    render(<AriaLive level="polite" message="" />)
    const messageText = await screen.queryByText('foo bar')
    expect(messageText).not.toBeInTheDocument()
  })
  it('should contain the message if the message prop is provided', async () => {
    render(<AriaLive level="polite" message="foo bar" />)
    const messageText = await screen.findByText('foo bar')
    expect(messageText).toBeInTheDocument()
  })
})
