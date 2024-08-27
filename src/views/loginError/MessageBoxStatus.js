import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'

import { MessageBox } from '@kyper/messagebox'
import { Text } from '@kyper/text'
import { __ } from 'src/utilities/Intl'

export const MessageBoxStatus = ({ variant, message }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <MessageBox data-test="error-messagebox" variant={variant}>
      <Text
        as="Paragraph"
        data-test="error-messagebox-text"
        role="alert"
        style={styles.messageBoxBody}
        tag="p"
      >
        {__(`${message}`)}
      </Text>
    </MessageBox>
  )
}

const getStyles = (tokens) => {
  return {
    messageBoxBody: {
      fontSize: tokens.FontSize.Small,
      lineHeight: tokens.LineHeight.XSmall,
      marginTop: tokens.Spacing.Tiny,
    },
  }
}

MessageBoxStatus.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
}
