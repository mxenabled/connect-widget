import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { defer, of } from 'rxjs'
import { catchError, delay, map, mergeMap } from 'rxjs/operators'
import { useDispatch, useSelector } from 'react-redux'

import connectAPI from 'src/services/api'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { ActionTypes as PostMessageActionTypes } from 'src/redux/actions/PostMessage'
import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConnectConfig, selectAppConfig } from 'src/redux/reducers/configSlice'

import { Credentials } from 'src/views/credentials/Credentials'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { ReadableStatuses } from 'src/const/Statuses'

/**
 * Responsibilities:
 * - Get the institution creds
 * - Render Credentials with the creds it received
 * - Performs the CREATE
 */
export const CreateMemberForm = (props) => {
  const institution = useSelector((state) => state.connect.selectedInstitution)
  useAnalyticsPath(...PageviewInfo.CONNECT_CREATE_CREDENTIALS, {
    institution_guid: institution.guid,
    institution_name: institution.name,
  })
  const connectConfig = useSelector(selectConnectConfig)
  const appConfig = useSelector(selectAppConfig)
  const isHuman = useSelector((state) => state.app.humanEvent)

  const [isCreatingMember, setIsCreatingMember] = useState(false)
  const [memberCreateError, setMemberCreateError] = useState(null)
  const [userCredentials, setUserCredentials] = useState(null)
  const [state, setState] = useState({
    isLoading: true,
    credentials: [],
    error: null,
  })
  const dispatch = useDispatch()

  useEffect(() => {
    const request$ = defer(() => connectAPI.getInstitutionCredentials(institution.guid)).subscribe(
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

    dispatch({
      type: PostMessageActionTypes.SEND_POST_MESSAGE,
      payload: {
        event: 'connect/enterCredentials',
        data: {
          institution: {
            guid: institution.guid,
            code: institution.code,
          },
        },
      },
    })

    const memberData = { institution_guid: institution.guid, credentials: userCredentials }

    const createMember$ = defer(() =>
      connectAPI.addMember(memberData, connectConfig, appConfig, isHuman),
    )
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
            const updateMember$ = defer(() =>
              connectAPI.updateMember({ ...memberData, guid: memberGuid }),
            ).pipe(
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
            return defer(() => connectAPI.loadMemberByGuid(memberGuid)).pipe(
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
