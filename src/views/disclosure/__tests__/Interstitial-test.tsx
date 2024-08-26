/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { screen, render } from 'src/utilities/testingLibrary'
import { waitFor } from '@testing-library/react'

import { DisclosureInterstitial } from 'src/views/disclosure/Interstitial'
import { WaitForInstitution } from 'src/hooks/useFetchInstitution'

declare const global: {
  app: { userFeatures: any }
} & Window
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
      <WaitForInstitution>
        <DisclosureInterstitial {...interstitialProps} ref={ref} />
      </WaitForInstitution>,
    )

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
    const { user } = render(
      <WaitForInstitution>
        <DisclosureInterstitial {...interstitialProps} ref={ref} />
      </WaitForInstitution>,
    )

    await user.click(await screen.findByTestId('data-requested-button'))
    expect(await screen.findByText('Other available data')).toBeInTheDocument()
  })

  it('renders its own back button when the global nav is off', async () => {
    const ref = React.createRef()
    const { user } = render(
      <WaitForInstitution>
        <DisclosureInterstitial {...interstitialProps} ref={ref} />
      </WaitForInstitution>,
    )
    await user.click(await screen.findByTestId('back-button'))
    waitFor(() => {
      expect(handleGoBack).toHaveBeenCalled()
    })
  })
  it('does not render its own back button when global nav is on', async () => {
    global.app.userFeatures = [
      {
        feature_guid: 'FTR-123',
        feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
        guid: 'URF-123',
        user_guid: 'USR-123',
        is_enabled: true,
      },
    ]
    const ref = React.createRef()
    render(
      <WaitForInstitution>
        <DisclosureInterstitial {...interstitialProps} ref={ref} />
      </WaitForInstitution>,
    )
    await waitFor(() => {
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
    })
  })
})
