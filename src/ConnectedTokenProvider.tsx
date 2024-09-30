import React from 'react'
import { RootState } from 'src/redux/Store'
import _isEmpty from 'lodash/isEmpty'
import { useSelector } from 'react-redux'

import { ThemeProvider } from '@mui/material'
import { deepmerge } from '@mui/utils'

import { createMXTheme } from '@kyper/mui'
import { TokenProvider, THEMES } from '@kyper/tokenprovider'

import { getTokenProviderValues } from 'src/redux/selectors/ClientColorScheme'

declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string
    darker?: string
  }

  interface SimplePaletteColorOptions {
    lighter?: string
    darker?: string
  }
}

interface ColorScheme {
  Brand100?: string
  Brand200?: string
  Brand300?: string
  Brand400?: string
  Brand500?: string
}

export const theme = (colorScheme: ColorScheme) => {
  if (!_isEmpty(colorScheme)) {
    return {
      palette: {
        primary: {
          lighter: colorScheme.Brand100,
          light: colorScheme.Brand200,
          main: colorScheme.Brand300,
          dark: colorScheme.Brand400,
          darker: colorScheme.Brand500,
        },
      },
    }
  }
  return {}
}
interface Props {
  children: React.ReactNode
}

export const ConnectedTokenProvider = ({ children }: Props): React.ReactNode => {
  const customTokens = useSelector(getTokenProviderValues)
  const colorScheme = useSelector((state: RootState) => state.config.color_scheme)
  const isDarkModeEnabled: boolean = colorScheme === THEMES.DARK
  const mxTheme = createMXTheme(isDarkModeEnabled ? 'dark' : 'light')
  const combinedTheme = deepmerge(mxTheme, theme(customTokens.tokenOverrides.Color))

  return (
    <TokenProvider
      theme={isDarkModeEnabled ? THEMES.DARK : colorScheme}
      tokenOverrides={customTokens.tokenOverrides}
    >
      <ThemeProvider theme={combinedTheme}>{children}</ThemeProvider>
    </TokenProvider>
  )
}
