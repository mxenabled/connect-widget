import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { from, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { useApi } from 'src/context/ApiContext'
import { ActionTypes, selectInstitutionError } from 'src/redux/actions/Connect'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'
import { isConsentEnabled } from 'src/redux/reducers/userFeaturesSlice'
import { RootState } from 'src/redux/Store'

const useSelectInstitution = () => {
  const { api } = useApi()
  const [institutionGuid, setInstitutionGuid] = useState('')
  const dispatch = useDispatch()
  const consentIsEnabled = useSelector((state: RootState) => isConsentEnabled(state))
  const connectConfig = useSelector(selectConnectConfig)

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
            payload: {
              institution,
              consentFlag: consentIsEnabled || false,
              additionalProductOption: connectConfig?.additional_product_option || null,
            },
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
