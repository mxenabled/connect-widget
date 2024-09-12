import React from 'react'
import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { DataAvailable } from 'src/views/disclosure/DataAvailable'
import { GLOBAL_NAVIGATION_FEATURE_ENABLED } from 'src/services/mockedData'

import { getDataClusters } from 'src/const/DataClusters'

describe('DataAvailable', () => {
  const { dataClusters } = getDataClusters()
  const defaultProps = { handleGoBack: vi.fn() }

  it('renders component with 8 dataClusters', async () => {
    let clusterCount = 0
    render(<DataAvailable {...defaultProps} />)

    Object.values(dataClusters).forEach((cluster) => {
      const dataCluster = screen.getByText(cluster.name)

      expect(dataCluster).toBeInTheDocument()
      clusterCount++
    })

    expect(clusterCount).toBe(8)
  })

  it('go back button should render when feature enabled', async () => {
    const { user } = render(<DataAvailable {...defaultProps} />)
    const backButton = screen.getByTestId('back-button')

    expect(backButton).toBeInTheDocument()

    await user.click(backButton)

    expect(defaultProps.handleGoBack).toHaveBeenCalled()
  })

  it('go back button should not render when feature disabled', async () => {
    render(<DataAvailable {...defaultProps} />, {
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
