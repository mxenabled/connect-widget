/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import { loadProfiles } from 'src/redux/reducers/profilesSlice'
import { loadUserFeatures } from 'src/redux/reducers/userFeaturesSlice'

export const ConnectWidget = (props: any) => {
  const { profiles, userFeatures, ...rest } = props
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadProfiles(profiles))
    dispatch(loadUserFeatures(userFeatures))
  }, [profiles, userFeatures])

  return (
    <Provider store={Store}>
      <Connect {...rest} />
    </Provider>
  )
}

export default ConnectWidget
