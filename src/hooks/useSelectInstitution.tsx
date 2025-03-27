import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { from, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { useApi } from 'src/context/ApiContext'
import { ActionTypes, selectInstitutionError } from 'src/redux/actions/Connect'

const useSelectInstitution = () => {
  const { api } = useApi()
  const [institutionGuid, setInstitutionGuid] = useState('')
  const dispatch = useDispatch()

  const handleSelectInstitution = useCallback(
    (institutionGuid: string) => {
      setInstitutionGuid(institutionGuid)
    },
    [institutionGuid],
  )

  useEffect(() => {
    if (!institutionGuid) return () => {}

    const selectInstitution$ = from(api.loadInstitutionByGuid(institutionGuid))
      .pipe(
        map((institution) => {
          return dispatch({
            type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
            payload: { institution, consentFlag: true },
          })
        }),
        catchError((err) => {
          setInstitutionGuid('')
          return of(selectInstitutionError(err))
        }),
      )
      .subscribe((action) => {
        setInstitutionGuid('')
        dispatch(action)
      })

    return () => selectInstitution$.unsubscribe()
  }, [institutionGuid])

  return { handleSelectInstitution }
}

export default useSelectInstitution
