import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useTokens } from '@kyper/tokenprovider'

import { GoBackButton } from 'src/components/GoBackButton'
import { STEPS } from 'src/const/Connect'

export const ConnectNavigationHeader = (props) => {
  const goBackButtonContainerRef = useRef()
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const step = useSelector(
    (state) => state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )

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
    <div data-test="navigation-header" style={styles.container}>
      <div ref={goBackButtonContainerRef} style={styles.content} tabIndex={-1}>
        {shouldShowGlobalBackButton && <GoBackButton handleGoBack={backButtonNavigationHandler} />}
      </div>
    </div>
  )
}

ConnectNavigationHeader.propTypes = {
  connectGoBack: PropTypes.func.isRequired,
  stepComponentRef: PropTypes.object,
}

const getStyles = (tokens) => {
  return {
    container: {
      display: 'flex',
      justifyContent: 'center',
      position: 'sticky',
      top: 0,
      left: 0,
      backgroundColor: tokens.BackgroundColor.Container,
      zIndex: tokens.ZIndex.Sticky,
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: '60px',
      maxWidth: '352px',
      minWidth: '270px',
      margin: `0px ${tokens.Spacing.Large}px`,
    },
  }
}
