import React from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import { Text, Icon } from '@mxenabled/mxui'
import { MXLogoCopyrightIcon } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'
import styles from './returnUserExperience.module.css'

export const RuxInfo = ({ handleRuxContinue }: { handleRuxContinue: () => void }) => {
  return (
    <>
      <div className={styles.infoContainer}>
        <div className={styles.infoRow}>
          <Avatar sx={{ height: '48px', width: '48px' }} variant="rounded">
            <Icon color="primary" fill={true} name="verified_user" size={24} />
          </Avatar>
          <div className={styles.infoRowContent}>
            <Text bold={true} variant="body1">
              {__('Trusted')}
            </Text>
            <Text truncate={false} variant="caption">
              {__('Used by over 13,000 banks & credit unions.')}
            </Text>
          </div>
        </div>

        <div className={styles.infoRow}>
          <Avatar sx={{ height: '48px', width: '48px' }} variant="rounded">
            <Icon color="primary" fill={true} name="lock" size={24} />
          </Avatar>
          <div className={styles.infoRowContent}>
            <Text bold={true} variant="body1">
              {__('Secure')}
            </Text>
            <Text truncate={false} variant="caption">
              {__('Protected with multi-factor authentication and encryption.')}
            </Text>
          </div>
        </div>

        <div className={styles.infoRow}>
          <Avatar sx={{ height: '48px', width: '48px' }} variant="rounded">
            <Icon color="primary" fill={true} name="notifications_off" size={24} />
          </Avatar>
          <div className={styles.infoRowContent}>
            <Text bold={true} variant="body1">
              {__('Private')}
            </Text>
            <Text truncate={false} variant="caption">
              {__('We never sell your phone number or use it for marketing.')}
            </Text>
          </div>
        </div>
      </div>

      <Button
        endIcon={<MXLogoCopyrightIcon size={32} />}
        fullWidth={true}
        onClick={handleRuxContinue}
        variant="contained"
      >
        {__('Continue')}
      </Button>
    </>
  )
}

export default RuxInfo
