import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useIdleTimer } from 'react-idle-timer'
import { useDispatch, useSelector } from 'react-redux'

import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { Button } from '@kyper/button'
import { Text } from '@kyper/text'
import { useTokens } from '@kyper/tokenprovider'

import { ActionTypes as PostMessageActionTypes } from 'reduxify/actions/PostMessage'
import { selectUIMessageVersion } from 'reduxify/reducers/configSlice'

import connectAPI from 'src/connect/services/api'
import { Session } from 'src/connect/const/app'
import { PageviewInfo } from 'src/connect/const/Analytics'
import PostMessage from 'src/connect/utilities/PostMessage'
import { __ } from 'src/connect/utilities/Intl'
import { buildClientSessionTimeoutURL } from 'src/connect/utilities/timeoutHelper'

export const TimeOutDialog = props => {
  // Local State
  const [status, setStatus] = useState('active') // active, prompt, timeout
  const [pingUrl, setPingUrl] = useState(null)
  // Redux State
  const session_timeout = useSelector(state => state.profiles.widgetProfile.session_timeout || 900) // Default to 15 minutes
  const widget_type = useSelector(state => state.profiles.widgetProfile.type)
  const keepalive_url = useSelector(state => state.profiles.widgetProfile.keepalive_url || null)
  const session_timeout_url = useSelector(
    state => state.profiles.widgetProfile.session_timeout_url || null,
  )
  const ui_message_version = useSelector(selectUIMessageVersion)
  const reduxDispatch = useDispatch()

  const tokens = useTokens()
  const styles = getStyles(tokens)
  const idleTimer = useIdleTimer({
    timeout: 1000 * session_timeout, // Convert to milliseconds
    promptBeforeIdle: 1000 * 30, // 30 seconds, convert to milliseconds
    throttle: 500,
    events: ['keydown', 'mousedown', 'touchstart', 'MSPointerDown'], // No move events, only "clicks"
    onPrompt: () => setStatus('prompt'),
    onIdle: () => {
      connectAPI
        .logout()
        .then(() => {
          props.onAnalyticPageview(PageviewInfo.CONNECT_TIMEOUT[1])
          PostMessage.send('logout', {
            logout: true,
          })
          const url = buildClientSessionTimeoutURL(session_timeout_url, `${widget_type}_widget`)

          if (url) {
            if (window.parent && window.parent.location) {
              window.parent.location.href = url
            } else {
              window.location.href = url
            }
          }
        })
        .catch(error => error)

      setStatus('timeout')
    },
  })

  // Ping postMessage FROM client
  useEffect(() => {
    const handleInboundPostMessage = e =>
      PostMessage.parse(e.data).type === 'ping' && extendSession()

    window.addEventListener('message', handleInboundPostMessage)

    return () => window.removeEventListener('message', handleInboundPostMessage)
  })

  // Ping postMessage TO client
  useEffect(() => {
    const keepAliveInterval = setInterval(() => {
      if (!idleTimer.isIdle()) {
        const pingUrl = keepalive_url
          ? `${keepalive_url}?_=${Date.now()}&ping_id=${window.app.options || ''}`
          : null

        if (ui_message_version === 4) {
          reduxDispatch({
            type: PostMessageActionTypes.SEND_POST_MESSAGE,
            payload: { event: 'ping' },
          })
        } else {
          PostMessage.send('ping', false)
        }

        setPingUrl(pingUrl)
      }
    }, Session.PostMessagePingInterval)

    return () => clearInterval(keepAliveInterval)
  }, [])

  const extendSession = () => {
    setStatus('active')
    idleTimer.activate() // Restart the idle timer
    connectAPI.extendSession().catch(error => error)
  }

  return (
    <>
      {status !== 'active' && (
        <div style={styles.container}>
          <div style={styles.content}>
            <AttentionFilled
              color={status === 'timeout' ? tokens.Color.Neutral700 : tokens.Color.Brand300}
              height={32}
              style={styles.icon}
              width={32}
            />
            <Text style={styles.title} tag="h2">
              {status === 'timeout' ? __('Session expired') : __('No recent activity')}
            </Text>
            <Text tag="p">
              {status === 'timeout'
                ? __('Please refresh your browser to continue.')
                : __('Please click Continue to avoid timing out.')}
            </Text>
            {status === 'prompt' && (
              <Button onClick={extendSession} style={styles.continueButton} variant="primary">
                {__('Continue')}
              </Button>
            )}
          </div>
        </div>
      )}
      {pingUrl && (
        <img
          alt=""
          aria-hidden="true"
          id="_extendRemoteSession"
          src={pingUrl}
          style={{
            height: '1px',
            width: '1px',
            border: '0px',
            display: 'none',
            visibility: 'hidden',
          }}
        />
      )}
    </>
  )
}

const getStyles = tokens => ({
  container: {
    background: tokens.BackgroundColor.Modal,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999999,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `0 ${tokens.Spacing.ContainerSidePadding}px`,
    textAlign: 'center',
    maxWidth: '352px', // Our max content width (does not include side margin)
    minWidth: '270px', // Our min content width (does not include side margin)
    margin: '0 auto',
  },
  title: {
    marginBottom: tokens.Spacing.Tiny,
  },
  continueButton: {
    marginTop: tokens.Spacing.XLarge,
    marginBottom: tokens.Spacing.Medium,
    width: '100%',
  },
  icon: {
    marginBottom: tokens.Spacing.Large,
    marginTop: tokens.Spacing.Jumbo,
    paddingTop: tokens.Spacing.Tiny,
  },
})

TimeOutDialog.propTypes = {
  onAnalyticPageview: PropTypes.func.isRequired,
}
