import React from 'react'
import PropTypes from 'prop-types'

import { Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { InfoFilled } from '@kyper/icon/InfoFilled'
import { AttentionFilled } from '@kyper/icon/AttentionFilled'

import { ReadableStatuses } from 'src/const/Statuses'

export const ViewTitle = ({ connectionStatus, title }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.container}>
      <Text bold={true} component="h2" data-test="title-text" truncate={false} variant="H2">
        {title}
      </Text>
      {connectionStatus === ReadableStatuses.DEGRADED && (
        <InfoFilled color={tokens.BackgroundColor.MessageBoxHelp} size={24} />
      )}
      {connectionStatus === ReadableStatuses.REJECTED && (
        <AttentionFilled color={tokens.BackgroundColor.MessageBoxError} size={24} />
      )}
    </div>
  )
}

const getStyles = (tokens) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.Spacing.Tiny,
  },
})

ViewTitle.propTypes = {
  connectionStatus: PropTypes.number,
  title: PropTypes.string.isRequired,
}
