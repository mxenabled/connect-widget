import React from 'react'
import { RootState } from 'src/redux/Store'
import _isEmpty from 'lodash/isEmpty'
import { useSelector } from 'react-redux'

import { Theme, ThemeProvider } from '@mui/material'
import { deepmerge } from '@mui/utils'

import { Icon, IconWeight } from '@kyper/mui'
import { TokenProvider, THEMES } from '@kyper/tokenprovider'

import { getTokenProviderValues } from 'src/redux/selectors/ClientColorScheme'
import { createMXTheme } from '@mxenabled/mxui'

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

export const clientThemeOverrides = (colorScheme: ColorScheme) => {
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
const connectThemeOverrides = (palette: Theme['palette']) => ({
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          // Sets the default color of text. Can override singluar usage with color prop.
          color: palette?.text?.primary,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: () => ({
          margin: '16px 0',
          padding: '0px 16px',
          borderRadius: '8px',
          '&:first-of-type': {
            marginTop: 0,
          },
          '&::before': {
            display: 'none',
          },
          ...(palette.mode === 'dark' && {
            backgroundColor: '#262626',
            boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.12)',
          }),
        }),
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0px',
          '&.Mui-expanded': {
            minHeight: 'unset',
          },
          '& .MuiAccordionSummary-content': {
            margin: '16px 0px',
            '&.Mui-expanded': {
              margin: '16px 0px',
            },
          },
        },
      },
      defaultProps: {
        expandIcon: (
          <Icon color="secondary" name="stat_minus_1" size={24} weight={IconWeight.Dark} />
        ),
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '8px 0px 24px 0px',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        asterisk: {
          color: '#E32727',
          '&$error': {
            color: '#E32727',
          },
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          fontFamily: 'MaterialSymbolsRounded',
        },
      },
    },
  },
})

interface Props {
  children: React.ReactNode
}

export const ConnectedTokenProvider = ({ children }: Props): React.ReactNode => {
  // Client custom tokens from batcave
  const clientCustomTokens = useSelector(getTokenProviderValues)
  // "Light" or "Dark"
  const colorScheme = useSelector((state: RootState) => state.config.color_scheme)
  // Dark mode: true or false
  const isDarkModeEnabled: boolean = colorScheme === THEMES.DARK
  // Theme object with MX overrides
  const mxTheme = createMXTheme(isDarkModeEnabled ? 'dark' : 'light')

  const combinedTheme = deepmerge(
    mxTheme,
    deepmerge(
      clientThemeOverrides(clientCustomTokens.tokenOverrides.Color), // Theme object with client custom overrides
      connectThemeOverrides(mxTheme.palette as Theme['palette']), // Theme object with connect overrides
    ),
  )

  return (
    <TokenProvider
      theme={isDarkModeEnabled ? THEMES.DARK : colorScheme}
      tokenOverrides={clientCustomTokens.tokenOverrides}
    >
      <ThemeProvider theme={combinedTheme}>{children}</ThemeProvider>
    </TokenProvider>
  )
}
