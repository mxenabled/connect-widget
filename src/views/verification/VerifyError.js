import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { MessageBox } from '@kyper/messagebox'
import { Text } from '@kyper/mui'
import { Button } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import { ViewTitle } from 'src/components/ViewTitle'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'

import { __ } from 'src/utilities/Intl'
import { getDelay } from 'src/utilities/getDelay'

export const VerifyError = ({ error, onGoBack }) => {
  const buttonText = __('Go back')

  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <React.Fragment>
      <SlideDown delay={getNextDelay()}>
        <ViewTitle title={__('Something went wrong')} />
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <MessageBox variant="error">
          <Text component="p" role="alert" truncate={false} variant="ParagraphSmall">
            {__(getErrorMessage(error?.response?.status))}
          </Text>
        </MessageBox>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          aria-label={buttonText}
          fullWidth={true}
          onClick={onGoBack}
          style={styles.button}
          variant="contained"
        >
          {buttonText}
        </Button>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <PrivateAndSecure />
      </SlideDown>
    </React.Fragment>
  )
}

function getErrorMessage(status = 500) {
  if (status === 403) {
    return __("This connection doesn't support verification.")
  } else if ([409, 422].includes(status)) {
    return __("We can't verify this connection right now. Please try again later.")
  } else {
    return __('Oops! Something went wrong. Error code: %1', status)
  }
}

const getStyles = (tokens) => {
  return {
    header: {
      fontSize: tokens.FontSize.H2,
      fontWeight: tokens.FontWeight.Bold,
      marginBottom: tokens.Spacing.XSmall,
    },
    button: {
      marginTop: tokens.Spacing.Large,
    },
  }
}

VerifyError.propTypes = {
  error: PropTypes.object,
  onGoBack: PropTypes.func.isRequired,
}
