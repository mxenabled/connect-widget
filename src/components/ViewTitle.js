import React from 'react'
import PropTypes from 'prop-types'

import { Icon, Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'
import { InfoFilled } from '@kyper/icon/InfoFilled'

import { ReadableStatuses } from 'src/const/Statuses'

export const ViewTitle = ({ connectionStatus, title }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.container}>
      <Text bold={true} component="h1" data-test="title-text" truncate={false} variant="H2">
        {title}
      </Text>
      {connectionStatus === ReadableStatuses.DEGRADED && (
        <InfoFilled color={tokens.BackgroundColor.MessageBoxHelp} size={24} />
      )}
      {connectionStatus === ReadableStatuses.REJECTED && (
        <Icon
          fill={true}
          name="error"
          size={24}
          sx={{ color: tokens.BackgroundColor.MessageBoxError }}
        />
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
