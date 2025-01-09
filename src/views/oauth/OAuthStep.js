import React, { useEffect, useState, useRef, useImperativeHandle, useContext } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { defer, of } from 'rxjs'
import { mergeMap, map, pluck } from 'rxjs/operators'

import { useApi } from 'src/context/ApiContext'
import { ReadableStatuses } from 'src/const/Statuses'
import { REFERRAL_SOURCES } from 'src/const/Connect'

import { SlideDown } from 'src/components/SlideDown'
import { goToUrlLink } from 'src/utilities/global'
import { OAuthDefault } from 'src/views/oauth/OAuthDefault'
import { WaitingForOAuth } from 'src/views/oauth/WaitingForOAuth'
import { OAuthStartError } from 'src/views/oauth/OAuthStartError'
import { LeavingNoticeFlat } from 'src/components/LeavingNoticeFlat'

import { selectConfig, selectIsMobileWebView } from 'src/redux/reducers/configSlice'
import { getCurrentMember } from 'src/redux/selectors/Connect'
import * as connectActions from 'src/redux/actions/Connect'

import PoweredByMX from 'src/views/disclosure/PoweredByMX'
import StickyComponentContainer from 'src/components/StickyComponentContainer'

import { scrollToTop } from 'src/utilities/ScrollToTop'

import { DisclosureInterstitial } from 'src/views/disclosure/Interstitial'
import { AnalyticEvents } from 'src/const/Analytics'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { PostMessageContext } from 'src/ConnectWidget'

export const OAuthStep = React.forwardRef((props, navigationRef) => {
  const { institution, onGoBack } = props

  const oauthWindow = useRef(null)
  const interstitialRef = useRef(null)
  const interstitialNavRef = useRef(null)
  const containerRef = useRef(null)
  const [isWaitingForOAuth, setIsWaitingForOAuth] = useState(false)
  const [oauthStartError, setOAuthStartError] = useState(null)
  const [isStartingOauth, setIsStartingOauth] = useState(false)
  const config = useSelector(selectConfig)
  const member = useSelector((state) => getCurrentMember(state))
  const is_mobile_webview = useSelector(selectIsMobileWebView)
  const pendingOauthMember = useSelector(
    (state) =>
      state.connect.members.filter(
        (member) =>
          member.institution_guid === institution.guid &&
          member.connection_status === ReadableStatuses.PENDING,
      )[0],
  )
  const oauthURL = useSelector((state) => state.connect.oauthURL)
  const showDisclosureStep = useSelector(
    (state) => state.profiles.widgetProfile.display_disclosure_in_connect,
  )
  const showMXBranding = useSelector((state) => state.profiles.widgetProfile.show_mx_branding)
  const postMessageFunctions = useContext(PostMessageContext)
  const dispatch = useDispatch()

  const [isLeavingUrl, setIsLeavingUrl] = useState(null)
  const [showInterstitialDisclosure, setShowInterstitialDisclosure] = useState(false)

  const sendPosthogEvent = useAnalyticsEvent()
  const { api } = useApi()

  useImperativeHandle(navigationRef, () => {
    return {
      handleBackButton() {
        if (showInterstitialDisclosure) {
          interstitialNavRef.current.handleCloseInterstitial()
        } else if (isWaitingForOAuth) {
          handleOAuthRetry()
        } else {
          postMessageFunctions.onPostMessage('connect/backToSearch')
          props.onGoBack()
        }
      },
      showBackButton() {
        return true
      },
    }
  }, [isWaitingForOAuth, oauthStartError, showInterstitialDisclosure])

  /**
   * Called when we succesfully generate an oauth window uri for the exsting
   * member, or use the uri from a brand new member.
   */
  function onStartOAuthSuccess(member, oauthWindowURI) {
    setIsStartingOauth(false)
    setOAuthStartError(null)
    dispatch({
      type: connectActions.ActionTypes.START_OAUTH_SUCCESS,
      payload: { member, oauthWindowURI },
    })
  }

  /**
   * Called when something goes wrong when trying to generate an oauth url for
   * the member.
   */
  function onStartOAuthFail(err) {
    setIsStartingOauth(false)
    setOAuthStartError(err)
  }

  /**
   * Generate an oauth URL when the widget loads, or when we retry OAuth
   */
  useEffect(() => {
    if (oauthURL == null) {
      setIsStartingOauth(true)
    }
  }, [])

  /**
   * Start an oauth flow by either getting an existing member's oauth_window_uri, or
   * creating a new member
   */
  useEffect(() => {
    if (!isStartingOauth) return () => {}

    let member$

    if (pendingOauthMember) {
      // If there is a pending oauth member, don't create a new one, use that one
      member$ = of(pendingOauthMember)
    } else {
      /**
       * At this point we have a new member, create it and use it's oauth URL
       */
      const newMemberStream$ = defer(() =>
        api.addMember({ is_oauth: true, institution_guid: institution.guid }, config),
      )
        .pipe(pluck('member'))
        .subscribe(
          (member) => {
            sendPosthogEvent(AnalyticEvents.OAUTH_PENDING_MEMBER_CREATED, {
              institution_guid: institution.guid,
              institution_name: institution.name,
            })
            onStartOAuthSuccess(member, member.oauth_window_uri)
          },
          (err) => onStartOAuthFail(err),
        )

      return () => newMemberStream$.unsubscribe()
    }

    const existingMemberStream$ = member$
      .pipe(
        mergeMap((existingMember) =>
          defer(() => api.getOAuthWindowURI(existingMember.guid, config)).pipe(
            map(({ oauth_window_uri }) => [existingMember, oauth_window_uri]),
          ),
        ),
      )
      .subscribe(
        ([member, oauthWindowURI]) => onStartOAuthSuccess(member, oauthWindowURI),
        (err) => onStartOAuthFail(err),
      )

    return () => existingMemberStream$.unsubscribe()
  }, [isStartingOauth])

  /**
   * When the user clicks sign in we need to send the post message for
   * oauthRequested and open a window (if possible). Then go to the waiting
   * view while the user completes oauth
   */
  function onSignInClick() {
    postMessageFunctions.onPostMessage('connect/oauthRequested', {
      url: oauthURL,
      member_guid: member.guid,
    })

    if (!is_mobile_webview && config?.oauth_referral_source === REFERRAL_SOURCES.BROWSER) {
      oauthWindow.current = window.open(oauthURL)
    }

    setIsWaitingForOAuth(true)
  }

  function closeOAuthWindow() {
    if (oauthWindow.current) {
      oauthWindow.current.close()
      oauthWindow.current = null
    }
  }

  function handleOAuthRetry() {
    setIsStartingOauth(true)
    setIsWaitingForOAuth(false)
  }

  function handleOAuthSuccess(memberGuid) {
    closeOAuthWindow()
    dispatch(connectActions.handleOAuthSuccess(memberGuid))
  }

  function handleOAuthError(memberGuid, errorReason = null) {
    closeOAuthWindow()
    dispatch(connectActions.handleOAuthError({ memberGuid, errorReason }))
  }

  let oauthView = null

  if (isLeavingUrl) {
    oauthView = (
      <SlideDown>
        <LeavingNoticeFlat
          onCancel={() => {
            setIsLeavingUrl(null)
          }}
          onContinue={() => {
            goToUrlLink(isLeavingUrl)
          }}
        />
      </SlideDown>
    )
  } else if (showInterstitialDisclosure) {
    oauthView = (
      <div ref={interstitialRef}>
        <DisclosureInterstitial
          handleGoBack={() => setShowInterstitialDisclosure(false)}
          ref={interstitialNavRef}
          scrollToTop={() => {
            scrollToTop(interstitialRef)
          }}
        />
      </div>
    )
  } else if (isWaitingForOAuth) {
    oauthView = (
      <WaitingForOAuth
        institution={institution}
        member={member}
        onOAuthError={handleOAuthError}
        onOAuthRetry={handleOAuthRetry}
        onOAuthSuccess={handleOAuthSuccess}
      />
    )
  } else if (oauthStartError) {
    oauthView = (
      <OAuthStartError
        institution={institution}
        oauthStartError={oauthStartError}
        onOAuthTryAgain={handleOAuthRetry}
        onReturnToSearch={onGoBack}
      />
    )
  } else {
    const selectedInstructionalData =
      member?.instructional_data ??
      pendingOauthMember?.instructional_data ??
      institution.instructional_data

    const footer =
      !showDisclosureStep && showMXBranding ? (
        <PoweredByMX
          onClick={() => {
            scrollToTop(containerRef)
            setShowInterstitialDisclosure(true)
          }}
        />
      ) : null

    // This view has a unique footer, so return now
    return (
      <StickyComponentContainer footer={footer} ref={containerRef}>
        <OAuthDefault
          currentMember={member}
          institution={institution}
          onSignInClick={onSignInClick}
          selectedInstructionalData={selectedInstructionalData}
          setIsLeavingUrl={setIsLeavingUrl}
        />
      </StickyComponentContainer>
    )
  }

  return oauthView
})

OAuthStep.propTypes = {
  institution: PropTypes.object.isRequired,
  onGoBack: PropTypes.func.isRequired,
}

OAuthStep.displayName = 'OAuthStep'
