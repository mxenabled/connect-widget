import { useEffect, ReactNode } from 'react'
import { useDispatch } from 'react-redux'

import { loadConnect } from 'src/redux/actions/Connect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useInitializedClientConfig = (clientConfig: any) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadConnect(clientConfig))
  }, [])
}

type InitializedClientConfigProps = {
  children: ReactNode
  clientConfig: object
}

export const InitializedClientConfigProvider = (props: InitializedClientConfigProps) => {
  useInitializedClientConfig(props.clientConfig)

  return props.children
}

export default useInitializedClientConfig
