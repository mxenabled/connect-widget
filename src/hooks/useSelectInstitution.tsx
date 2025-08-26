import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { from, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { useApi } from 'src/context/ApiContext'
import { ActionTypes, selectInstitutionError } from 'src/redux/actions/Connect'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'
import { isConsentEnabled } from 'src/redux/reducers/userFeaturesSlice'
import { RootState } from 'src/redux/Store'
import { institutionIsBlockedForCostReasons } from 'src/utilities/institutionBlocks'

const useSelectInstitution = () => {
  const { api } = useApi()
  const [institution, setInstitution] = useState<InstitutionResponseType | null>(null)
  const dispatch = useDispatch()
  const consentIsEnabled = useSelector((state: RootState) => isConsentEnabled(state))
  const connectConfig = useSelector(selectConnectConfig)

  const handleSelectInstitution = useCallback(
    (institution: InstitutionResponseType) => {
      setInstitution(institution)
    },
    [institution],
  )

  useEffect(() => {
    if (!institution) return () => {}

    const selectInstitution$ = from(api.loadInstitutionByGuid(institution.guid))
      .pipe(
        map((insWithCreds) => {
          return dispatch({
            type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
            payload: {
              institution: {
                ...insWithCreds,
                is_disabled_by_client: institutionIsBlockedForCostReasons(institution), // Temporary workaround till backend/core is fixed
              },
              consentIsEnabled: consentIsEnabled || false,
              additionalProductOption: connectConfig?.additional_product_option || null,
            },
          })
        }),
        catchError((err) => {
          setInstitution(null)
          return of(selectInstitutionError(err))
        }),
      )
      .subscribe((action) => {
        setInstitution(null)
        dispatch(action)
      })

    return () => selectInstitution$.unsubscribe()
  }, [institution])

  return { handleSelectInstitution }
}

export default useSelectInstitution
