import React, { useState, useEffect } from 'react'
import { IconButton, InputAdornment } from '@mui/material'
import { Icon } from '@kyper/mui'
import { __ } from 'src/utilities/Intl'
import { PasswordValidations } from 'src/privacy/input'

/*
  This hook is used to handle the validation of the password input
  It handles caps lock detection, space validation, and show/hide password functionality
  It returns the validation state and the handlers for the password input
*/
export const usePasswordInputValidation = () => {
  // Caps Lock Validation
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)
  const handleKeyPress = (event: KeyboardEvent) =>
    'getModifierState' in event && setIsCapsLockOn(event.getModifierState('CapsLock'))
  const handleFocus = (event: FocusEvent) =>
    event.target?.addEventListener('keydown', handleKeyPress as EventListener)
  const handleBlur = (event: FocusEvent) => {
    event.target?.removeEventListener('keydown', handleKeyPress as EventListener)
    setIsCapsLockOn(false)
  }

  // Show Password Validation
  const [showPassword, setShowPassword] = useState(false)
  const handleTogglePassword = () => setShowPassword((show) => !show)

  // Spaces Validation
  const [validateSpaceState, setValidateSpaceState] = useState(DEFAULT_VALIDATION_STATE)
  const [validateSpaceMessage, setValidateSpaceMessage] = useState('')
  const handleSpaceValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (validation.hasLeadingTrailingSpace(inputValue)) {
      setValidateSpaceState({
        ...DEFAULT_VALIDATION_STATE,
        [PasswordValidations.LEADING_AND_TRAILING_SPACE]: true,
      })
    } else if (validation.hasLeadingSpace(inputValue)) {
      setValidateSpaceState({
        ...DEFAULT_VALIDATION_STATE,
        [PasswordValidations.LEADING_SPACE]: true,
      })
    } else if (validation.hasTrailingSpace(inputValue)) {
      setValidateSpaceState({
        ...DEFAULT_VALIDATION_STATE,
        [PasswordValidations.TRAILING_SPACE]: true,
      })
    } else {
      setValidateSpaceState(DEFAULT_VALIDATION_STATE)
    }
  }
  // When space state changes, determine applicable error messages
  useEffect(() => {
    let warningMessage = ''
    const detectedValidations = Object.keys(validateSpaceState).filter(
      (key) => validateSpaceState[key] === true,
    )

    if (detectedValidations.length > 0) {
      // Append detected validation messages
      detectedValidations.map(
        (validation) => (warningMessage += `${PASSWORD_VALIDATION_MESSAGES[validation]}. `),
      )
    }

    setValidateSpaceMessage(warningMessage)
  }, [validateSpaceState])

  return {
    validations: {
      isError: isCapsLockOn || !!validateSpaceMessage,
      isCapsLockOn,
      showPassword,
      validateSpaceMessage,
    },
    handleFocus, // Add to password input onFocus
    handleBlur, // Add to password input onBlur
    handleSpaceValidation, // Add to password input onChange
    PasswordShowButton: () => (
      // Use this component for show/hide button on password input
      <InputAdornment position="end">
        <IconButton
          aria-label={showPassword ? __('Hide password') : __('Show password')}
          edge="end"
          onClick={handleTogglePassword}
        >
          {showPassword ? (
            <Icon className="material-symbols-rounded" name="visibility_off" />
          ) : (
            <Icon className="material-symbols-rounded" name="visibility" />
          )}
        </IconButton>
      </InputAdornment>
    ),
  }
}

const validation = {
  hasLeadingTrailingSpace(value: string) {
    return /^\s/.test(value) && /\s+$/.test(value)
  },
  hasLeadingSpace(value: string) {
    return /^\s/.test(value)
  },
  hasTrailingSpace(value: string) {
    return /\s+$/.test(value)
  },
}

const DEFAULT_VALIDATION_STATE: Record<keyof typeof PasswordValidations, boolean> = {
  [PasswordValidations.LEADING_SPACE]: false,
  [PasswordValidations.TRAILING_SPACE]: false,
  [PasswordValidations.LEADING_AND_TRAILING_SPACE]: false,
}

const PASSWORD_VALIDATION_MESSAGES: Record<keyof typeof PasswordValidations, string> = {
  [PasswordValidations.LEADING_SPACE]: __('The first character is a blank space'),
  [PasswordValidations.TRAILING_SPACE]: __('The last character is a blank space'),
  [PasswordValidations.LEADING_AND_TRAILING_SPACE]: __(
    'The first and last characters are blank spaces',
  ),
}
