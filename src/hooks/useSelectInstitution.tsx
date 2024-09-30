import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { from, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import connectAPI from 'src/services/api'
import { selectInstitutionSuccess, selectInstitutionError } from 'src/redux/actions/Connect'

const useSelectInstitution = () => {
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

    const selectInstitution$ = from(connectAPI.loadInstitutionByGuid(institutionGuid))
      .pipe(
        map((institution) => {
          return selectInstitutionSuccess({ institution })
        }),
        catchError((err) => of(selectInstitutionError(err))),
      )
      .subscribe((action) => dispatch(action))

    return () => selectInstitution$.unsubscribe()
  }, [institutionGuid])

  return { handleSelectInstitution }
}

export default useSelectInstitution
