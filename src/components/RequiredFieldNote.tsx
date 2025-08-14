import React from 'react'
import { Typography, Box } from '@mui/material'
import { __ } from 'src/utilities/Intl'

interface RequiredFieldNoteProps {
  styles?: object
}

const RequiredFieldNote: React.FC<RequiredFieldNoteProps> = ({ styles }) => {
  // TODO: Replace with MXUI color tokens when available.
  const requiredFieldNoteColor = '#666'
  const asteriskColor = '#E32727'

  return (
    <Box
      sx={{
        marginTop: 16,
        marginBottom: 32,
        ...styles,
      }}
    >
      <Typography
        component="span"
        sx={{
          color: requiredFieldNoteColor,
          fontSize: '13px',
        }}
        variant="caption"
      >
        <Typography
          component="span"
          sx={{
            color: asteriskColor,
          }}
        >
          *
        </Typography>{' '}
        {__('Required')}
      </Typography>
    </Box>
  )
}

export default RequiredFieldNote
