import React from 'react'
import { RootState } from 'src/redux/Store'
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

interface Props {
  children: React.ReactNode
}

export const ConnectedTokenProvider = ({ children }: Props): React.ReactNode => {
  const customTokens = useSelector(getTokenProviderValues)
  const colorScheme = useSelector((state: RootState) => state.config.color_scheme)
  const isDarkModeEnabled: boolean = colorScheme === THEMES.DARK
  const clientColorScheme = customTokens.tokenOverrides.Color
  const mxTheme = createMXTheme(isDarkModeEnabled ? 'dark' : 'light')

  const clientTheme = {
    palette: {
      primary: {
        lighter: clientColorScheme.Brand100
          ? clientColorScheme.Brand100
          : mxTheme.palette.primary.lighter,
        light: clientColorScheme.Brand200
          ? clientColorScheme.Brand200
          : mxTheme.palette.primary.light,
        main: clientColorScheme.Brand300
          ? clientColorScheme.Brand300
          : mxTheme.palette.primary.main,
        dark: clientColorScheme.Brand400
          ? clientColorScheme.Brand400
          : mxTheme.palette.primary.dark,
        darker: clientColorScheme.Brand500
          ? clientColorScheme.Brand500
          : mxTheme.palette.primary.darker,
      },
    },
  }
  const combinedTheme = deepmerge(mxTheme, clientTheme)

  return (
    <TokenProvider theme={colorScheme} tokenOverrides={customTokens.tokenOverrides}>
      <ThemeProvider theme={combinedTheme}>{children}</ThemeProvider>
    </TokenProvider>
  )
}
