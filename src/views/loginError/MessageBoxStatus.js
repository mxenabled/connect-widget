import React from 'react'
import PropTypes from 'prop-types'

import { MessageBox } from '@kyper/messagebox'
import { Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'

export const MessageBoxStatus = ({ variant, message }) => {
  return (
    <MessageBox data-test="error-messagebox" variant={variant}>
      <Text
        component="p"
        data-test="error-messagebox-text"
        role="alert"
        truncate={false}
        variant="ParagraphSmall"
      >
        {__(`${message}`)}
      </Text>
    </MessageBox>
  )
}

MessageBoxStatus.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
}
