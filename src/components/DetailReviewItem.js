import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Icon, Text } from '@mxenabled/mxui'
import { Text as ProtectedText } from 'src/privacy/components'
import { IconButton } from '@mui/material'

export const DetailReviewItem = (props) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.infoRow}>
      <div style={styles.textGroup}>
        <Text
          data-test={`${props.label.replace(/\s+/g, '-')}-row`}
          style={styles.rowHeader}
          truncate={false}
          variant="body2"
        >
          {props.label}
        </Text>
        <ProtectedText
          bold={true}
          data-test={`${props.value.replace(/\s+/g, '-')}-row`}
          style={styles.rowValue}
          truncate={false}
          variant="body1"
        >
          {props.value}
        </ProtectedText>
      </div>
      <IconButton
        aria-label={props.ariaButtonLabel}
        data-test={`${props.label.replace(/\s+/g, '-')}-edit-button`}
        disabled={props.isEditable}
        onClick={props.onEditClick}
        style={{ backgroundColor: 'transparent' }}
      >
        <Icon color={props.isEditable ? 'disabled' : 'primary'} name="edit" size={16} />
      </IconButton>
    </div>
  )
}

const getStyles = (tokens) => ({
  infoRow: {
    alignItems: 'center',
    borderBottom: `1px solid ${tokens.Color.Neutral300}`,
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${tokens.Spacing.Small}px 0`,
  },
  textGroup: {
    display: 'flex',
    flowGrow: 1,
    flexDirection: 'column',
  },
  rowHeader: {
    color: tokens.TextColor.InputLabel,
  },
  rowValue: {
    overflowWrap: 'anywhere',
  },
})

DetailReviewItem.propTypes = {
  ariaButtonLabel: PropTypes.string.isRequired,
  isEditable: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onEditClick: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
}
