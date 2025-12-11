import React from 'react'

import { screen, render } from 'src/utilities/testingLibrary'

import { DisclosureInterstitial } from 'src/views/disclosure/Interstitial'

const handleGoBack = vi.fn()
const scrollToTop = vi.fn()

const interstitialProps = {
  handleGoBack,
  scrollToTop,
}

describe('disclosure interstital', () => {
  it('loads the interstitial and makes sure that it is loaded then clicks privacy policy', async () => {
    const ref = React.createRef()
    const { user } = render(
      <div id="connect-wrapper">
        <DisclosureInterstitial {...interstitialProps} ref={ref} />
      </div>,
    )

    expect(await screen.findByTestId('interstitial-header')).toBeInTheDocument()
    expect(await screen.findByTestId('connect-in-seconds-body')).toBeInTheDocument()
    expect(await screen.findByTestId('private-secure-body')).toBeInTheDocument()
    expect(await screen.findByTestId('learn-more')).toBeInTheDocument()
    await user.click(await screen.findByTestId('privacy-policy-button'))
    expect(scrollToTop).toHaveBeenCalled()
    expect(await screen.findByTestId('leaving-notice-flat-header')).toBeInTheDocument()
  })

  it('loads the interstitial and clicks the Data Requested button', async () => {
    const ref = React.createRef()
    const { user } = render(
      <div id="connect-wrapper">
        <DisclosureInterstitial {...interstitialProps} ref={ref} />
      </div>,
    )

    await user.click(await screen.findByTestId('data-requested-button'))
    expect(await screen.findByText('Other available data')).toBeInTheDocument()
  })
})
