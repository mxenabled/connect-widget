import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { defer } from 'rxjs'
import { useSelector } from 'react-redux'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'

import { AccountFields } from 'src/views/microdeposits/const'
import { AccountTypeLabels } from 'src/views/microdeposits/const'
import { SlideDown } from 'src/components/SlideDown'
import { DetailReviewItem } from 'src/components/DetailReviewItem'

import { getDelay } from 'src/utilities/getDelay'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { fadeOut } from 'src/utilities/Animation'
import { POST_MESSAGES } from 'src/const/postMessages'
import { useApi } from 'src/context/ApiContext'

import { selectIsMobileWebView } from 'src/redux/reducers/configSlice'
import { AnalyticContext } from 'src/Connect'
import { PostMessageContext } from 'src/ConnectWidget'

export const ConfirmDetails = (props) => {
  const { accountDetails, currentMicrodeposit, onEditForm, onError, onSuccess } = props
  const { api } = useApi()
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_CONFIRM_DETAILS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const is_mobile_webview = useSelector(selectIsMobileWebView)
  const user_guid = useSelector((state) => state.profiles.user.guid)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const analyticFunctions = useContext(AnalyticContext)
  const postMessageFunctions = useContext(PostMessageContext)

  useEffect(() => {
    if (!isSubmitting) return () => {}
    let stream$

    if (currentMicrodeposit.guid) {
      // If we have a microdeposit guid, we're updating an existing microdeposit
      stream$ = defer(() => {
        const { account_number, account_type, routing_number } = accountDetails

        return api.updateMicrodeposit(currentMicrodeposit.guid, {
          account_name: getAccountNickname(accountDetails),
          account_number,
          account_type,
          routing_number,
          user_guid,
        })
      })
    } else {
      // If we don't, we're creating a new microdeposit
      stream$ = defer(() =>
        api.createMicrodeposit({
          ...accountDetails,
          account_name: getAccountNickname(accountDetails),
          user_guid,
        }),
      )
    }

    const subscription = stream$.subscribe(
      (response) =>
        fadeOut(containerRef.current, 'up', 300).then(() => {
          postMessageFunctions.onPostMessage(POST_MESSAGES.MICRODEPOSIT_DETAILS_SUBMITTED, {
            microdeposit_guid: response.micro_deposit.guid,
          })

          analyticFunctions.onAnalyticEvent(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
            type: is_mobile_webview ? 'url' : 'message',
          })
          setIsSubmitting(false)
          return onSuccess(response.micro_deposit)
        }),
      (err) => {
        setIsSubmitting(false)
        return fadeOut(containerRef.current, 'up', 300).then(() => onError(err.response))
      },
    )

    return () => subscription.unsubscribe()
  }, [isSubmitting])

  useEffect(() => {
    const handleFocus = (event) => {
      const focusedElement = event.target

      if (containerRef.current && focusedElement) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const elementRect = focusedElement.getBoundingClientRect()

        // Get the height of the sticky header (if any)
        const stickyHeader = document.querySelector('[data-test="navigation-header"]')
        const stickyHeaderHeight = stickyHeader ? stickyHeader.offsetHeight : 0

        // Check if the focused element is above or below the visible area of the container
        if (
          elementRect.top < containerRect.top + stickyHeaderHeight || // Account for sticky header
          elementRect.bottom > containerRect.bottom
        ) {
          focusedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })

          // Adjust scroll position to account for sticky header
          if (stickyHeaderHeight > 0) {
            window.scrollBy(0, -stickyHeaderHeight)
          }
        }
      }
    }

    // Attach focus event listener
    containerRef.current?.addEventListener('focusin', handleFocus)

    return () => {
      // Cleanup event listener
      containerRef.current?.removeEventListener('focusin', handleFocus)
    }
  }, [containerRef])

  const handleEdit = (focus) =>
    fadeOut(containerRef.current, 'up', 300).then(() => onEditForm(focus))

  return (
    <div ref={containerRef}>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.header}>
          <Text
            component="h2"
            data-test="title-header"
            style={styles.title}
            truncate={false}
            variant="H2"
          >
            {__('Review your information')}
          </Text>
        </div>
      </SlideDown>

      {props.shouldShowUserDetails && (
        <SlideDown delay={getNextDelay()}>
          <DetailReviewItem
            ariaButtonLabel={__('Edit first and last name')}
            data-test="first-last-name-row"
            isEditable={isSubmitting}
            label={__('First and last name')}
            onEditClick={() => handleEdit(AccountFields.USER_NAME)}
            value={`${accountDetails.first_name} ${accountDetails.last_name}`}
          />

          <DetailReviewItem
            ariaButtonLabel={__('Edit email')}
            data-test="email-row"
            isEditable={isSubmitting}
            label={__('Email')}
            onEditClick={() => handleEdit(AccountFields.EMAIL)}
            value={accountDetails.email}
          />
        </SlideDown>
      )}

      <SlideDown delay={getNextDelay()}>
        <DetailReviewItem
          ariaButtonLabel={__('Edit routing number')}
          data-test="routing-number-row"
          isEditable={isSubmitting}
          label={__('Routing number')}
          onEditClick={() => handleEdit(AccountFields.ROUTING_NUMBER)}
          value={accountDetails.routing_number}
        />

        <DetailReviewItem
          ariaButtonLabel={__('Edit account type')}
          data-test="account-type-row"
          isEditable={isSubmitting}
          label={__('Account type')}
          onEditClick={() => handleEdit(AccountFields.ACCOUNT_TYPE)}
          value={AccountTypeLabels[accountDetails.account_type]}
        />

        <DetailReviewItem
          ariaButtonLabel={__('Edit account number')}
          data-test="account-number-row"
          isEditable={isSubmitting}
          label={__('Account number')}
          onEditClick={() => handleEdit(AccountFields.ACCOUNT_NUMBER)}
          value={accountDetails.account_number}
        />
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text
          data-test="disclaimer-paragraph"
          style={styles.disclaimer}
          truncate={false}
          variant="ParagraphSmall"
        >
          {__(
            'By clicking Confirm, I authorize this app’s service provider, Dwolla, Inc., to originate credits and debits to the checking or savings account identified above for the purposes of micro-deposit verification. This authorization may be revoked at any time by notifying your institution in writing.',
          )}
        </Text>
        <Button
          data-test="confirm-button"
          disabled={isSubmitting}
          fullWidth={true}
          onClick={() => setIsSubmitting(true)}
          style={styles.button}
          variant="contained"
        >
          {isSubmitting ? `${__('Sending')}...` : __('Confirm')}
        </Button>
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
  institutionGroup: {
    alignItems: 'center',
    display: 'flex',
  },
  institutionGrid: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: tokens.Spacing.Small,
  },
  disclaimer: {
    color: tokens.TextColor.Secondary,
    display: 'block',
    marginTop: tokens.Spacing.Medium,
  },
  button: {
    marginTop: tokens.Spacing.Medium,
  },
})

ConfirmDetails.propTypes = {
  accountDetails: PropTypes.object,
  currentMicrodeposit: PropTypes.object,
  onEditForm: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  shouldShowUserDetails: PropTypes.bool,
}

// Ex default account_name: Checking (...1234)
const getAccountNickname = (accountDetails) => {
  const lastFour = accountDetails.account_number.slice(-4)
  const formattedAccountType = AccountTypeLabels[accountDetails.account_type]

  return `${formattedAccountType} ...${lastFour}`
}
