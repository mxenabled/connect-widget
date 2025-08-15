import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { ChevronRightIcon } from '@mxenabled/mxui'
import { Button } from '@mui/material'

export const ActionTile = (props) => {
  const { icon, onSelectAction, subTitle, title } = props
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const startIcon = (
    <div style={styles.iconColumn}>
      <div style={styles.iconBackground}>{icon}</div>
    </div>
  )

  return (
    <div>
      <Button
        endIcon={<ChevronRightIcon size={24} />}
        fullWidth={true}
        onClick={onSelectAction}
        size="large"
        startIcon={startIcon}
        style={{ height: '60px' }}
      >
        <div style={styles.textColumn}>
          <Text bold={true} style={styles.title} truncate={false} variant="Body">
            {title}
          </Text>
          <Text style={styles.subtitle} truncate={false} variant="ParagraphSmall">
            {subTitle}
          </Text>
        </div>
      </Button>
    </div>
  )
}

const getStyles = (tokens) => ({
  iconColumn: {
    alignSelf: 'start',
    display: 'flex',
    flexDirection: 'column',
  },
  iconBackground: {
    background: `linear-gradient(to bottom right, ${tokens.Color.Brand400}, ${tokens.Color.Brand200}`,
    boxSizing: 'border-box',
    borderRadius: tokens.Spacing.Tiny,
    height: tokens.Spacing.XLarge,
    width: tokens.Spacing.XLarge,
  },
  textColumn: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 3,
    overflow: 'hidden',
  },
  title: {
    textAlign: 'start',
  },
  subtitle: {
    textAlign: 'start',
  },
})

ActionTile.propTypes = {
  icon: PropTypes.PropTypes.object,
  onSelectAction: PropTypes.func.isRequired,
  subTitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}
