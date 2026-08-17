import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { __ } from 'src/utilities/Intl'
import { STEPS } from 'src/const/Connect'
import { PostMessageContext } from 'src/ConnectWidget'
import { GoBackButtonHeader } from 'src/components/GoBackButtonHeader'
import styles from 'src/components/ConnectNavigationHeader.module.css'

export const ConnectNavigationHeader = (props) => {
  const goBackButtonContainerRef = useRef()
  const postMessageFunctions = useContext(PostMessageContext)
  const step = useSelector(
    (state) => state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )
  const showMobileBackButton =
    useSelector((state) => state.config.show_back_button && state.connect.location.length === 1) ||
    false
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
    if (showMobileBackButton) {
      postMessageFunctions.onPostMessage('connect/backButtonClicked')
    } else if (typeof props.stepComponentRef?.handleBackButton === 'function') {
      props.stepComponentRef.handleBackButton()
    } else {
      props.connectGoBack()
    }
  }

  return (
    <GoBackButtonHeader
      handleGoBack={backButtonNavigationHandler}
      ref={goBackButtonContainerRef}
      shouldShowBackButton={shouldShowGlobalBackButton || showMobileBackButton}
      toolbarClassName={styles.toolbar}
    />
  )
}

ConnectNavigationHeader.propTypes = {
  connectGoBack: PropTypes.func.isRequired,
  stepComponentRef: PropTypes.object,
}
