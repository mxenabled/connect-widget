/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useRef } from 'react'
import { useTokens } from '@kyper/tokenprovider'
import { AppBar, Box, IconButton, Toolbar, SxProps, Theme } from '@mui/material'
import { Icon } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'

interface GoBackButtonProps {
  handleGoBack: () => void
  shouldShowBackButton: boolean
  toolbarSx?: SxProps<Theme>
}

export const GoBackButton = forwardRef<HTMLButtonElement, GoBackButtonProps>((props, ref) => {
  const defaultRef = useRef(null)
  const { handleGoBack, shouldShowBackButton = true, toolbarSx } = props
  const tokens = useTokens()
  const defaultStyles = getStyles(tokens)

  return (
    <Box data-test="navigation-header" sx={defaultStyles.container}>
      <AppBar elevation={0} position="static" sx={defaultStyles.appBar}>
        <Toolbar sx={{ ...defaultStyles.toolbar, ...toolbarSx }}>
          {shouldShowBackButton ? (
            <IconButton
              aria-label={__('Go Back')}
              data-test="back-button"
              name="connect-navigation-back-button"
              onClick={handleGoBack}
              ref={ref ?? defaultRef}
              sx={defaultStyles.button}
            >
              <Icon name="arrow_back_ios_new" size={24} />
            </IconButton>
          ) : null}
        </Toolbar>
      </AppBar>
    </Box>
  )
})

const getStyles = (tokens: any) => ({
  container: { flexGrow: 1 },
  appBar: { backgroundColor: tokens.BackgroundColor.Container, display: 'flex' },
  toolbar: {
    padding: `0 ${tokens.Spacing.Medium}px`,
    maxWidth: '368px',
    left: 0,
    transform: 'translateX(-5%)',
  },
  button: { color: tokens.TextColor.Default },
})

GoBackButton.displayName = 'GoBackButton'
