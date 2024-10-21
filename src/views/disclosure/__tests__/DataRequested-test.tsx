import React from 'react'
import { screen, render } from 'src/utilities/testingLibrary'

import { DataRequested } from 'src/views/disclosure/DataRequested'
import { getDataClusters } from 'src/const/DataClusters'
import { VERIFY_MODE } from 'src/const/Connect'

const setCurrentView = jest.fn()

const dataRequestedProps = {
  setCurrentView,
}

describe('DataRequested', () => {
  const {
    aggDataCluster,
    aggIdentityDataCluster,
    verificationDataCluster,
    verificationIdentityDataCluster,
  } = getDataClusters()

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
          ...initialState.config,
          include_identity: true,
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
          ...initialState.config,
          mode: VERIFY_MODE,
          include_identity: false,
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
          ...initialState.config,
          mode: VERIFY_MODE,
          include_identity: true,
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
})
