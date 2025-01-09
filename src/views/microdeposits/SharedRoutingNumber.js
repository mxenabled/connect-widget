import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { Accounts } from '@kyper/icon/Accounts'
import { Tag } from '@kyper/tag'

import { __ } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { SlideDown } from 'src/components/SlideDown'
import { InstitutionTile } from 'src/components/InstitutionTile'
import { getDelay } from 'src/utilities/getDelay'
import { GoBackButton } from 'src/components/GoBackButton'
import { ActionTile } from 'src/components/ActionTile'
import { fadeOut } from 'src/utilities/Animation'

export const SharedRoutingNumber = (props) => {
  const { continueMicrodeposits, institutions, onGoBack, routingNumber, selectInstitution } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SHARED_ROUTING_NUMBER)
  const containerRef = useRef(null)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <div ref={containerRef} style={styles.container}>
      <SlideDown delay={getNextDelay()}>
        <GoBackButton handleGoBack={onGoBack} />

        <Text component="h2" style={styles.title} truncate={false} variant="H2">
          {__('Select how to connect your account')}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <div style={styles.instantBlock}>
          <Text component="h3" style={styles.subTitle} truncate={false} variant="H3">
            {__('Instant')}
          </Text>
          <Tag size={'small'} title={__('Recommended')} variant={'success'} />
        </div>
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
          <div style={styles.institutions}>
            <InstitutionTile
              institution={institution}
              key={institution.guid}
              selectInstitution={() =>
                fadeOut(containerRef.current, 'up', 300).then(() =>
                  selectInstitution(institution.guid),
                )
              }
              size={32}
            />
          </div>
        </SlideDown>
      ))}

      <SlideDown delay={getNextDelay()}>
        <hr aria-hidden={true} style={styles.hr} />
        <div style={styles.twoToThreeBlock}>
          <Text component="h3" style={styles.subTitle} truncate={false} variant="H3">
            {__('2-3 days')}
          </Text>
          <Tag size={'small'} title={__('Manual')} variant={'warning'} />
        </div>
        <div style={styles.actionTile}>
          <ActionTile
            icon={
              <Accounts
                aria-hidden={true}
                color={tokens.Color.NeutralWhite}
                height={20}
                width={20}
              />
            }
            onSelectAction={(e) =>
              fadeOut(containerRef.current, 'up', 300).then(() => continueMicrodeposits(e))
            }
            subTitle={''}
            title={__('Enter account number')}
          />
        </div>
      </SlideDown>
    </div>
  )
}

const getStyles = (tokens) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'block',
    marginTop: tokens.XSmall,
    marginBottom: tokens.Spacing.Large,
  },
  institutions: {
    marginLeft: '-15px',
    marginRight: '-15px',
  },
  actionTile: {
    marginLeft: `-${tokens.Spacing.Small}px`,
    marginRight: `-${tokens.Spacing.Small}px`,
    marginTop: tokens.Spacing.Tiny,
  },
  subTitle: {
    display: 'block',
    marginBottom: tokens.Spacing.Tiny,
    marginRight: tokens.Spacing.Small,
  },
  hr: {
    marginTop: tokens.Spacing.Small,
  },
  twoToThreeBlock: {
    display: 'flex',
    marginTop: '26px',
  },
  instantBlock: {
    display: 'flex',
    marginBottom: tokens.Spacing.XTiny,
  },
})

SharedRoutingNumber.propTypes = {
  continueMicrodeposits: PropTypes.func.isRequired,
  institutions: PropTypes.array.isRequired,
  onGoBack: PropTypes.func.isRequired,
  routingNumber: PropTypes.string.isRequired,
  selectInstitution: PropTypes.func.isRequired,
}
