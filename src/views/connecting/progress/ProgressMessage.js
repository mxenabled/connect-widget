import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { from, of } from 'rxjs'
import { delay, concatMap, repeat } from 'rxjs/operators'
import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'

import { JOB_TYPES } from 'src/const/consts'

import { __ } from 'src/utilities/Intl'

const subMessages = [
  __('We’re working on it. Stick around!'),
  __('We’re getting closer. Hang tight!'),
  __('Still working. Stay with us!'),
]

export const ProgressMessage = ({ allDone, jobType }) => {
  const tokens = useTokens()
  const styles = {
    messageText: {
      fontWeight: tokens.FontWeight.Semibold,
    },
    subMessageText: {
      fontSize: tokens.FontSize.Small,
    },
  }
  const [subTitle, setSubTitle] = useState('')

  useEffect(() => {
    const messageCycle$ = from(subMessages)
      // space the messages out by 10 seconds
      .pipe(
        concatMap((m) => of(m).pipe(delay(10000))),
        repeat(),
      )
      .subscribe((message) => setSubTitle(message))

    return () => messageCycle$.unsubscribe()
  }, [jobType])

  let mainMessage = __('Syncing your information.')

  if (jobType === JOB_TYPES.VERIFICATION) {
    mainMessage = __('Getting verification data.')
  } else if (jobType === JOB_TYPES.IDENTIFICATION) {
    mainMessage = __('Getting identification data.')
  } else if (allDone) {
    mainMessage = __('Finishing up.')
  }

  return (
    <div>
      <Text bold={true} component="p" style={styles.messageText} truncate={false} variant="Body">
        {mainMessage}
      </Text>
      <Text component="p" style={styles.subMessageText} truncate={false} variant="ParagraphSmall">
        {subTitle}
      </Text>
    </div>
  )
}

ProgressMessage.propTypes = {
  allDone: PropTypes.bool,
  jobType: PropTypes.number,
}
