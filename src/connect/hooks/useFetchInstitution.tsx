import { useEffect, ReactNode } from 'react'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'

import { selectInstitution } from 'reduxify/actions/Connect'

const useFetchInstitution = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(selectInstitution('INS-123'))
  }, [])
}

type FetchInstitutionProps = {
  children: ReactNode
}
export const FetchInstitutionProvider = (props: FetchInstitutionProps) => {
  useFetchInstitution()

  return props.children
}

export const WaitForInstitution = ({ children }: any) => {
  useFetchInstitution()
  const institution = useSelector((state: RootStateOrAny) => state.connect.selectedInstitution)

  if (!Object.keys(institution).length) return null

  return children
}

export default useFetchInstitution
