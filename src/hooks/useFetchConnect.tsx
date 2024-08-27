import { useEffect, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'

const useConnectSuccess = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: ActionTypes.LOAD_CONNECT,
      payload: window.app.clientConfig,
    })
  }, [])
}

type connectProps = {
  children: ReactNode
}

export const ConnectProvider = (props: connectProps) => {
  useConnectSuccess()
  const connectConfig = useSelector(selectConnectConfig)
  if (!Object.keys(connectConfig).length) return null

  return props.children
}

export default useConnectSuccess
