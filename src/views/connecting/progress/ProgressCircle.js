import React from 'react'
import PropTypes from 'prop-types'
import { useTokens } from '@kyper/tokenprovider'
import CircularProgress from '@mui/material/CircularProgress'

import { JOB_STATUSES } from 'src/const/consts'

import { ProgressCheckMark } from 'src/views/connecting/progress/ProgressCheckMark'

export const ProgressCircle = (props) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  if (!props.job) {
    return <div style={styles.circle} />
  }

  const isActive = props.job.status === JOB_STATUSES.ACTIVE
  const isDone = props.job.status === JOB_STATUSES.DONE
  const shouldBeHighlighted = isActive || isDone
  const circleStyle = shouldBeHighlighted
    ? { ...styles.circle, ...styles.activeCircle }
    : { ...styles.circle }

  // Default to an empty circle
  let circleContent = <div style={circleStyle} />

  // If we are active show a spinner in the circle
  if (isActive) {
    circleContent = (
      <div style={circleStyle}>
        <CircularProgress size={16} sx={{ color: tokens.TextColor.Active }} />
      </div>
    )
  } else if (isDone) {
    // If we are done, show a circle/checkmark
    circleContent = <ProgressCheckMark />
  }

  return circleContent
}

const getStyles = (tokens) => {
  return {
    activeCircle: {
      borderColor: tokens.TextColor.Active,
    },
    circle: {
      backgroundColor: tokens.BackgroundColor.Container,
      boxSizing: 'border-box',
      height: '24px',
      width: '24px',
      minWidth: '24px',
      border: `2px solid ${tokens.BackgroundColor.HrDark}`,
      borderRadius: '20px',
      zIndex: 20,
      padding: '2px',
    },
  }
}

ProgressCircle.propTypes = {
  job: PropTypes.object,
}
