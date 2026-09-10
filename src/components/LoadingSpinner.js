import React from 'react'
import PropTypes from 'prop-types'

import { Stack } from '@mui/material'
import { Text } from '@mxenabled/mxui'
import CircularProgress from '@mui/material/CircularProgress'

import styles from './LoadingSpinner.module.css'
import { __ } from 'src/utilities/Intl'

export const LoadingSpinner = ({ showText = false, size = 48 }) => {
  return (
    <div className={styles.container}>
      <Stack spacing={2}>
        <CircularProgress color="primary" size={size} />
        {showText && (
          <Text className={styles.text} variant="caption">
            {__('Loading ...')}
          </Text>
        )}
      </Stack>
    </div>
  )
}

LoadingSpinner.propTypes = {
  showText: PropTypes.bool,
  size: PropTypes.number,
}
