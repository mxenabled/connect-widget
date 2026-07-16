import React from 'react'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  'data-test'?: string
  error?: boolean
  fullWidth?: boolean
  helperText?: string
  label: string
  name: string
  onChange: (e: { target: { name: string; value: string } }) => void
  options?: SelectOption[]
  placeholder?: string
  value: string
}

export const Select = ({
  'data-test': dataTest,
  error,
  fullWidth = true,
  helperText,
  label,
  name,
  onChange,
  options = [],
  placeholder = 'Select a value',
  value,
}: SelectProps) => {
  const handleChange = (e: SelectChangeEvent) => {
    onChange({ target: { name, value: e.target.value as string } })
  }

  return (
    <FormControl error={error} fullWidth={fullWidth}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <MuiSelect
        displayEmpty={true}
        inputProps={{ 'data-test': dataTest }}
        label={label}
        labelId={`${name}-label`}
        name={name}
        onChange={handleChange}
        renderValue={(selected) => {
          if (selected === '') {
            return placeholder
          }
          const option = options.find((opt) => opt.value === selected)
          return option ? option.label : selected
        }}
        value={value}
      >
        <MenuItem disabled={true} value="">
          {placeholder}
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
