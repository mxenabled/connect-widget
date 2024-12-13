import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { from, of } from 'rxjs'
import { delay, concatMap, repeat } from 'rxjs/operators'
import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'

import { JOB_TYPES } from 'src/const/consts'

import { __ } from 'src/utilities/Intl'

const subMessages = [
  __('We’re working on it. Stick around!'),
  __('We’re getting closer. Hang tight!'),
  __('Still working. Stay with us!'),
]

export const ProgressMessage = (props) => {
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
  }, [props.job?.type])

  let mainMessage = __('Syncing your information.')

  if (props.job?.type === JOB_TYPES.VERIFICATION) {
    mainMessage = __('Getting verification data.')
  } else if (props.job?.type === JOB_TYPES.IDENTIFICATION) {
    mainMessage = __('Getting identification data.')
  } else if (props.allDone) {
    mainMessage = __('Finishing up.')
  }

  return (
    <div>
      <Text component="p" style={styles.messageText}>
        {mainMessage}
      </Text>
      <Text component="p" style={styles.subMessageText}>
        {subTitle}
      </Text>
    </div>
  )
}

ProgressMessage.propTypes = {
  allDone: PropTypes.bool,
  job: PropTypes.object,
}
