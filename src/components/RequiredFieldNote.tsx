import React from 'react'
import { Typography, Box } from '@mui/material'
import { __ } from 'src/utilities/Intl'

const RequiredFieldNote: React.FC = () => {
  return (
    <Box
      sx={{
        marginTop: 16,
        marginBottom: 32,
      }}
    >
      <Typography
        component="span"
        sx={{
          color: '#666',
          fontSize: '13px',
        }}
        variant="caption"
      >
        <Typography
          component="span"
          sx={{
            color: '#E32727',
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
