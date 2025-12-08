import React, { useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { css } from '@mxenabled/cssinjs'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { Text as ProtectedText } from 'src/privacy/components'
import { MessageBox } from '@kyper/messagebox'
import { Button } from '@mui/material'

import { PageviewInfo } from 'src/const/Analytics'
import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { SlideDown } from 'src/components/SlideDown'
import {
  MicrodepositsStatuses,
  AccountTypeLabels,
  ReadableStatuses,
} from 'src/views/microdeposits/const'
import { POST_MESSAGES } from 'src/const/postMessages'
import { PostMessageContext } from 'src/ConnectWidget'

export const MicrodepositErrors = ({
  // If a microdeposit fails to create we can access the form data from accountDetails and error
  // from microdepositCreateError. This is needed if we get a network error when attempting to
  // create a new Microdeposit.
  accountDetails,
  microdeposit,
  microdepositCreateError,
  onResetMicrodeposits,
  resetMicrodeposits,
}) => {
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_MICRODEPOSIT_ERRORS)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const postMessageFunctions = useContext(PostMessageContext)
  const isErroredStatus =
    microdeposit?.status === MicrodepositsStatuses.ERRORED ||
    microdepositCreateError?.status === 400

  // Retrieving account number
  const accountNumber =
    microdeposit?.account_number ||
    microdepositCreateError?.data.micro_deposit.account_number ||
    accountDetails?.account_number
  const routingNumber =
    microdeposit?.routing_number ||
    microdepositCreateError?.data.micro_deposit?.routing_number ||
    accountDetails?.routing_number
  const accountType =
    microdeposit?.account_type ||
    microdepositCreateError?.data.micro_deposit.account_type ||
    accountDetails?.account_type

  const getTitle = () => {
    if (microdeposit.status === MicrodepositsStatuses.PREVENTED) {
      return __('Account not connected')
    } else {
      return __('Something went wrong')
    }
  }
  const getMessage = () => {
    if (microdeposit.status === MicrodepositsStatuses.PREVENTED) {
      return __("This account can't be connected. There were too many failed attempts.")
    } else if (isErroredStatus) {
      return __(
        'We’re unable to connect this account. Please review the account details you submitted.',
      )
    } else {
      return __('We’re unable to connect this account. Please try again later.')
    }
  }
  const handleContinue = () => {
    if (
      [MicrodepositsStatuses.PREVENTED, MicrodepositsStatuses.REJECTED].includes(
        microdeposit.status,
      )
    ) {
      postMessageFunctions.onPostMessage('connect/microdeposits/error/primaryAction', {
        status: ReadableStatuses[microdeposit.status],
        guid: microdeposit.guid,
      })

      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)
    }

    return fadeOut(containerRef.current, 'down').then(
      // If ERRORRED/accountDetails view, it should step to Account Info
      // Else, resetMicrodeposits which returns user to Connect Institution Search
      isErroredStatus ? resetMicrodeposits : onResetMicrodeposits,
    )
  }

  return (
    <div ref={containerRef}>
      <SlideDown>
        <div style={styles.header}>
          <Text component="h2" style={styles.title} truncate={false} variant="h2">
            {getTitle()}
          </Text>
        </div>

        <MessageBox style={styles.messageBox} variant="error">
          <Text component="p" role="alert" truncate={false} variant="subtitle1">
            {getMessage()}
          </Text>
        </MessageBox>
      </SlideDown>

      <SlideDown delay={100}>
        <div className={css(styles.infoRow)}>
          <div style={styles.textGroup}>
            <Text style={styles.rowHeader} truncate={false} variant="body2">
              {__('Account type')}
            </Text>
            <Text bold={true} style={styles.rowValue} truncate={false} variant="body1">
              {accountType ? AccountTypeLabels[accountType] : '-'}
            </Text>
          </div>
        </div>
        <div className={css(styles.infoRow)}>
          <div style={styles.textGroup}>
            <Text style={styles.rowHeader} truncate={false} variant="body2">
              {__('Routing number')}
            </Text>
            <ProtectedText bold={true} style={styles.rowValue} truncate={false} variant="body1">
              {routingNumber || '-'}
            </ProtectedText>
          </div>
        </div>
        <div className={css(styles.infoRow)}>
          <div style={styles.textGroup}>
            <Text style={styles.rowHeader} truncate={false} variant="body2">
              {__('Account number')}
            </Text>
            <ProtectedText bold={true} style={styles.rowValue} truncate={false} variant="body1">
              {accountNumber ? `•••• ${accountNumber.substr(-4)}` : '-'}
            </ProtectedText>
          </div>
        </div>
      </SlideDown>

      <SlideDown delay={200}>
        <Button fullWidth={true} onClick={handleContinue} style={styles.button} variant="contained">
          {isErroredStatus ? __('Edit details') : __('Continue')}
        </Button>
        {isErroredStatus && (
          <Button
            fullWidth={true}
            onClick={() => fadeOut(containerRef.current, 'down').then(onResetMicrodeposits)}
            style={styles.button}
            variant="outlined"
          >
            {__('Connect a different account')}
          </Button>
        )}
      </SlideDown>
    </div>
  )
}

const getStyles = (tokens) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: tokens.Spacing.XSmall,
  },
  messageBox: {
    marginBottom: tokens.Spacing.Small,
  },
  infoRow: {
    alignItems: 'center',
    borderBottom: `1px solid ${tokens.Color.Neutral300}`,
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${tokens.Spacing.Small}px 0`,
    '&:last-of-type': {
      marginBottom: tokens.Spacing.Medium,
    },
  },
  textGroup: {
    display: 'flex',
    flowGrow: 1,
    flexDirection: 'column',
  },
  rowHeader: {
    color: tokens.TextColor.InputLabel,
  },
  rowValue: {
    overflowWrap: 'anywhere',
  },
  button: {
    display: 'inline-flex',
    marginTop: tokens.Spacing.Medium,
  },
})

MicrodepositErrors.propTypes = {
  accountDetails: PropTypes.object,
  microdeposit: PropTypes.object,
  microdepositCreateError: PropTypes.object,
  onResetMicrodeposits: PropTypes.func.isRequired,
  resetMicrodeposits: PropTypes.func.isRequired,
}
