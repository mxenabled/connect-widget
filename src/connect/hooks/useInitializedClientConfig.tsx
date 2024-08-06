import { useEffect, ReactNode } from 'react'
import { useDispatch } from 'react-redux'

import { ActionTypes } from 'reduxify/actions/Client'

const useInitializedClientConfig = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: ActionTypes.INITIALIZED_CLIENT_CONFIG,
      payload: window.app.clientConfig,
    })
  }, [])
}

type InitializedClientConfigProps = {
  children: ReactNode
}

export const InitializedClientConfigProvider = (props: InitializedClientConfigProps) => {
  useInitializedClientConfig()

  return props.children
}

export default useInitializedClientConfig
