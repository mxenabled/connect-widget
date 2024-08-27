import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { loadUserFeatures } from 'src/redux/reducers/userFeaturesSlice'

const useFetchUserFeatures = (userFeatures: object) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadUserFeatures(userFeatures))
  }, [])
}

export const FetchUserFeaturesProvider: React.FC<{
  children: React.ReactElement
  userFeatures: object
}> = ({ children, userFeatures }) => {
  useFetchUserFeatures(userFeatures)

  return children
}

export default useFetchUserFeatures
