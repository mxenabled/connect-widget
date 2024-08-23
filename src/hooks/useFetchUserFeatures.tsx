import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { loadUserFeatures } from 'src/redux/reducers/userFeaturesSlice'
import { isRunningE2ETests } from 'src/utilities/e2e'
import { GLOBAL_NAVIGATION_FEATURE } from 'src/services/mockedData'
declare global {
  // eslint-disable-next-line no-unused-vars
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
