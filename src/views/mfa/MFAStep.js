import _get from 'lodash/get'
import React, { useState, useEffect, useImperativeHandle, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { of, defer } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import PropTypes from 'prop-types'
import { MessageBox } from '@kyper/messagebox'
import { Button } from '@kyper/button'
import { useTokens } from '@kyper/tokenprovider'

import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { MFAForm } from 'src/views/mfa/MFAForm'
import { SlideDown } from 'src/components/SlideDown'
import { Support, VIEWS as SUPPORT_VIEWS } from 'src/components/support/Support'
import { ReadableStatuses } from 'src/const/Statuses'
import { ActionTypes as PostMessageActionTypes } from 'src/redux/actions/PostMessage'
import { getCurrentMember } from 'src/redux/selectors/Connect'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'

import { ActionTypes } from 'src/redux/actions/Connect'

import connectAPI from 'src/services/api'
import { __ } from 'src/utilities/Intl'
import { AnalyticEvents } from 'src/const/Analytics'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { getDelay } from 'src/utilities/getDelay'

const MFAStep = React.forwardRef((props, navigationRef) => {
  const { enableSupportRequests, institution, onGoBack } = props
  const supportNavRef = useRef(null)
  const connectConfig = useSelector(selectConnectConfig)
  const isHuman = useSelector((state) => state.app.humanEvent)
  const currentMember = useSelector(getCurrentMember)

  const [showSupportView, setShowSupportView] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatedMember, setUpdatedMember] = useState(currentMember)
  const dispatch = useDispatch()
  const sendPosthogEvent = useAnalyticsEvent()

  const mfaCredentials = _get(currentMember, 'mfa.credentials', [])
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  useImperativeHandle(navigationRef, () => {
    return {
      handleBackButton() {
        if (showSupportView) {
          supportNavRef.current.handleCloseSupport()
        }
      },
      showBackButton() {
        if (showSupportView) {
          return true
        }
        return false
      },
    }
  }, [showSupportView])

  useEffect(() => {
    if (!isSubmitting) return () => {}

    dispatch({
      type: ActionTypes.MFA_CONNECT_SUBMIT,
      payload: { guid: updatedMember.guid },
    })

    /**
     * Prevent an update to the member, it causes the member to go CHALLENGED again,
     * and it prevents the user from seeing the real error.
     *
     * If a user starts the MFA process and waits until the member becomes expired
     * before submitting an answer, we should let the user know via an error message
     * that they took too long
     */
    if (updatedMember?.connection_status === ReadableStatuses.EXPIRED) {
      return of({
        type: ActionTypes.MFA_CONNECT_SUBMIT_ERROR,
      })
    }

    const mfaConnectSubmit$ = defer(() =>
      connectAPI.updateMFA(updatedMember, connectConfig, isHuman),
    )
      .pipe(
        map((member) => ({
          type: ActionTypes.MFA_CONNECT_SUBMIT_SUCCESS,
          payload: { item: member },
        })),
        catchError(() => {
          return of({
            type: ActionTypes.MFA_CONNECT_SUBMIT_ERROR,
          })
        }),
      )
      .subscribe((action) => {
        setIsSubmitting(false)
        dispatch(action)
      })

    return () => mfaConnectSubmit$.unsubscribe()
  }, [isSubmitting])

  if (showSupportView) {
    return (
      <Support
        loadToView={SUPPORT_VIEWS.GENERAL_SUPPORT}
        onClose={() => setShowSupportView(false)}
        ref={supportNavRef}
      />
    )
  }

  return (
    <React.Fragment>
      <SlideDown delay={getNextDelay()}>
        <InstitutionBlock institution={institution} />
      </SlideDown>
      {mfaCredentials.length === 0 ? (
        <SlideDown delay={getNextDelay()}>
          <MessageBox
            title={__('Oops! Something went wrong. Please try again later.')}
            variant="error"
          >
            <Button onClick={onGoBack} size="small" style={styles.goBackButton} variant="link">
              {__('Go Back')}
            </Button>
          </MessageBox>
        </SlideDown>
      ) : (
        <SlideDown delay={getNextDelay()}>
          <MFAForm
            currentMember={currentMember}
            institution={institution}
            isSubmitting={isSubmitting}
            onSubmit={(credentials) => {
              dispatch({
                type: PostMessageActionTypes.SEND_POST_MESSAGE,
                payload: { event: 'connect/submitMFA', data: { member_guid: currentMember.guid } },
              })
              setUpdatedMember((previousMember) => ({
                ...previousMember,
                credentials,
              }))
              setIsSubmitting(true)
            }}
          />
        </SlideDown>
      )}

      {enableSupportRequests && (
        <SlideDown delay={getNextDelay()}>
          <div style={styles.getHelpContainer}>
            <Button
              data-test="mfa-get-help-button"
              onClick={() => {
                sendPosthogEvent(AnalyticEvents.MFA_CLICKED_GET_HELP)
                setShowSupportView(true)
              }}
              style={styles.getHelpButton}
              variant="transparent"
            >
              {__('Get help')}
            </Button>
          </div>
        </SlideDown>
      )}
    </React.Fragment>
  )
})

MFAStep.propTypes = {
  enableSupportRequests: PropTypes.bool.isRequired,
  institution: PropTypes.object.isRequired,
  onGoBack: PropTypes.func.isRequired,
}

MFAStep.displayName = 'MFAStep'

const getStyles = (tokens) => {
  return {
    goBackButton: {
      marginRight: tokens.Spacing.Large,
      marginTop: tokens.Spacing.Medium,
    },
    getHelpContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: tokens.Spacing.Tiny,
    },
    getHelpButton: {
      width: '100%',
    },
  }
}

export default MFAStep
