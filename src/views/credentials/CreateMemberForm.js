import React, { useEffect, useState, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { defer, of } from 'rxjs'
import { catchError, delay, map, mergeMap } from 'rxjs/operators'
import { useDispatch, useSelector } from 'react-redux'

import { useApi } from 'src/context/ApiContext'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConfig } from 'src/redux/reducers/configSlice'

import { Credentials } from 'src/views/credentials/Credentials'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { ReadableStatuses } from 'src/const/Statuses'

import { PostMessageContext } from 'src/ConnectWidget'
import { getSelectedInstitution } from 'src/redux/selectors/Connect'

/**
 * Responsibilities:
 * - Get the institution creds
 * - Render Credentials with the creds it received
 * - Performs the CREATE
 */
export const CreateMemberForm = (props) => {
  const institution = useSelector(getSelectedInstitution)
  useAnalyticsPath(...PageviewInfo.CONNECT_CREATE_CREDENTIALS, {
    institution_guid: institution.guid,
    institution_name: institution.name,
  })
  const config = useSelector(selectConfig)
  const isHuman = useSelector((state) => state.app.humanEvent)
  const currentMembers = useSelector((state) => state.connect.members)
  const clientLocale = useMemo(() => {
    return document.querySelector('html')?.getAttribute('lang') || 'en'
  }, [document.querySelector('html')?.getAttribute('lang')])

  const [isCreatingMember, setIsCreatingMember] = useState(false)
  const [memberCreateError, setMemberCreateError] = useState(null)
  const [userCredentials, setUserCredentials] = useState(null)
  const [state, setState] = useState({
    isLoading: true,
    credentials: [],
    error: null,
  })
  const postMessageFunctions = useContext(PostMessageContext)
  const { api } = useApi()
  const dispatch = useDispatch()

  useEffect(() => {
    const request$ = defer(() => api.getInstitutionCredentials(institution.guid)).subscribe(
      (credentials) =>
        setState({
          isLoading: false,
          credentials,
          error: null,
        }),
      (error) =>
        setState({
          isLoading: false,
          credentials: [],
          error,
        }),
    )

    return () => request$.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isCreatingMember) return () => {}
    postMessageFunctions.onPostMessage('connect/enterCredentials', {
      institution: { guid: institution.guid, code: institution.code },
    })

    const memberData = {
      institution_guid: institution.guid,
      credentials: userCredentials,
      rawInstitutionData: { ...institution },
    }

    const createMember$ = defer(() => api.addMember(memberData, config, isHuman))
      .pipe(
        // this delay is dumb, but if we don't wait long enough after the
        // create, then the job afterward is gonna 404.
        delay(400),
        map((response) => {
          if (props.onUpsertMember) {
            props.onUpsertMember(response.member)
          }
          return {
            type: ActionTypes.CREATE_MEMBER_SUCCESS,
            payload: { item: response.member },
          }
        }),
        catchError((err) => {
          if (err.response?.status === 409 && err.response?.data?.guid != null) {
            // Get the member guid and update it instead of something else
            // OR reload the widget with the member guid if the it's challenged.
            const memberGuid = err.response.data.guid
            const stepToMFA$ = (member) =>
              of(member).pipe(
                map(() => ({
                  type: ActionTypes.STEP_TO_MFA,
                  payload: member.guid,
                })),
              )
            const updateMember$ = defer(() => {
              const current409member = currentMembers.find((mbr) => mbr.guid === memberGuid)
              if (!current409member) {
                setIsCreatingMember(false)
                setMemberCreateError('Something went wrong, invalid member state')
                return new Error('Something went wrong, invalid member state')
              }

              const oldUseCases = current409member.use_cases || null
              return api.updateMember(
                { ...memberData, guid: memberGuid, use_cases: oldUseCases },
                config,
              )
            }).pipe(
              map((member) => {
                if (props.onUpsertMember) {
                  props.onUpsertMember(member)
                }

                return {
                  type: ActionTypes.UPDATE_MEMBER_SUCCESS,
                  payload: { item: member },
                }
              }),
            )
            return defer(() => api.loadMemberByGuid(memberGuid, clientLocale)).pipe(
              mergeMap((member) => {
                const shouldStepToMFA = member.connection_status === ReadableStatuses.CHALLENGED
                return shouldStepToMFA ? stepToMFA$(member) : updateMember$
              }),
            )
          }

          throw err
        }),
      )
      .subscribe(
        (action) => dispatch(action),
        (error) => {
          setIsCreatingMember(false)
          setMemberCreateError(error.response)
        },
      )

    return () => createMember$.unsubscribe()
  }, [isCreatingMember])

  if (state.isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Credentials
      credentials={state.credentials}
      error={memberCreateError}
      handleSubmitCredentials={(credentials) => {
        setUserCredentials(credentials)
        setIsCreatingMember(true)
      }}
      isProcessingMember={isCreatingMember}
      onGoBackClick={props.onGoBackClick}
      ref={props.navigationRef}
    />
  )
}

CreateMemberForm.propTypes = {
  navigationRef: PropTypes.func.isRequired,
  onGoBackClick: PropTypes.func.isRequired,
  onUpsertMember: PropTypes.func,
}
