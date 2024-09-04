import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { defer } from 'rxjs'
import { useDispatch, useSelector } from 'react-redux'

import connectAPI from 'src/services/api'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { ActionTypes as PostMessageActionTypes } from 'src/redux/actions/PostMessage'
import { getCurrentMember } from 'src/redux/selectors/Connect'
import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConfig } from 'src/redux/reducers/configSlice'

import { Credentials } from 'src/views/credentials/Credentials'
import { LoadingSpinner } from 'src/components/LoadingSpinner'

/**
 * Responsibilities:
 * - Get the member creds
 * - Render Credentials with the creds it received
 * - Performs the UPDATE
 */
export const UpdateMemberForm = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_UPDATE_CREDENTIALS)
  const institution = useSelector((state) => state.connect.selectedInstitution)
  const currentMember = useSelector(getCurrentMember)
  const connectConfig = useSelector(selectConfig)
  const isHuman = useSelector((state) => state.app.humanEvent)

  const [isUpdatingMember, setIsUpdatingMember] = useState(false)
  const [memberUpdateError, setMemberUpdateError] = useState(null)
  const [state, setState] = useState({
    isLoading: true,
    credentials: [],
    error: null,
  })
  const dispatch = useDispatch()

  useEffect(() => {
    const request$ = defer(() => connectAPI.getMemberCredentials(currentMember.guid)).subscribe(
      (credentials) =>
        setState({
          isLoading: false,
          credentials,
          error: null,
        }),
      (error) => {
        setState({
          isLoading: false,
          credentials: [],
          error,
        })
      },
    )

    return () => request$.unsubscribe()
  }, [currentMember])

  const handleUpdateMember = (credentials) => {
    setIsUpdatingMember(true)
    const memberData = { ...currentMember, credentials }

    dispatch({
      type: PostMessageActionTypes.SEND_POST_MESSAGE,
      payload: {
        event: 'connect/updateCredentials',
        payload: {
          institution: {
            guid: institution.guid,
            code: institution.code,
          },
          member_guid: currentMember.guid,
        },
      },
    })

    connectAPI
      .updateMember(memberData, connectConfig, isHuman)
      .then((response) => {
        if (props.onUpsertMember) {
          props.onUpsertMember(response)
        }
        return dispatch({
          type: ActionTypes.UPDATE_MEMBER_SUCCESS,
          payload: { item: response },
        })
      })
      .catch((error) => {
        setIsUpdatingMember(false)
        setMemberUpdateError(error.response)
      })
  }

  if (state.isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Credentials
      credentials={state.credentials}
      error={memberUpdateError}
      handleSubmitCredentials={handleUpdateMember}
      isProcessingMember={isUpdatingMember}
      onDeleteConnectionClick={props.onDeleteConnectionClick}
      onGoBackClick={props.onGoBackClick}
      ref={props.navigationRef}
    />
  )
}

UpdateMemberForm.propTypes = {
  navigationRef: PropTypes.func.isRequired,
  onDeleteConnectionClick: PropTypes.func,
  onGoBackClick: PropTypes.func.isRequired,
  onUpsertMember: PropTypes.func,
}
