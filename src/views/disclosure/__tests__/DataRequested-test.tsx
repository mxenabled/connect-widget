import React from 'react'
import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { DataRequested } from 'src/views/disclosure/DataRequested'
import {
  aggDataCluster,
  aggIdentityDataCluster,
  verificationDataCluster,
  verificationIdentityDataCluster,
} from 'src/const/DataClusters'
import { VERIFY_MODE } from 'src/const/Connect'
import { GLOBAL_NAVIGATION_FEATURE_ENABLED } from 'src/services/mockedData'

const handleGoBack = vi.fn()
const setCurrentView = vi.fn()

const dataRequestedProps = {
  handleGoBack,
  setCurrentView,
}

describe('DataRequested', () => {
  it('is in agg mode and renders component with 4 data clusters', () => {
    let clusterCount = 0
    render(<DataRequested {...dataRequestedProps} />)

    aggDataCluster.forEach((cluster) => {
      const dataCluster = screen.getByText(cluster.name)
      expect(dataCluster).toBeInTheDocument()
      clusterCount++
    })
    expect(clusterCount).toBe(4)
  })

  it('is in agg mode with identity, and renders component with 5 data clusters', async () => {
    let clusterCount = 0
    render(<DataRequested {...dataRequestedProps} />, {
      preloadedState: {
        config: {
          connectConfig: {
            include_identity: true,
          },
          appConfig: {},
        },
      },
    })

    aggIdentityDataCluster.forEach((cluster) => {
      const dataCluster = screen.getByText(cluster.name)
      expect(dataCluster).toBeInTheDocument()
      clusterCount++
    })
    expect(clusterCount).toBe(5)
  })

  it('is in verification mode and renders component with 1 data cluster', () => {
    let clusterCount = 0
    render(<DataRequested {...dataRequestedProps} />, {
      preloadedState: {
        config: {
          connectConfig: {
            mode: VERIFY_MODE,
            include_identity: false,
          },
          appConfig: {},
        },
      },
    })

    verificationDataCluster.forEach((cluster) => {
      const dataCluster = screen.getByText(cluster.name)
      expect(dataCluster).toBeInTheDocument()
      clusterCount++
    })
    expect(clusterCount).toBe(1)
  })

  it('is in verification mode and renders component with 4 data clusters', () => {
    let clusterCount = 0
    render(<DataRequested {...dataRequestedProps} />, {
      preloadedState: {
        config: {
          connectConfig: {
            mode: VERIFY_MODE,
            include_identity: true,
          },
          appConfig: {},
        },
      },
    })

    verificationIdentityDataCluster.forEach((cluster) => {
      const dataCluster = screen.getByText(cluster.name)
      expect(dataCluster).toBeInTheDocument()
      clusterCount++
    })
    expect(clusterCount).toBe(4)
  })

  it('go back button should render when feature is disabled', async () => {
    const { user } = render(<DataRequested {...dataRequestedProps} />)
    const backButton = screen.getByTestId('back-button')

    expect(backButton).toBeInTheDocument()

    await user.click(backButton)

    expect(handleGoBack).toHaveBeenCalled()
  })

  it('go back button should not render when feature enabled', async () => {
    render(<DataRequested {...dataRequestedProps} />, {
      preloadedState: {
        userFeatures: {
          items: [GLOBAL_NAVIGATION_FEATURE_ENABLED],
        },
      },
    })

    const backButton = screen.queryByTestId('back-button')

    await waitFor(() => {
      expect(backButton).not.toBeInTheDocument()
    })
  })
})
