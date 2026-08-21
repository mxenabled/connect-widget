import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import { Text, Icon } from '@mxenabled/mxui'
import { Stack } from '@mui/material'
import { Tag } from '@kyper/tag'

import { __ } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { SlideDown } from 'src/components/SlideDown'
import { InstitutionTile } from 'src/components/InstitutionTile'
import { getDelay } from 'src/utilities/getDelay'
import { GoBackButtonHeader } from 'src/components/GoBackButtonHeader'
import { ActionTile } from 'src/components/ActionTile'
import { fadeOut } from 'src/utilities/Animation'

import styles from 'src/views/microdeposits/SharedRoutingNumber.module.css'

export const SharedRoutingNumber = (props) => {
  const { continueMicrodeposits, institutions, onGoBack, routingNumber, selectInstitution } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SHARED_ROUTING_NUMBER)
  const containerRef = useRef(null)
  const getNextDelay = getDelay()

  return (
    <Stack ref={containerRef}>
      <SlideDown delay={getNextDelay()}>
        <GoBackButtonHeader handleGoBack={onGoBack} />

        <Text className={styles.title} component="h2" truncate={false} variant="H2">
          {__('Select how to connect your account')}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Stack alignItems="center" className={styles.instantBlock} direction="row" spacing={1.5}>
          <Text className={styles.subTitle} component="h3" truncate={false} variant="H3">
            {__('Instant')}
          </Text>
          <Tag size={'small'} title={__('Recommended')} variant={'success'} />
        </Stack>
        <Text truncate={false} variant="Paragraph">
          {
            // --TR: Securely log into your account. We found {count} institutions with routing number {routing_number}.
            __(
              'Securely log into your account. We found %1 institutions with routing number %2',
              institutions.length,
              routingNumber,
            )
          }
        </Text>
      </SlideDown>

      {institutions.map((institution) => (
        <SlideDown delay={getNextDelay()} key={institution.guid}>
          <div className={styles.institutions}>
            <InstitutionTile
              institution={institution}
              key={institution.guid}
              selectInstitution={() => selectInstitution(institution)}
              size={32}
            />
          </div>
        </SlideDown>
      ))}

      <SlideDown delay={getNextDelay()}>
        <hr aria-hidden={true} className={styles.hr} />
        <Stack alignItems="center" className={styles.twoToThreeBlock} direction="row" spacing={1.5}>
          <Text className={styles.subTitle} component="h3" truncate={false} variant="H3">
            {__('2-3 days')}
          </Text>
          <Tag size={'small'} title={__('Manual')} variant={'warning'} />
        </Stack>
        <div className={styles.actionTile}>
          <ActionTile
            icon={<Icon aria-hidden={true} name="account_balance" size="20" />}
            onSelectAction={(e) =>
              fadeOut(containerRef.current, 'up', 300).then(() => continueMicrodeposits(e))
            }
            subTitle={''}
            title={__('Enter account number')}
          />
        </div>
      </SlideDown>
    </Stack>
  )
}

SharedRoutingNumber.propTypes = {
  continueMicrodeposits: PropTypes.func.isRequired,
  institutions: PropTypes.array.isRequired,
  onGoBack: PropTypes.func.isRequired,
  routingNumber: PropTypes.string.isRequired,
  selectInstitution: PropTypes.func.isRequired,
}
