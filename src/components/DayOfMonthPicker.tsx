import React, { MutableRefObject } from 'react'

import _range from 'lodash/range'

import { Button, Stack } from '@mui/material'
import { Text } from '@mxenabled/mxui'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'

import { GoBackButtonHeader } from 'src/components/GoBackButtonHeader'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'

import styles from './DayOfMonthPicker.module.css'

interface DayOfMonthPicker {
  handleClose: () => void
  handleSelect: (e: React.MouseEvent<HTMLElement>) => void
  name: string
}

export const DayOfMonthPicker = React.forwardRef<HTMLInputElement, DayOfMonthPicker>(
  (props, ref) => {
    const getNextDelay = getDelay()
    const days = _range(1, 32)
    const containerRef = ref as MutableRefObject<HTMLInputElement>

    return (
      <div ref={containerRef}>
        <SlideDown delay={getNextDelay()}>
          <GoBackButtonHeader
            handleGoBack={() => fadeOut(containerRef?.current, 'up', 300).then(props.handleClose)}
          />
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          <Stack className={styles.textGroup} spacing={1}>
            <Text component="h2" data-test="date-picker-header" truncate={false} variant="H2">
              {__('Payment due day')}
            </Text>
            <Text
              component="p"
              data-test="date-picker-paragraph"
              truncate={false}
              variant="Paragraph"
            >
              {__('Choose what day of the month your payment is due.')}
            </Text>
          </Stack>
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          <Stack data-test="date-picker-calendar" direction="row" flexWrap="wrap">
            {days.map((day: number) => (
              <Button
                autoFocus={day === 1}
                className={styles.button}
                data-test={`date-picker-button-${day}`}
                key={day}
                name={props.name}
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  fadeOut(containerRef?.current, 'up', 300).then(() => props.handleSelect(e))
                }}
                value={day}
              >
                {day}
              </Button>
            ))}
          </Stack>
        </SlideDown>
      </div>
    )
  },
)

DayOfMonthPicker.displayName = 'DayOfMonthPicker'
