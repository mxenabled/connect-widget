import React, { useMemo } from 'react'
import Button from '@mui/material/Button'
import { Text, Icon } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import styles from 'src/ReturnUserExperience/returnUserExperience.module.css'

export const RuxInfo = ({ handleRuxContinue }: { handleRuxContinue: () => void }) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_RUX_INFO)
  const informationClusters = useMemo(
    () => [
      {
        icon: 'verified_user',
        title: __('Trusted'),
        description: __('Used by over 13,000 banks & credit unions.'),
      },
      {
        icon: 'lock',
        title: __('Secure'),
        description: __('Protected with multi-factor authentication and encryption.'),
      },
      {
        icon: 'notifications_off',
        title: __('Private'),
        description: __('We never sell your phone number or use it for marketing.'),
      },
    ],
    [],
  )

  return (
    <>
      <div className={styles.infoContainer}>
        {informationClusters.map((info, index) => (
          <div className={styles.infoRow} key={index}>
            <div className={styles.avatar}>
              <Icon color="primary" fill={true} name={info.icon} size={24} />
            </div>

            <div className={styles.infoRowContent}>
              <Text bold={true}>{info.title}</Text>
              <Text truncate={false} variant="caption">
                {info.description}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <Button fullWidth={true} onClick={handleRuxContinue} variant="contained">
        {__('Continue')}
      </Button>
    </>
  )
}

export default RuxInfo
