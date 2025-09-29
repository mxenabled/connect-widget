import React, { useContext, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { InstitutionLogo, Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'
import { Button, Badge } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import { PostMessageContext } from 'src/ConnectWidget'
import { useActionableErrorMap } from 'src/views/actionableError/useActionableErrorMap'
import { Support as UntypedSupport, VIEWS as SUPPORT_VIEWS } from 'src/components/support/Support'

import { ACTIONABLE_ERROR_CODES_READABLE } from 'src/views/actionableError/consts'
import { PageviewInfo } from 'src/const/Analytics'
import { getDelay } from 'src/utilities/getDelay'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'

import { RootState } from 'src/redux/Store'
import { getCurrentMember } from 'src/redux/selectors/Connect'

// This is due to trying to forwardRef a component written in JS
const Support = UntypedSupport as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<{
    loadToView: (typeof SUPPORT_VIEWS)[keyof typeof SUPPORT_VIEWS]
    onClose: () => void
  }> &
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.RefAttributes<any>
>

export const ActionableError = () => {
  const supportNavRef = useRef(null)
  const postMessageFunctions = useContext(PostMessageContext)
  const institution = useSelector((state: RootState) => state.connect.selectedInstitution)
  const currentMember = useSelector(getCurrentMember)
  const jobDetailCode = currentMember.error.error_code
  const [name, path] = PageviewInfo.CONNECT_ACTIONABLE_ERROR
  useAnalyticsPath(name, path, {
    error_code: jobDetailCode,
    readable_error: ACTIONABLE_ERROR_CODES_READABLE[jobDetailCode],
  })
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const [showSupport, setShowSupport] = React.useState(false)
  const errorDetails = useActionableErrorMap(jobDetailCode, setShowSupport)

  useEffect(() => {
    // Legacy postMessage for backwards compatibility
    postMessageFunctions.onPostMessage('connect/invalidData', {
      member: {
        guid: currentMember.guid,
        code: jobDetailCode,
      },
    })
  }, [jobDetailCode])

  return showSupport ? (
    <Support
      loadToView={SUPPORT_VIEWS.GENERAL_SUPPORT}
      onClose={() => setShowSupport(false)}
      ref={supportNavRef}
    />
  ) : (
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
          {errorDetails?.title}
        </Text>
        <Text
          component="p"
          data-test="actionable-error-paragraph"
          style={styles.paragraph}
          truncate={false}
          variant="Paragraph"
        >
          {currentMember.error.user_message}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          data-test="actionable-error-primary-button"
          fullWidth={true}
          onClick={errorDetails?.primaryAction.action}
          style={{ marginBottom: 8 }}
          variant="contained"
        >
          {errorDetails?.primaryAction.label}
        </Button>
        <Button
          data-test="actionable-error-secondary-button"
          fullWidth={true}
          onClick={errorDetails?.secondaryActions.action}
          style={{ marginBottom: 8 }}
          variant="text"
        >
          {errorDetails?.secondaryActions.label}
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
