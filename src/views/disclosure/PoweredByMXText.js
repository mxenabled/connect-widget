import React from 'react'
import { MXLogoIcon, Text } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'
import { Stack, useTheme } from '@mui/material'
import styles from 'src/views/disclosure/PoweredByMXText.module.css'

const PoweredByMXText = () => {
  const theme = useTheme()

  return (
    <Stack alignItems="center" direction="row" justifyContent="center" spacing={0.5}>
      <Text
        aria-hidden={true}
        bold={true}
        className={styles.text}
        component="span"
        truncate={false}
        variant="Small"
      >
        {
          // --TR: Full string "Data access by MX(Logo)"
          __('Data access by')
        }{' '}
      </Text>
      <MXLogoIcon color={theme.palette.text.primary} size={25} />
      <span className={styles.accessibleAriaLabel}>{`${__('Data access by')} MX`}</span>
    </Stack>
  )
}

export default PoweredByMXText
