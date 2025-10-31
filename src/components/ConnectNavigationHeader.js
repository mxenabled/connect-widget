import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useTokens } from '@kyper/tokenprovider'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import { Icon } from '@mxenabled/mxui'

import { STEPS } from 'src/const/Connect'
import { selectShowMobileBackButton } from 'src/redux/reducers/configSlice'

export const ConnectNavigationHeader = (props) => {
  const goBackButtonContainerRef = useRef()
  const tokens = useTokens()
  const sx = getStyles(tokens)
  const step = useSelector(
    (state) => state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )
  const showMobileBackButton = useSelector((state) => selectShowMobileBackButton(state, tokens))
  const [shouldShowGlobalBackButton, setShouldShowGlobalBackButton] = useState(false)

  useEffect(() => {
    /**
     * For the back button to show up in the global navigation header,
     * We check to see if the currentStep has defined a custom showBackButton method(which determines whether we should show a back button or not) and call it.
     * Otherwise, we hide the back button by default.
     */
    const backButtonNavigationToggle = () => {
      if (typeof props.stepComponentRef?.showBackButton === 'function') {
        return props.stepComponentRef.showBackButton()
      }
      return false
    }

    setShouldShowGlobalBackButton(backButtonNavigationToggle())
  }, [props.stepComponentRef])

  useEffect(() => {
    // If the back button is shown, focus it when the step changes
    if (shouldShowGlobalBackButton) {
      goBackButtonContainerRef.current.focus()
    }
  }, [shouldShowGlobalBackButton, step])

  /**
   * When a back button is clicled in the global navigation header,
   * We check to see if the currentStep has defined a custom handleBackButton method and call it.
   * Otherwise, we go back a step or a substep.
   */
  const backButtonNavigationHandler = () => {
    if (typeof props.stepComponentRef?.handleBackButton === 'function') {
      props.stepComponentRef.handleBackButton()
    } else {
      props.connectGoBack()
    }
  }

  return (
    <Box data-test="navigation-header" sx={sx.container}>
      <AppBar elevation={0} position="static" sx={sx.appBar}>
        <Toolbar disableGutters={true} sx={sx.toolbar}>
          {shouldShowGlobalBackButton ||
            (showMobileBackButton && (
              <IconButton
                onClick={backButtonNavigationHandler}
                ref={goBackButtonContainerRef}
                sx={sx.button}
              >
                <Icon name="arrow_back_ios_new" size={24} />
              </IconButton>
            ))}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

ConnectNavigationHeader.propTypes = {
  connectGoBack: PropTypes.func.isRequired,
  stepComponentRef: PropTypes.object,
}

const getStyles = (tokens) => ({
  container: { flexGrow: 1 },
  appBar: { backgroundColor: tokens.BackgroundColor.Container },
  toolbar: { padding: `0 ${tokens.Spacing.Medium}px` },
  button: { color: tokens.TextColor.Default },
})
