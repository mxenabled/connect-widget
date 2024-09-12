import { useEffect, useRef } from 'react'

function usePreviousProps<T>(props: T): T {
  const prevPropsRef = useRef(props)
  useEffect(() => {
    prevPropsRef.current = props
  }, [])
  return prevPropsRef.current
}

export default usePreviousProps
