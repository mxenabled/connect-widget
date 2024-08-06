import { useEffect, ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { defer } from 'rxjs'

import { loadProfiles } from 'reduxify/reducers/profilesSlice'

import connectAPI from 'src/connect/services/api'

const useFetchMasterData = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Get client, client_color_scheme, client_profile, user, and user_profile. Adds widget_profile as well.
    const masterDataRequest$ = defer(() => connectAPI.loadMaster()).subscribe((response: any) => {
      dispatch(loadProfiles({ ...response, widget_profile: window.app.config }))
    })

    return () => masterDataRequest$.unsubscribe()
  }, [])
}

type FetchMasterDataProps = {
  children: ReactNode
}
export const FetchMasterDataProvider = (props: FetchMasterDataProps) => {
  useFetchMasterData()

  return props.children
}

export default useFetchMasterData
