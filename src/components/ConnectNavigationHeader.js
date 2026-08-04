import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector, ReactReduxContext } from 'react-redux'
import { useTokens } from '@kyper/tokenprovider'

import AppBar from '@mui/material/AppBar'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'

import styles from './ConnectNavigationHeader.module.css'
import { Icon } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'
import { STEPS } from 'src/const/Connect'
import { PostMessageContext } from 'src/ConnectWidget'

const stepComponentRefShape = PropTypes.shape({
  handleBackButton: PropTypes.func,
  showBackButton: PropTypes.func,
})

const NavigationHeaderBase = ({
  step,
  showMobileBackButton,
  onPostMessage,
  connectGoBack,
  stepComponentRef,
}) => {
  const goBackButtonContainerRef = useRef()
  const tokens = useTokens()
  const [shouldShowGlobalBackButton, setShouldShowGlobalBackButton] = useState(false)

  useEffect(() => {
    const backButtonNavigationToggle = () => {
      if (typeof stepComponentRef?.showBackButton === 'function') {
        return stepComponentRef.showBackButton()
      }
      return false
    }
    setShouldShowGlobalBackButton(backButtonNavigationToggle())
  }, [stepComponentRef])

  useEffect(() => {
    if (shouldShowGlobalBackButton) {
      goBackButtonContainerRef.current.focus()
    }
  }, [shouldShowGlobalBackButton, step])

  const backButtonNavigationHandler = () => {
    if (showMobileBackButton) {
      onPostMessage?.('connect/backButtonClicked')
    } else if (typeof stepComponentRef?.handleBackButton === 'function') {
      stepComponentRef.handleBackButton()
    } else {
      connectGoBack()
    }
  }

  return (
    <Stack className={styles.container} data-test="navigation-header">
      <AppBar
        elevation={0}
        position="static"
        style={{ backgroundColor: tokens.BackgroundColor.Container }}
      >
        <Toolbar
          className={styles.toolbar}
          disableGutters={true}
          style={{ padding: `0 ${tokens.Spacing.Medium}px` }}
        >
          {shouldShowGlobalBackButton || showMobileBackButton ? (
            <IconButton
              aria-label={__('Go Back')}
              data-test="back-button"
              name="connect-navigation-back-button"
              onClick={backButtonNavigationHandler}
              ref={goBackButtonContainerRef}
              style={{ color: tokens.TextColor.Default }}
            >
              <Icon name="arrow_back_ios_new" size={24} />
            </IconButton>
          ) : null}
        </Toolbar>
      </AppBar>
    </Stack>
  )
}

NavigationHeaderBase.propTypes = {
  connectGoBack: PropTypes.func.isRequired,
  onPostMessage: PropTypes.func,
  showMobileBackButton: PropTypes.bool,
  step: PropTypes.string,
  stepComponentRef: stepComponentRefShape,
}

// Pulls state from Redux + PostMessageContext and merges with any prop overrides.
// Only rendered when a Redux store is present.
const ConnectedNavigationHeader = ({
  onPostMessage: onPostMessageProp,
  showMobileBackButton: showMobileBackButtonProp,
  step: stepProp,
  ...rest
}) => {
  const postMessageFunctions = useContext(PostMessageContext)
  const step = useSelector(
    (state) => state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )
  const showMobileBackButton = useSelector(
    (state) => state.config.show_back_button && state.connect.location.length === 1,
  )

  return (
    <NavigationHeaderBase
      {...rest}
      onPostMessage={onPostMessageProp ?? postMessageFunctions?.onPostMessage}
      showMobileBackButton={showMobileBackButtonProp ?? showMobileBackButton}
      step={stepProp ?? step}
    />
  )
}

ConnectedNavigationHeader.propTypes = {
  connectGoBack: PropTypes.func.isRequired,
  onPostMessage: PropTypes.func,
  showMobileBackButton: PropTypes.bool,
  step: PropTypes.string,
  stepComponentRef: stepComponentRefShape,
}

export const ConnectNavigationHeader = (props) => {
  const reduxContext = useContext(ReactReduxContext)

  if (reduxContext) {
    return <ConnectedNavigationHeader {...props} />
  }

  return <NavigationHeaderBase {...props} />
}

ConnectNavigationHeader.propTypes = {
  connectGoBack: PropTypes.func.isRequired,
  onPostMessage: PropTypes.func,
  showMobileBackButton: PropTypes.bool,
  step: PropTypes.string,
  stepComponentRef: stepComponentRefShape,
}
