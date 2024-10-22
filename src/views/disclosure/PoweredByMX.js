import React from 'react'

import { useTokens } from '@kyper/tokenprovider'
import { ChevronRight } from '@kyper/icon/ChevronRight'
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
      <ChevronRight style={styles.chevron} />
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
    chevron: { marginLeft: 4 },
  }
}

export default PoweredByMX
