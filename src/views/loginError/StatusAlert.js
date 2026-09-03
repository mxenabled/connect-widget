import React from 'react'
import PropTypes from 'prop-types'

import Alert from '@mui/material/Alert'
import { Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'

// Map legacy status variants to MUI Alert severities.
const SEVERITY_BY_VARIANT = {
  error: 'error',
  help: 'info',
  success: 'success',
}

export const StatusAlert = ({ variant, message }) => {
  return (
    <Alert data-test="error-messagebox" severity={SEVERITY_BY_VARIANT[variant] ?? 'info'}>
      <Text
        component="p"
        data-test="error-messagebox-text"
        truncate={false}
        variant="ParagraphSmall"
      >
        {__(`${message}`)}
      </Text>
    </Alert>
  )
}

StatusAlert.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
}
