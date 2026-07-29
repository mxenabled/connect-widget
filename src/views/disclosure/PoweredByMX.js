import React from 'react'

import { useTokens } from '@kyper/tokenprovider'
import { Icon } from '@mxenabled/mxui'
import PropTypes from 'prop-types'

import { Button } from '@mui/material'
import PoweredByMXText from 'src/views/disclosure/PoweredByMXText'

const PoweredByMX = ({ onClick }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <Button
      color="secondary"
      data-test="powered-by-mx-button"
      fullWidth={true}
      onClick={onClick}
      style={styles.button}
      variant="text"
    >
      <PoweredByMXText />
      <Icon name="chevron_right" size={16} sx={{ marginLeft: 4 }} />
    </Button>
  )
}

PoweredByMX.propTypes = {
  onClick: PropTypes.func,
}

const getStyles = () => {
  return {
    button: {
      display: 'flex',
      flexDirection: 'row',
    },
  }
}

export default PoweredByMX
