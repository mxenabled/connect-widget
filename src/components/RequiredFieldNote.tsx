import React from 'react'
import { Typography, Box } from '@mui/material'
import { __ } from 'src/utilities/Intl'
import styles from 'src/components/RequiredFieldNote.module.css'

interface RequiredFieldNoteProps {
  className?: string
  styles?: React.CSSProperties
}

const RequiredFieldNote: React.FC<RequiredFieldNoteProps> = ({ className, styles: overrides }) => {
  return (
    <Box className={[styles.container, className].filter(Boolean).join(' ')} style={overrides}>
      <Typography className={styles.note} component="span" variant="body2">
        <Typography className={styles.asterisk} component="span">
          *
        </Typography>{' '}
        {__('Required')}
      </Typography>
    </Box>
  )
}

export default RequiredFieldNote
