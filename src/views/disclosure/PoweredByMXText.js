import React from 'react'

import { MXLogo } from '@kyper/icon/MXLogo'
import { Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

import { __ } from 'src/utilities/Intl'

const PoweredByMXText = () => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.poweredBy}>
      <span style={styles.accessibleAriaLabel}>{`${__('Data access by')} MX`}</span>
      <Text
        aria-hidden={true}
        bold={true}
        component="span"
        style={styles.text}
        truncate={false}
        variant="Small"
      >
        {
          // --TR: Full string "Data access by MX(Logo)"
          __('Data access by')
        }{' '}
      </Text>
      <MXLogo color={tokens.TextColor.Default} size={25} />
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    accessibleAriaLabel: {
      position: 'absolute',
      color: 'transparent',
      overflow: 'hidden',
      userSelect: 'none',
      msUserSelect: 'none',
      MozUserSelect: 'none',
      WebkitUserSelect: 'none',
    },
    poweredBy: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: tokens.TextColor.InputLabel,
      marginRight: tokens.Spacing.Tiny,
    },
  }
}

export default PoweredByMXText
