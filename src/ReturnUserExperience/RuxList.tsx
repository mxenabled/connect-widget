import React from 'react'
import Stack from '@mui/material/Stack'
import { Text } from '@mxenabled/mxui'
import { Icon } from '@mxenabled/mxui'
import Button from '@mui/material/Button'

import { __ } from 'src/utilities/Intl'
import styles from './returnUserExperience.module.css'

export const RuxList = () => {
  return (
    <>
      <Text variant="h2">{__('Select your institution')}</Text>
      <Text variant="subtitle1">
        {__('Choose a previously connected institution or add a new one.')}
      </Text>

      {/* Connections list goes here */}
      <p>Connections list goes here</p>

      <Stack className={styles.buttonContainer} spacing="8px">
        <Button variant="outlined">
          <Icon name="plus" /> {__('Connect new institution')}
        </Button>
        <Text variant="subtitle2">
          {__('Disconnect accounts from MX anytime by contacting support.')}
        </Text>
      </Stack>
    </>
  )
}

export default RuxList
