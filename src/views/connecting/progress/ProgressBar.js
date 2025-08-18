import React from 'react'
import PropTypes from 'prop-types'
import { useTokens } from '@kyper/tokenprovider'
import { Spinner } from '@kyper/progressindicators'

import { ProgressLine } from 'src/views/connecting/progress/ProgressLine'
import { ProgressCheckMark } from 'src/views/connecting/progress/ProgressCheckMark'
import { ProgressCircle } from 'src/views/connecting/progress/ProgressCircle'
import { ProgressMessage } from 'src/views/connecting/progress/ProgressMessage'

import * as JobSchedule from 'src/utilities/JobSchedule'
import { ConnectBackgroundImage } from 'src/components/ConnectBackgroundImage'

export const ProgressBar = (props) => {
  const tokens = useTokens()
  const styles = {
    backgroundImage: {
      height: 80,
      position: 'absolute',
      width: 80,
      zIndex: 1,
    },
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

  return (
    <div style={styles.container}>
      <div style={styles.barContainer}>
        <div data-testId="mxLogo" style={styles.backgroundImage}>
          <ConnectBackgroundImage />
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
    </div>
  )
}

ProgressBar.propTypes = {
  jobSchedule: PropTypes.object.isRequired,
}
