import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'
import { ActionTypes } from 'src/redux/actions/Connect'

import { getCurrentMember, getSelectedInstitution } from 'src/redux/selectors/Connect'

import { AriaLive } from 'src/components/AriaLive'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { AnalyticEvents, AuthenticationMethods } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { PostMessageContext } from 'src/ConnectWidget'

export const NoEligibleAccounts = () => {
  const sendAnalyticsEvent = useAnalyticsEvent()
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const postMessageFunctions = useContext(PostMessageContext)
  const dispatch = useDispatch()

  const currentMember = useSelector(getCurrentMember)
  const selectedInstitution = useSelector(getSelectedInstitution)

  const postHogEventMetadata = {
    authentication_method: currentMember.is_oauth
      ? AuthenticationMethods.OAUTH
      : AuthenticationMethods.NON_OAUTH,
    institution_guid: selectedInstitution.guid,
    institution_name: selectedInstitution.name,
  }

  const getNextDelay = getDelay()

  return (
    <React.Fragment>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.headerContianer}>
          <Text
            component="h2"
            data-test="no-eligible-accounts-header"
            style={styles.headerText}
            truncate={false}
            variant="H2"
          >
            {__('Accounts not eligible for transfers')}
          </Text>
          <AttentionFilled
            color={tokens.Color.Error300}
            height={tokens.Spacing.Large}
            styles={styles.icon}
            width={tokens.Spacing.Large}
          />
        </div>
      </SlideDown>
      <Text
        component="p"
        data-test="no-eligible-accounts-paragraph"
        style={styles.paragraphOne}
        truncate={false}
        variant={'Paragraph'}
      >
        {__(
          "We've connected to your financial institution, but couldn't find eligible checking or savings accounts for money movement; however, other account information may still have been shared.",
        )}
      </Text>
      <Text
        component="p"
        data-test="no-eligible-accounts-paragraph-two"
        style={styles.paragraphTwo}
        truncate={false}
        variant="Paragraph"
      >
        {__('Please try linking a checking or savings account.')}
      </Text>

      <div>
        <Button
          aria-label={__('Try again')}
          data-test="try-again-button"
          onClick={() => {
            sendAnalyticsEvent(AnalyticEvents.NO_ELIGIBLE_ACCOUNTS_RETRY, postHogEventMetadata)

            postMessageFunctions.onPostMessage('connect/invalidData/primaryAction', {
              memberGuid: currentMember.guid,
            })

            postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)

            dispatch({ type: ActionTypes.RESET_WIDGET_NO_ELIGIBLE_ACCOUNTS })
          }}
          style={styles.tryAgainButton}
        >
          {__('Try again')}
        </Button>
      </div>

      <AriaLive
        level="assertive"
        message="We've connected to your financial institution, but couldn't find eligible checking or savings accounts for money movement; however, other account information may still have been shared. Please try linking a checking or savings account."
        timeout={100}
      />
    </React.Fragment>
  )
}

const getStyles = (tokens) => {
  return {
    headerText: {
      fontWeight: tokens.FontWeight.Bold,
    },
    headerContianer: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      marginLeft: tokens.Spacing.Small,
    },
    paragraphOne: {
      fontWeight: tokens.FontWeight.Regular,
      fontSize: tokens.FontSize.Small,
      marginTop: tokens.Spacing.XSmall,
    },
    paragraphTwo: {
      fontWeight: tokens.FontWeight.Regular,
      fontSize: tokens.FontSize.Small,
      marginTop: tokens.Spacing.Medium,
    },
    tryAgainButton: {
      background: tokens.BackgroundColor.ButtonPrimary,
      color: tokens.Color.NeutralWhite,
      marginTop: tokens.Spacing.XLarge,
      borderRadius: tokens.BorderRadius.Medium,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 16px',
      gap: '10px',
      height: '44px',
      width: '100%',
    },
  }
}

NoEligibleAccounts.propTypes = {}

export default NoEligibleAccounts
