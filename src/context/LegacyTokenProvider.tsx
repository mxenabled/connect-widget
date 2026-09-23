// Local copy of @kyper/tokenprovider (v4.4.0) so we no longer depend on the Kyper package.
// Source: https://gitlab.com/mxtechnologies/mx/kyper-react/-/blob/master/packages/tokenprovider/lib/TokenProvider.js
import React, { useEffect, useState } from 'react'
import { light, dark, buildTheme } from '@mxenabled/design-tokens'
import type { TokenTypes } from '@mxenabled/design-tokens'

export const targets = {
  REACT: 'react',
  REACT_NATIVE: 'react_native',
  NATIVE: 'native',
} as const

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

type Target = (typeof targets)[keyof typeof targets]
type Theme = (typeof THEMES)[keyof typeof THEMES]

const defaultTokenOverrides = {}

export const TokenContext = React.createContext<TokenTypes>(light)
export const ReactNativeTokenContext = React.createContext<TokenTypes>(
  buildTheme(THEMES.LIGHT, targets.REACT_NATIVE),
)

export const useTokens = (target: Target = targets.REACT, tokenOverrides = {}): TokenTypes => {
  const contextTarget = target === targets.REACT ? TokenContext : ReactNativeTokenContext
  const context = React.useContext(contextTarget)

  return context ? context : buildTheme(THEMES.LIGHT, target, { ...tokenOverrides })
}

interface LegacyTokenProviderProps {
  theme?: Theme | string
  target?: typeof targets.REACT | typeof targets.REACT_NATIVE
  tokenOverrides?: object
  children?: React.ReactNode
}

export const LegacyTokenProvider = ({
  theme = THEMES.LIGHT,
  target = targets.REACT,
  tokenOverrides = defaultTokenOverrides,
  children,
}: LegacyTokenProviderProps) => {
  const [tokens, setTokens] = useState<TokenTypes>(theme === THEMES.LIGHT ? light : dark)

  useEffect(() => {
    const userSpecificTokens = buildTheme(theme, target, { ...tokenOverrides })

    setTokens(userSpecificTokens)
  }, [theme, target, tokenOverrides])

  if (target === targets.REACT) {
    return <TokenContext.Provider value={tokens}>{children}</TokenContext.Provider>
  }

  return (
    <ReactNativeTokenContext.Provider value={tokens}>{children}</ReactNativeTokenContext.Provider>
  )
}
