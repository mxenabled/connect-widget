import React from 'react'
import PropTypes from 'prop-types'

import { Stack } from '@mui/material'
import { Icon, Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'
import { InfoFilled } from '@kyper/icon/InfoFilled'

import { ReadableStatuses } from 'src/const/Statuses'
import styles from 'src/components/ViewTitle.module.css'

export const ViewTitle = ({ connectionStatus, title }) => {
  const tokens = useTokens()

  return (
    <Stack
      alignItems="center"
      className={styles.container}
      direction="row"
      justifyContent="space-between"
    >
      <Text bold={true} component="h1" data-test="title-text" truncate={false} variant="H2">
        {title}
      </Text>
      {connectionStatus === ReadableStatuses.DEGRADED && (
        <InfoFilled color={tokens.BackgroundColor.MessageBoxHelp} size={24} />
      )}
      {connectionStatus === ReadableStatuses.REJECTED && (
        <Icon color="error" fill={true} name="error" size={24} />
      )}
    </Stack>
  )
}

ViewTitle.propTypes = {
  connectionStatus: PropTypes.number,
  title: PropTypes.string.isRequired,
}
