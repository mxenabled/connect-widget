import React from 'react'

import { Icon } from '@mxenabled/mxui'
import PropTypes from 'prop-types'

import { Button } from '@mui/material'
import PoweredByMXText from 'src/views/disclosure/PoweredByMXText'
import styles from 'src/views/disclosure/PoweredByMX.module.css'

const PoweredByMX = ({ onClick }) => {
  return (
    <Button
      className={styles.button}
      color="secondary"
      data-test="powered-by-mx-button"
      fullWidth={true}
      onClick={onClick}
      variant="text"
    >
      <PoweredByMXText />
      <Icon name="chevron_right" size={24} />
    </Button>
  )
}

PoweredByMX.propTypes = {
  onClick: PropTypes.func,
}

export default PoweredByMX
