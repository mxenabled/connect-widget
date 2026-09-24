import React from 'react'
import PropTypes from 'prop-types'

import { Stack } from '@mui/material'
import { Icon, Text } from '@mxenabled/mxui'

import { ReadableStatuses } from 'src/const/Statuses'
import styles from 'src/components/ViewTitle.module.css'

type ViewTitleProps = {
  connectionStatus?: number
  title: string
}

export const ViewTitle = ({ connectionStatus, title }: ViewTitleProps) => {
  return (
    <Stack
      alignItems="center"
      className={styles.container}
      direction="row"
      justifyContent="space-between"
    >
      <Text bold={true} component="h1" data-test="title-text" truncate={false} variant="h2">
        {title}
      </Text>
      {connectionStatus &&
        [ReadableStatuses.DEGRADED, ReadableStatuses.REJECTED].includes(connectionStatus) && (
          <Icon color="error" fill={true} name="error" size={24} />
        )}
    </Stack>
  )
}

ViewTitle.propTypes = {
  connectionStatus: PropTypes.number,
  title: PropTypes.string.isRequired,
}
