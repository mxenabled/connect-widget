import React from 'react'
import { RootState } from 'src/redux/Store'
import { useSelector } from 'react-redux'

import { Theme, ThemeProvider, CssBaseline } from '@mui/material'
import { deepmerge } from '@mui/utils'

import { createMXTheme, Icon, IconWeight } from '@mxenabled/mxui'
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

const connectThemeOverrides = (palette: Theme['palette']) => ({
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          // Sets the default color of text. Can override singluar usage with color prop.
          color: palette?.text?.primary,
        },
        // TODO: Remove once we fully migrate to @mxenabled/mxui as it would apply the right theme styles automatically.
        subtitle2: {
          fontSize: '13px',
          lineHeight: '20px',
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
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '&.MuiFormControlLabel-labelPlacementStart': {
            marginLeft: 0,
            marginRight: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          fontWeight: 700,
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
  const mxTheme = createMXTheme(isDarkModeEnabled ? 'dark' : 'light', {
    paletteOptions: {
      primary: clientCustomTokens.tokenOverrides.Color.Brand300,
    },
  })

  const combinedTheme = deepmerge(
    mxTheme,
    connectThemeOverrides(mxTheme.palette as Theme['palette']), // Theme object with connect overrides
  )

  const kyperTokenOverrides = {
    Color: {
      Brand100: isDarkModeEnabled ? mxTheme.palette.primary[800] : mxTheme.palette.primary[100],
      Brand200: mxTheme.palette.primary.light,
      Brand300: mxTheme.palette.primary.main,
      Brand400: mxTheme.palette.primary.dark,
      Brand500: isDarkModeEnabled ? mxTheme.palette.primary[50] : mxTheme.palette.primary[900],
      Primary100: isDarkModeEnabled ? mxTheme.palette.primary[800] : mxTheme.palette.primary[100],
      Primary200: mxTheme.palette.primary.light,
      Primary300: mxTheme.palette.primary.main,
      Primary400: mxTheme.palette.primary.dark,
      Primary500: isDarkModeEnabled ? mxTheme.palette.primary[50] : mxTheme.palette.primary[900],
    },
  }

  return (
    <TokenProvider
      theme={isDarkModeEnabled ? THEMES.DARK : colorScheme}
      tokenOverrides={kyperTokenOverrides}
    >
      <ThemeProvider theme={combinedTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TokenProvider>
  )
}
