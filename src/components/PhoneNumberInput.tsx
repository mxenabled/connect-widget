import React, { ChangeEvent } from 'react'
import { Box, InputAdornment } from '@mui/material'
import { TextField } from 'src/privacy/input'

import { __ } from 'src/utilities/Intl'

interface PhoneNumberInputProps {
  error: boolean
  value: string
  onChange: (value: string) => void
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ error, value, onChange }) => {
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    onChange(digits)
  }

  const formatPhone = (input: string): string => {
    const cleaned = input.padEnd(10)
    const area = cleaned.slice(0, 3)
    const mid = cleaned.slice(3, 6)
    const last = cleaned.slice(6, 10)

    return input.length > 0 ? `(${area}) ${mid}-${last}`.trim() : ''
  }

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        InputProps={{
          startAdornment: <InputAdornment position="start">🇺🇸 +1</InputAdornment>,
        }}
        error={error}
        fullWidth={true}
        label={__('Phone number')}
        onChange={handlePhoneChange}
        placeholder="(xxx) xxx-xxxx"
        value={formatPhone(value)}
      />
    </Box>
  )
}
