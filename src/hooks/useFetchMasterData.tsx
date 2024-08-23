import { useEffect, ReactNode, useState } from 'react'
import { useDispatch } from 'react-redux'
import { defer } from 'rxjs'

import { loadProfiles } from 'src/redux/reducers/profilesSlice'

import connectAPI from 'src/services/api'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    app: any
  }
}

const useFetchMasterData = () => {
  const dispatch = useDispatch()
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get client, client_color_scheme, client_profile, user, and user_profile. Adds widget_profile as well.
    const masterDataRequest$ = defer(() => connectAPI.loadMaster()).subscribe((response: any) => {
      if (response.isAxiosError) {
        // Set error for hook to return. Consumer of hook will throw error for GlobalErrorBoundry
        setError(response)
      } else {
        setError(null)
        dispatch(loadProfiles({ ...response, widget_profile: window.app.config }))
      }
    })

    return () => masterDataRequest$.unsubscribe()
  }, [])

  return { fetchMasterDataError: error }
}

type FetchMasterDataProps = {
  children: ReactNode
}
export const FetchMasterDataProvider = (props: FetchMasterDataProps) => {
  useFetchMasterData()

  return props.children
}

export default useFetchMasterData
