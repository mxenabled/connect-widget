import React, { useContext, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { InstitutionLogo, Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { Button, Badge } from '@mui/material'

import { ACTIONABLE_ERROR_CODES } from './consts'
import { __ } from 'src/utilities/Intl'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { RootState } from 'src/redux/Store'
import { getCurrentMember } from 'src/redux/selectors/Connect'
import { ActionTypes } from 'src/redux/actions/Connect'
import { PostMessageContext } from 'src/ConnectWidget'

export const ActionableError = () => {
  const postMessageFunctions = useContext(PostMessageContext)
  const institution = useSelector((state: RootState) => state.connect.selectedInstitution)
  const currentMember = useSelector(getCurrentMember)
  const jobDetailCode = currentMember.most_recent_job_detail_code
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const dispatch = useDispatch()

  // AED Step 3: Add code mapping for new codes here
  const messagingMap = useMemo(
    () => ({
      [ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS]: {
        title: __('No eligible accounts'),
        userMessage: (institution: InstitutionResponseType) =>
          __(
            'Only checking or savings accounts can be used for transfers. If you have one at %1, make sure to select it when connecting. Otherwise, try connecting a different institution.',
            institution.name,
          ),
        primaryAction: {
          label: __('Log in again'),
          action: () => dispatch({ type: ActionTypes.ACTIONABLE_ERROR_LOG_IN_AGAIN }),
        },
        secondaryActions: {
          label: __('Connect a different institution'),
          action: () => {
            postMessageFunctions.onPostMessage('connect/backToSearch')
            dispatch({ type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION })
          },
        },
      },
    }),
    [dispatch],
  )

  useEffect(() => {
    // Legacy postMessage for backwards compatibility
    postMessageFunctions.onPostMessage('connect/invalidData', {
      member: {
        guid: currentMember.guid,
        code: jobDetailCode,
      },
    })
  }, [jobDetailCode])

  return (
    <>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.logoWrapper}>
          <Badge badgeContent="!" color="error" sx={styles.badge}>
            <InstitutionLogo
              alt={`${institution.name} logo`}
              institutionGuid={institution.guid}
              size={64}
            />
          </Badge>
        </div>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text
          component="h2"
          data-test="actionable-error-header"
          style={styles.title}
          truncate={false}
          variant="H2"
        >
          {messagingMap[jobDetailCode].title}
        </Text>
        <Text
          component="p"
          data-test="actionable-error-paragraph"
          style={styles.paragraph}
          truncate={false}
          variant="Paragraph"
        >
          {messagingMap[jobDetailCode].userMessage(institution)}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          data-test="actionable-error-primary-button"
          fullWidth={true}
          onClick={messagingMap[jobDetailCode].primaryAction.action}
          style={{ marginBottom: 8 }}
          variant="contained"
        >
          {messagingMap[jobDetailCode].primaryAction.label}
        </Button>
        <Button
          data-test="actionable-error-secondary-button"
          fullWidth={true}
          onClick={messagingMap[jobDetailCode].secondaryActions.action}
          style={{ marginBottom: 8 }}
          variant="text"
        >
          {messagingMap[jobDetailCode].secondaryActions.label}
        </Button>
      </SlideDown>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => ({
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: tokens.Spacing.XLarge,
    marginTop: 20,
    width: '100%',
  },
  badge: {
    '& .MuiBadge-badge': {
      fontWeight: 'bold',
      borderRadius: '100%',
      border: `2px solid ${tokens.BackgroundColor.Container}`,
      fontSize: tokens.FontSize.H3,
      margin: tokens.Spacing.Tiny,
      height: tokens.Spacing.Large + tokens.Spacing.Tiny,
      width: tokens.Spacing.Large + tokens.Spacing.Tiny,
    },
  },
  title: {
    marginBottom: tokens.Spacing.Tiny,
    textAlign: 'center' as const,
  },
  paragraph: {
    marginBottom: tokens.Spacing.XLarge,
    textAlign: 'center' as const,
  },
})
