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

  const logoPadding = '28px'
  const backgroundImageHeight = '80px'

  const styles = {
    backgroundImage: {
      height: backgroundImageHeight,
      width: backgroundImageHeight,
      zIndex: 1,
    },
    container: {
      textAlign: 'center',
    },
    barContainer: {
      alignItems: 'center',
      display: 'flex',
      height: backgroundImageHeight,
      justifyContent: 'center',
    },
    logo: { border: 'solid 1px rgba(0, 0, 0, 0.25)', borderRadius: '8px' },
    logosContainer: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: logoPadding,
      paddingRight: logoPadding,
      position: 'absolute',
      width: `calc(100% - ${logoPadding} - ${logoPadding})`,
    },
  } as const

  // if we don't have the schedule initialized just show a spinner.
  if (jobSchedule.isInitialized === false) {
    return (
      <div style={styles.container}>
        <Spinner bgColor="transparent" fgColor={tokens.Color.Brand300} />
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
          <div data-testId="mxLogo" style={styles.backgroundImage}>
            <ProgressBackgroundImage />
          </div>
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
