import React from 'react'

import { __ } from 'src/utilities/Intl'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'

import { REFRESH, UPDATE_CREDENTIALS, OK } from 'src/views/loginError/consts'

export const PrimaryActions = ({
  actions,
  onOkClick,
  onRefreshClick,
  onUpdateCredentialsClick,
}) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  const actionMap = {
    [REFRESH]: {
      text: __('Try again'),
      onClick: () => {
        onRefreshClick()
      },
    },
    [UPDATE_CREDENTIALS]: {
      text: __('Connect'),
      onClick: () => {
        onUpdateCredentialsClick()
      },
    },
    [OK]: {
      text: __('OK'),
      onClick: () => {
        onOkClick()
      },
    },
  }

  return (
    <div style={styles.container}>
      {actions.map((actionKey) => {
        const actionObject = actionMap[actionKey]

        return (
          <Button
            fullWidth={true}
            key={actionKey}
            onClick={actionObject.onClick}
            variant="contained"
          >
            {actionObject.text}
          </Button>
        )
      })}
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      marginTop: tokens.Spacing.XLarge,
    },
  }
}

PrimaryActions.propTypes = {
  actions: PropTypes.array.isRequired,
  onOkClick: PropTypes.func.isRequired,
  onRefreshClick: PropTypes.func.isRequired,
  onUpdateCredentialsClick: PropTypes.func.isRequired,
}
