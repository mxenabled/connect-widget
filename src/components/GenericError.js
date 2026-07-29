import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTokens } from '@kyper/tokenprovider'
import { Icon, Text } from '@mxenabled/mxui'

import { isRunningE2ETests } from 'src/utilities/e2e'
import { PageviewInfo } from 'src/const/Analytics'

export const GenericError = ({ loadError, onAnalyticPageview, subtitle, title }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  useEffect(() => {
    if (!isRunningE2ETests())
      onAnalyticPageview(
        loadError?.status === 404
          ? '/connect' + PageviewInfo.CONNECT_NOT_FOUND_ERROR[1]
          : '/connect' + PageviewInfo.CONNECT_GENERIC_ERROR[1],
        {
          error_message: title,
          error_status: loadError?.status || null,
          resource: loadError?.resource || null,
        },
      )
  }, [])

  return (
    <div style={styles.container}>
      <Icon
        fill={true}
        name="error"
        size={48}
        sx={{ color: tokens.TextColor.Default, marginBottom: tokens.Spacing.XLarge }}
      />
      <Text component="h1" truncate={false} variant="H2">
        {title}
      </Text>
      {subtitle && (
        <Text component="h2" truncate={false} variant="Paragraph">
          {subtitle}
        </Text>
      )}
    </div>
  )
}

function getStyles(tokens) {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      height: '100%',
      padding: tokens.Spacing.XSMALL,
      textAlign: 'center',
    },
  }
}

GenericError.propTypes = {
  loadError: PropTypes.object,
  onAnalyticPageview: PropTypes.func.isRequired,
  subtitle: PropTypes.string,
  title: PropTypes.string.isRequired,
}
