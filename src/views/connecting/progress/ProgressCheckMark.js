import React from 'react'
import { Icon } from '@mxenabled/mxui'
import styles from './progressCheckMark.module.css'

export const ProgressCheckMark = () => {
  return (
    <Icon className={styles.container} color="primary" fill={true} name="check_circle" size={26} />
  )
}
