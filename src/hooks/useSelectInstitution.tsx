import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { from, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { useApi } from 'src/context/ApiContext'
import { ActionTypes, selectInstitutionError } from 'src/redux/actions/Connect'
import { getUserFeatures } from 'src/redux/reducers/userFeaturesSlice'

const useSelectInstitution = () => {
  const { api } = useApi()
  const [institutionGuid, setInstitutionGuid] = useState('')
  const dispatch = useDispatch()
  const consentFeature = useSelector(getUserFeatures).find(
    (feature: { feature_name: string; is_enabled: boolean }) =>
      feature.feature_name === 'CONNECT_CONSENT',
  )

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
            payload: { institution, consentFlag: consentFeature?.is_enabled || false },
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
