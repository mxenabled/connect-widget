import React, { MutableRefObject } from 'react'

import _range from 'lodash/range'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@kyper/button'
import { Text } from '@kyper/mui'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'

import { GoBackButton } from 'src/components/GoBackButton'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'

interface DayOfMonthPicker {
  handleClose: () => void
  handleSelect: (e: React.ChangeEvent) => void
  name?: string
}

export const DayOfMonthPicker = React.forwardRef<HTMLInputElement, DayOfMonthPicker>(
  (props, ref) => {
    const tokens = useTokens()
    const styles = getStyles(tokens)
    const getNextDelay = getDelay()
    const days = _range(1, 32)
    const containerRef = ref as MutableRefObject<HTMLInputElement>

    return (
      <div ref={containerRef}>
        <SlideDown delay={getNextDelay()}>
          <GoBackButton
            handleGoBack={() => fadeOut(containerRef?.current, 'up', 300).then(props.handleClose)}
          />
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          <Text
            component="h2"
            data-test="date-picker-header"
            sx={{ marginBottom: tokens.Spacing.XSmall }}
            variant="H2"
          >
            {__('Payment due day')}
          </Text>
          <Text
            component="p"
            data-test="date-picker-paragraph"
            sx={{ marginBottom: tokens.Spacing.Large }}
            truncate={false}
            variant="Paragraph"
          >
            {__('Choose what day of the month your payment is due.')}
          </Text>
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          <div data-test="date-picker-calendar" style={styles.buttons}>
            {days.map((day: number) => (
              <Button
                autoFocus={day === 1}
                data-test={`date-picker-button-${day}`}
                key={day}
                name={props.name || day}
                onClick={(e: React.ChangeEvent) => {
                  e.persist()

                  fadeOut(containerRef?.current, 'up', 300).then(() => props.handleSelect(e))
                }}
                style={styles.button}
                value={day}
                variant="transparent"
              >
                {day}
              </Button>
            ))}
          </div>
        </SlideDown>
      </div>
    )
  },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => ({
  buttons: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: tokens.Spacing.XSmall,
  },
  button: {
    width: '14.25%',
  },
})

DayOfMonthPicker.displayName = 'DayOfMonthPicker'
