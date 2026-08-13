import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { InstitutionLogo, Text } from '@mxenabled/mxui'
import { Button, Badge, Stack } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import { PostMessageContext } from 'src/ConnectWidget'
import { useActionableErrorMap } from 'src/views/actionableError/useActionableErrorMap'
import styles from 'src/views/actionableError/ActionableError.module.css'

import { ACTIONABLE_ERROR_CODES_READABLE } from 'src/views/actionableError/consts'
import { PageviewInfo } from 'src/const/Analytics'
import { getDelay } from 'src/utilities/getDelay'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'

import { RootState } from 'src/redux/Store'
import { getCurrentMember } from 'src/redux/selectors/Connect'

export const ActionableError = () => {
  const postMessageFunctions = useContext(PostMessageContext)
  const institution = useSelector((state: RootState) => state.connect.selectedInstitution)
  const currentMember = useSelector(getCurrentMember)
  const jobDetailCode = currentMember.error.error_code
  const [name, path] = PageviewInfo.CONNECT_ACTIONABLE_ERROR
  useAnalyticsPath(name, path, {
    error_code: jobDetailCode,
    readable_error: ACTIONABLE_ERROR_CODES_READABLE[jobDetailCode],
  })
  const getNextDelay = getDelay()
  const errorDetails = useActionableErrorMap(jobDetailCode)

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
    <Stack spacing={4}>
      <SlideDown delay={getNextDelay()}>
        <Stack alignItems="center" className={styles.logoWrapper}>
          <Badge badgeContent="!" className={styles.badge} color="error">
            <InstitutionLogo
              alt={`${institution.name} logo`}
              institutionGuid={institution.guid}
              size={64}
            />
          </Badge>
        </Stack>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Stack className={styles.textGroup} spacing={0.5}>
          <Text component="h2" data-test="actionable-error-header" truncate={false} variant="H2">
            {errorDetails?.title}
          </Text>
          <Text
            component="p"
            data-test="actionable-error-paragraph"
            truncate={false}
            variant="Paragraph"
          >
            {errorDetails?.userMessage || currentMember.error.user_message}
          </Text>
        </Stack>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Stack className={styles.buttons} spacing={1}>
          <Button
            data-test="actionable-error-primary-button"
            fullWidth={true}
            onClick={errorDetails?.primaryAction.action}
            variant="contained"
          >
            {errorDetails?.primaryAction.label}
          </Button>
          {errorDetails?.secondaryActions && (
            <Button
              data-test="actionable-error-secondary-button"
              fullWidth={true}
              onClick={errorDetails?.secondaryActions.action}
              variant="text"
            >
              {errorDetails?.secondaryActions.label}
            </Button>
          )}
        </Stack>
      </SlideDown>
    </Stack>
  )
}
