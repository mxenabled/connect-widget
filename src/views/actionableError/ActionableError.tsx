import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { InstitutionLogo, Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { Button, Badge } from '@mui/material'

import { actionableErrorCodeMapping } from './consts'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { RootState } from 'src/redux/Store'
import { getCurrentMember } from 'src/redux/selectors/Connect'

export const ActionableError = () => {
  const institution = useSelector((state: RootState) => state.connect.selectedInstitution)
  const currentMember = useSelector(getCurrentMember)
  const errorDetails = useMemo(
    () => actionableErrorCodeMapping[currentMember.most_recent_job_detail_code],
    [currentMember.most_recent_job_detail_code],
  )
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

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
        <Text component="h2" style={styles.title} truncate={false} variant="H2">
          {errorDetails.title}
        </Text>
        <Text component="p" style={styles.paragraph} truncate={false} variant="Paragraph">
          {errorDetails.user_message(institution)}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          fullWidth={true}
          onClick={errorDetails.primaryAction.action}
          style={{ marginBottom: 8 }}
          variant="contained"
        >
          {errorDetails.primaryAction.label}
        </Button>
        {errorDetails.secondaryActions.map((secondaryAction) => (
          <Button
            fullWidth={true}
            key={secondaryAction.label}
            onClick={secondaryAction.action}
            variant="text"
          >
            {secondaryAction.label}
          </Button>
        ))}
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
