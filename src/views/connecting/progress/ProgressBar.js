import React from 'react'
import PropTypes from 'prop-types'
import { useTokens } from '@kyper/tokenprovider'
import { Spinner } from '@kyper/progressindicators'

import { ProgressLine } from 'src/views/connecting/progress/ProgressLine'
import { ProgressCheckMark } from 'src/views/connecting/progress/ProgressCheckMark'
import { ProgressCircle } from 'src/views/connecting/progress/ProgressCircle'
import { ProgressMessage } from 'src/views/connecting/progress/ProgressMessage'

import { JOB_STATUSES } from 'src/const/consts'
import * as JobSchedule from 'src/utilities/JobSchedule'

export const ProgressBar = (props) => {
  const tokens = useTokens()
  const styles = {
    container: {
      margin: `0 auto`,
      maxWidth: '320px', // this is somewhat arbitrary, not based on a token
      textAlign: 'center',
    },
    barContainer: {
      display: 'flex',
      alignItems: 'center',
      margin: `${tokens.Spacing.Large}px auto`,
      justifyContent: 'center',
    },
  }

  // if we don't have the schedule initialized just show a spinner.
  if (props.jobSchedule.isInitialized === false) {
    return (
      <div style={styles.container}>
        <Spinner bgColor="transparent" fgColor={tokens.Color.Brand300} />
      </div>
    )
  }
  const allDone = JobSchedule.areAllJobsDone(props.jobSchedule)
  const activeJob = JobSchedule.getActiveJob(props.jobSchedule)
  // If we have 3+ jobs, space the circles at 16px. Otherwise 24px
  const innerLineWidth = props.jobSchedule.jobs.length >= 3 ? 16 : 24

  return (
    <div style={styles.container}>
      <div style={styles.barContainer}>
        <ProgressLine isActive={true} />
        <ProgressCheckMark />
        {props.jobSchedule.jobs.map((job) => {
          const isActive = job.status === JOB_STATUSES.ACTIVE
          const isDone = job.status === JOB_STATUSES.DONE
          const shouldBeHighlighted = isActive || isDone

          return (
            <React.Fragment key={job.type}>
              <ProgressLine isActive={shouldBeHighlighted} width={innerLineWidth} />
              <ProgressCircle job={job} />
            </React.Fragment>
          )
        })}
        <ProgressLine isActive={allDone} width={innerLineWidth} />
        {allDone ? <ProgressCheckMark /> : <ProgressCircle />}
        <ProgressLine isActive={allDone} />
      </div>
      <ProgressMessage allDone={allDone} job={activeJob} />
    </div>
  )
}

ProgressBar.propTypes = {
  jobSchedule: PropTypes.object.isRequired,
}
