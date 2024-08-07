import React from 'react'
import Honeybadger from 'honeybadger-js'
import { render, screen, waitForElementToBeRemoved } from 'src/connect/utilities/testingLibrary'

import { AppWrapper } from 'src/components/app/AppWrapper'

declare const global: {
  app: { options: any; experiments: any }
} & Window

jest.mock('honeybadger-js')

global.app = {
  options: { type: 'connect' },
  experiments: [],
  config: {
    widgetProfile: {},
  },
}

describe('AppWrapper', () => {
  it('should render child component after loading', async () => {
    render(
      <AppWrapper>
        <FakeComponent />
      </AppWrapper>,
    )

    await waitForElementToBeRemoved(() => screen.getByText('Loading ...'))
    expect(screen.getByText('Fake Component')).toBeInTheDocument()
  })

  it('should set the initial context for honeybadger', async () => {
    render(
      <AppWrapper>
        <FakeComponent />
      </AppWrapper>,
    )
    await waitForElementToBeRemoved(() => screen.getByText('Loading ...'))
    expect(Honeybadger.setContext).toHaveBeenCalledWith({ widget: window.app.options.type })
  })
})

const FakeComponent = () => {
  return <div>Fake Component</div>
}
