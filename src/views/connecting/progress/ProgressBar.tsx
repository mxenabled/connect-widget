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
import styles from './progressBar.module.css'

export const ProgressBar = ({
  institution,
  jobSchedule,
}: {
  institution: { guid: string; logo_url: string }
  jobSchedule: { isInitialized: boolean }
}) => {
  const tokens = useTokens()

  const clientGuid = useSelector(getClientGuid)

  // if we don't have the schedule initialized just show a spinner.
  if (jobSchedule.isInitialized === false) {
    return (
      <div className={styles.container}>
        <Spinner bgColor="transparent" fgColor={tokens.Color.Brand300} />
      </div>
    )
  }
  const allDone = JobSchedule.areAllJobsDone(jobSchedule)
  const activeJob = JobSchedule.getActiveJob(jobSchedule)

  return (
    <Stack className={styles.container} spacing="32px">
      <div className={styles.barContainer}>
        <div className={styles.logosContainer}>
          <ProgressLogo>
            <ClientLogo
              alt="Client logo"
              className={styles.logo}
              clientGuid={clientGuid}
              size={64}
            />
          </ProgressLogo>
          {/* Do we actually need this testId? */}
          <ProgressBackgroundImage className={styles.backgroundImage} data-testId="mxLogo" />
          <ProgressLogo>
            <InstitutionLogo
              alt="Institution logo"
              className={styles.logo}
              institutionGuid={institution.guid}
              logoUrl={institution.logo_url}
              size={64}
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
