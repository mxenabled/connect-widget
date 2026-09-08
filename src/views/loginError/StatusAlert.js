import React from 'react'
import PropTypes from 'prop-types'

import Alert from '@mui/material/Alert'
import { Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'

export const StatusAlert = ({ variant = 'info', message }) => {
  return (
    <Alert data-test="error-messagebox" severity={variant}>
      <Text component="p" data-test="error-messagebox-text" truncate={false} variant="subtitle">
        {__(`${message}`)}
      </Text>
    </Alert>
  )
}

StatusAlert.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
}
