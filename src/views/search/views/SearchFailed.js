import React from 'react'

import { Stack } from '@mui/material'
import { Icon, Text } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import styles from 'src/views/search/views/SearchFailed.module.css'

export const SearchFailed = () => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH_FAILED)

  return (
    <Stack alignItems="flex-start" className={styles.container} direction="row">
      <Stack alignItems="center" className={styles.iconContainer} justifyContent="center">
        <Icon fill={true} name="error" size={24} />
      </Stack>
      <Stack className={styles.textContainer}>
        <Text bold={true} truncate={false} variant="Paragraph">
          {__('Search isn’t working')}
        </Text>
        <Text truncate={false} variant="ParagraphSmall">
          {__('Something went wrong. Please try again.')}
        </Text>
      </Stack>
    </Stack>
  )
}
