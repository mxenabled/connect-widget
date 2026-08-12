import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Stack } from '@mui/material'
import { Icon, Text } from '@mxenabled/mxui'

import { isRunningE2ETests } from 'src/utilities/e2e'
import { PageviewInfo } from 'src/const/Analytics'
import styles from 'src/components/GenericError.module.css'

export const GenericError = ({ loadError, onAnalyticPageview, subtitle, title }) => {
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
    <Stack alignItems="center" className={styles.container} justifyContent="center">
      <Icon fill={true} name="error" size={48} />
      <Text className={styles.title} component="h1" truncate={false} variant="H2">
        {title}
      </Text>
      {subtitle && (
        <Text component="h2" truncate={false} variant="Paragraph">
          {subtitle}
        </Text>
      )}
    </Stack>
  )
}

GenericError.propTypes = {
  loadError: PropTypes.object,
  onAnalyticPageview: PropTypes.func.isRequired,
  subtitle: PropTypes.string,
  title: PropTypes.string.isRequired,
}
