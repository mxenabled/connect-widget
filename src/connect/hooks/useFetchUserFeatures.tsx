import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { loadUserFeatures } from 'reduxify/reducers/userFeaturesSlice'
import { isRunningE2ETests } from 'src/connect/utilities/e2e'
import { GLOBAL_NAVIGATION_FEATURE } from 'src/connect/services/mockedData'
declare global {
  interface Window {
    addGlobalNavigationFeature: boolean
  }
}

const useFetchUserFeatures = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    let userFeatures = window.app.userFeatures

    if (isRunningE2ETests() && window.addGlobalNavigationFeature) {
      userFeatures = [...userFeatures, GLOBAL_NAVIGATION_FEATURE]
    }
    dispatch(loadUserFeatures(userFeatures))
  }, [])
}

export const FetchUserFeaturesProvider: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  useFetchUserFeatures()

  return children
}

export default useFetchUserFeatures
