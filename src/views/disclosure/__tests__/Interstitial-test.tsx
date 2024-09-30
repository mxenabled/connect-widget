import React from 'react'

import { screen, render } from 'src/utilities/testingLibrary'
import { waitFor } from '@testing-library/react'

import { DisclosureInterstitial } from 'src/views/disclosure/Interstitial'
import { GLOBAL_NAVIGATION_FEATURE_ENABLED } from 'src/services/mockedData'

const handleGoBack = vi.fn()
const scrollToTop = vi.fn()

const interstitialProps = {
  handleGoBack,
  scrollToTop,
}

describe('disclosure interstital', () => {
  it('loads the interstitial and makes sure that it is loaded then clicks privacy policy', async () => {
    const ref = React.createRef()
    const { user } = render(<DisclosureInterstitial {...interstitialProps} ref={ref} />)

    expect(await screen.findByTestId('interstitial-header')).toBeInTheDocument()
    expect(await screen.findByTestId('connect-in-seconds-body')).toBeInTheDocument()
    expect(await screen.findByTestId('private-secure-body')).toBeInTheDocument()
    expect(await screen.findByTestId('learn-more')).toBeInTheDocument()
    await user.click(await screen.findByTestId('privacy-policy-button'))
    expect(scrollToTop).toHaveBeenCalled()
    expect(await screen.findByText('MX Privacy Statement')).toBeInTheDocument()
  })

  it('loads the interstitial and clicks the Data Requested button', async () => {
    const ref = React.createRef()
    const { user } = render(<DisclosureInterstitial {...interstitialProps} ref={ref} />)

    await user.click(await screen.findByTestId('data-requested-button'))
    expect(await screen.findByText('Other available data')).toBeInTheDocument()
  })

  it('renders its own back button when the global nav is off', async () => {
    const ref = React.createRef()
    const { user } = render(<DisclosureInterstitial {...interstitialProps} ref={ref} />)
    await user.click(await screen.findByTestId('back-button'))
    waitFor(() => {
      expect(handleGoBack).toHaveBeenCalled()
    })
  })
  it('does not render its own back button when global nav is on', async () => {
    const ref = React.createRef()
    render(<DisclosureInterstitial {...interstitialProps} ref={ref} />, {
      preloadedState: {
        userFeatures: {
          items: [GLOBAL_NAVIGATION_FEATURE_ENABLED],
        },
      },
    })
    await waitFor(() => {
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
    })
  })
})
