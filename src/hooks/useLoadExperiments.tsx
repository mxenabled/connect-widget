import { useEffect, ReactNode } from 'react'
import { useDispatch } from 'react-redux'

import { ActionTypes } from 'src/redux/actions/Experiments'

const useLoadExperiments = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({
      type: ActionTypes.LOAD_EXPERIMENTS,
      payload: window.app.experiments,
    })
  }, [])
}

type LoadExperimentsProps = {
  children: ReactNode
}
export const LoadExperimentsProvider = (props: LoadExperimentsProps) => {
  useLoadExperiments()

  return props.children
}

export default useLoadExperiments
