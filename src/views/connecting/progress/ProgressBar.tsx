import React from 'react'
import { useTokens } from '@kyper/tokenprovider'
import { Spinner } from '@kyper/progressindicators'

import { ProgressLine } from 'src/views/connecting/progress/ProgressLine'
import { ProgressCheckMark } from 'src/views/connecting/progress/ProgressCheckMark'
import { ProgressCircle } from 'src/views/connecting/progress/ProgressCircle'
import { ProgressMessage } from 'src/views/connecting/progress/ProgressMessage'

import * as JobSchedule from 'src/utilities/JobSchedule'
import { ClientLogo } from 'src/components/ClientLogo'
import { useSelector } from 'react-redux'
import { getClientGuid } from 'src/redux/reducers/profilesSlice'
import { ProgressLogo } from './ProgressLogo'
import { InstitutionLogo } from '@mxenabled/mxui'
import { Stack } from '@mui/material'
import { ProgressBackgroundImage } from './ProgressBackgroundImage'

export const ProgressBar = ({
  institution,
  jobSchedule,
}: {
  institution: { guid: string; logo_url: string }
  jobSchedule: { isInitialized: boolean }
}) => {
  const tokens = useTokens()

  const clientGuid = useSelector(getClientGuid)

  const styles = getStyles()

  // if we don't have the schedule initialized just show a spinner.
  if (jobSchedule.isInitialized === false) {
    return (
      <div style={styles.container}>
        <Spinner bgColor="transparent" fgColor={tokens.TextColor.Active} />
      </div>
    )
  }
  const allDone = JobSchedule.areAllJobsDone(jobSchedule)
  const activeJob = JobSchedule.getActiveJob(jobSchedule)

  return (
    <Stack spacing="32px" style={styles.container}>
      <div style={styles.barContainer}>
        <div style={styles.logosContainer}>
          <ProgressLogo>
            <ClientLogo alt="Client logo" clientGuid={clientGuid} size={64} style={styles.logo} />
          </ProgressLogo>
          <ProgressBackgroundImage style={styles.backgroundImage} />
          <ProgressLogo>
            <InstitutionLogo
              alt="Institution logo"
              institutionGuid={institution.guid}
              logoUrl={institution.logo_url}
              size={64}
              style={styles.logo}
            />
          </ProgressLogo>
        </div>
        <ProgressLine isActive={true} />
        <ProgressCheckMark />
        <ProgressLine isActive={true} isCentralLine={true} />
        {activeJob ? <ProgressCircle job={activeJob} /> : <ProgressCheckMark />}
        <ProgressLine isActive={allDone} isCentralLine={true} />
        {allDone ? <ProgressCheckMark /> : <ProgressCircle />}
        <ProgressLine isActive={allDone} />
      </div>
      <ProgressMessage allDone={allDone} jobType={activeJob?.type} />
    </Stack>
  )
}

const getStyles = () => {
  return {
    container: {
      textAlign: 'center' as const,
      width: '100%',
    },
    backgroundImage: {
      height: '80px',
      width: '80px',
      zIndex: 1,
    },
    barContainer: {
      alignItems: 'center',
      display: 'flex',
      height: '80px',
      justifyContent: 'center',
    },
    logo: {
      borderRadius: '8px',
    },
    logosContainer: {
      alignItems: 'center',
      boxSizing: 'border-box' as const,
      display: 'flex',
      justifyContent: 'space-around',
      position: 'absolute' as const,
      width: '100%',
    },
  }
}
