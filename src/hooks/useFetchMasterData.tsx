import { useEffect, ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { loadProfiles } from 'src/redux/reducers/profilesSlice'

interface Profiles {
  client: object
  clientColorScheme: {
    primary_100: string
    primary_200: string
    primary_300: string
    primary_400: string
    primary_500: string
    color_scheme?: string
    widget_brand_color: string
  }
  clientProfile: object
  user: object
  userProfile: object
  widgetProfile: object
}

const useFetchMasterData = (profiles: Profiles) => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadProfiles(profiles))
  }, [])
}

type FetchMasterDataProps = {
  children: ReactNode
  profiles: Profiles
}
export const FetchMasterDataProvider = (props: FetchMasterDataProps) => {
  useFetchMasterData(props.profiles)

  return props.children
}

export default useFetchMasterData
