import React from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'

import { __ } from 'src/utilities/Intl'

import { Text, Icon } from '@mxenabled/mxui'
import { Button, Stack } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import { GoBackButtonHeader } from 'src/components/GoBackButtonHeader'

import { getDelay } from 'src/utilities/getDelay'
import styles from 'src/components/LeavingNoticeFlat.module.css'

export const LeavingNoticeFlat = ({ onContinue, onCancel, portalTo = 'connect-wrapper' }) => {
  const getNextDelay = getDelay()

  return createPortal(
    <div className={styles.container} role="alert">
      <div className={styles.content}>
        <SlideDown delay={getNextDelay()}>
          <GoBackButtonHeader handleGoBack={onCancel} />
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          <Stack spacing={2}>
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Text
                component="h2"
                data-test="leaving-notice-flat-header"
                truncate={false}
                variant="H2"
              >
                {__('You are leaving')}
              </Text>
              <Icon color="error" fill={true} name="error" size={24} />
            </Stack>
            <Text
              component="p"
              data-test="leaving-notice-flat-paragraph1"
              truncate={false}
              variant="Paragraph"
            >
              {__(
                'Selecting Continue will take you to an external website with a different privacy policy, security measures, and terms and conditions.',
              )}
            </Text>
          </Stack>
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          <Stack className={styles.buttons} spacing={1}>
            <Button
              autoFocus={true}
              data-test="leaving-notice-flat-continue-button"
              fullWidth={true}
              onClick={onContinue}
              variant="contained"
            >
              {__('Continue')}
            </Button>
            <Button
              data-test="leaving-notice-flat-cancel-button"
              fullWidth={true}
              onClick={onCancel}
              variant="text"
            >
              {__('Cancel')}
            </Button>
          </Stack>
        </SlideDown>
      </div>
    </div>,
    document.getElementById(portalTo),
  )
}

LeavingNoticeFlat.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
}
