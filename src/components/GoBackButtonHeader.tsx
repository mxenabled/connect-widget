import React, { forwardRef, useRef } from 'react'
import { AppBar, Box, IconButton, Toolbar } from '@mui/material'
import { Icon } from '@mxenabled/mxui'
import clsx from 'clsx'

import { __ } from 'src/utilities/Intl'

import styles from 'src/components/GoBackButtonHeader.module.css'

interface GoBackButtonProps {
  handleGoBack: () => void
  shouldShowBackButton?: boolean
  toolbarClassName?: string
}

export const GoBackButtonHeader = forwardRef<HTMLButtonElement, GoBackButtonProps>((props, ref) => {
  const defaultRef = useRef(null)
  const { handleGoBack, shouldShowBackButton = true, toolbarClassName } = props

  return (
    <Box className={styles.container} data-test="navigation-header">
      <AppBar className={styles.appBar} elevation={0} position="static">
        <Toolbar className={clsx(styles.toolbar, toolbarClassName)}>
          {shouldShowBackButton ? (
            <IconButton
              aria-label={__('Go Back')}
              className={styles.button}
              data-test="back-button"
              name="connect-navigation-back-button"
              onClick={handleGoBack}
              ref={ref ?? defaultRef}
            >
              <Icon name="arrow_back_ios_new" size={24} />
            </IconButton>
          ) : null}
        </Toolbar>
      </AppBar>
    </Box>
  )
})

GoBackButtonHeader.displayName = 'GoBackButtonHeader'
