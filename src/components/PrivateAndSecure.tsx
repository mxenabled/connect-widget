/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { useTokens } from '@kyper/tokenprovider'
import { Lock } from '@kyper/icon/Lock'

import { __ } from 'src/utilities/Intl'

interface PrivateAndSecureProps {
  style?: object
}

export const PrivateAndSecure: React.FC<PrivateAndSecureProps> = ({ style }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div
      data-test="private-secure-footer"
      style={style ? { ...styles.secureSeal, ...style } : styles.secureSeal}
    >
      <Lock color={tokens.TextColor.InputLabel} size={12} style={styles.lock} />
      {
        // --TR: This is a "MX" slogan bank level security meaning as safe as banks are able
        __('Private and secure')
      }
    </div>
  )
}

const getStyles = (tokens: any) => ({
  secureSeal: {
    alignContent: 'center',
    color: tokens.TextColor.InputLabel,
    display: 'flex',
    fontSize: tokens.FontSize.Small,
    justifyContent: 'center',
    padding: `${tokens.Spacing.Medium}px 0`,
  },
  lock: {
    marginRight: tokens.Spacing.Tiny,
  },
})
