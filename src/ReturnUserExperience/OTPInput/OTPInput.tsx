import React, { useEffect } from 'react'

import { Text } from '@mxenabled/mxui'
import Button from '@mui/material/Button'
import { Stack, styled } from '@mui/system'
import { TextField } from 'src/privacy/input'

import { __ } from 'src/utilities/Intl'
import styles from './otpInput.module.css'

const RESEND_OTP_INTERVAL = 10
const OTP_LENGTH = 6

const getOtpDigits = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
  return [...digits, ...new Array(OTP_LENGTH - digits.length).fill('')]
}

export const OTPInput = ({
  onChange,
  value,
}: {
  onChange: React.Dispatch<React.SetStateAction<string>>
  value: string
}) => {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>(
    Array.from({ length: OTP_LENGTH }, () => null),
  )
  const [seconds, setSeconds] = React.useState<number>(RESEND_OTP_INTERVAL)
  const otpDigits = React.useMemo(() => getOtpDigits(value), [value])

  useEffect(() => {
    // This timer is a delay before the user can request a new OTP.
    setSeconds(RESEND_OTP_INTERVAL)
    const timer = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const focusInput = (targetIndex: number) => {
    inputRefs.current[targetIndex]?.focus()
  }

  const selectInput = (targetIndex: number) => {
    inputRefs.current[targetIndex]?.select()
  }

  const updateOtp = (updater: (digits: string[]) => void) => {
    onChange((prev) => {
      const digits = getOtpDigits(prev)
      updater(digits)
      return digits.join('')
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case ' ':
        event.preventDefault()
        break
      case 'ArrowLeft':
        event.preventDefault()
        if (currentIndex > 0) {
          focusInput(currentIndex - 1)
          selectInput(currentIndex - 1)
        }
        break
      case 'ArrowRight':
        event.preventDefault()
        if (currentIndex < OTP_LENGTH - 1) {
          focusInput(currentIndex + 1)
          selectInput(currentIndex + 1)
        }
        break
      case 'Delete':
        event.preventDefault()
        updateOtp((digits) => {
          digits[currentIndex] = ''
        })
        break
      case 'Backspace': {
        event.preventDefault()
        const isEmpty = event.currentTarget.value === ''

        updateOtp((digits) => {
          if (isEmpty && currentIndex > 0) {
            digits[currentIndex - 1] = ''
          } else {
            digits[currentIndex] = ''
          }
        })

        if (isEmpty && currentIndex > 0) {
          focusInput(currentIndex - 1)
          selectInput(currentIndex - 1)
        }
        break
      }
      default:
        break
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, currentIndex: number) => {
    const nextValue = event.target.value.replace(/\D/g, '').slice(-1)

    updateOtp((digits) => {
      digits[currentIndex] = nextValue
    })

    if (nextValue && currentIndex < OTP_LENGTH - 1) {
      focusInput(currentIndex + 1)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, currentIndex: number) => {
    event.preventDefault()

    const pastedText = event.clipboardData
      .getData('text/plain')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH - currentIndex)

    if (!pastedText) {
      return
    }

    updateOtp((digits) => {
      for (let index = 0; index < pastedText.length; index += 1) {
        digits[currentIndex + index] = pastedText[index]
      }
    })

    setTimeout(() => {
      const focusIndex = Math.min(currentIndex + pastedText.length, OTP_LENGTH - 1)
      focusInput(focusIndex)
      selectInput(focusIndex)
    }, 0)
  }

  return (
    <>
      <Stack alignItems="center" className={styles.container} direction="row" spacing="8px">
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <OTPTextField
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            inputProps={{
              maxLength: 1,
              inputMode: 'numeric',
              pattern: '[0-9]*',
              autoComplete: 'one-time-code',
            }}
            inputRef={(ele: HTMLInputElement | null) => {
              inputRefs.current[index] = ele
            }}
            key={index}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(event, index)}
            onFocus={() => selectInput(index)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(event, index)
            }
            onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => handlePaste(event, index)}
            size="small"
            value={otpDigits[index]}
            variant="outlined"
          />
        ))}
      </Stack>

      {seconds > 0 ? (
        <Text truncate={false} variant="caption">
          {__('Resend code in (%1 seconds)', seconds)}
        </Text>
      ) : (
        <Button fullWidth={true} onClick={() => {}} size="small" variant="text">
          {__('Resend code')}
        </Button>
      )}
    </>
  )
}

const OTPTextField = styled(TextField)(() => ({
  height: '60px',
  '& .MuiInputBase-input': {
    textAlign: 'center',
    fontSize: '23px',
  },
  '& .MuiOutlinedInput-root': {
    height: '100%',
  },
}))
