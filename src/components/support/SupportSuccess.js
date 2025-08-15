import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { Button } from '@mui/material'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'

import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

export const SupportSuccess = React.forwardRef((props, supportSuccessRef) => {
  const { email, handleClose, setAriaLiveRegionMessage } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_SUCCESS)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  const requestReceived = __(
    'Thanks! Your request has been received. A reply will be sent to %1. Be sure to check your junk mail or spam folder, as replies sometimes end up there.',
    email,
  )

  const workingHours = __('Our hours are Monday to Friday, 9 a.m. – 5 p.m. MST.')

  const onClose = () => fadeOut(supportSuccessRef.current, 'up', 300).then(() => handleClose())

  useEffect(() => {
    setAriaLiveRegionMessage(`${requestReceived} ${workingHours}`)
  }, [])

  return (
    <div ref={supportSuccessRef}>
      <SlideDown delay={getNextDelay()}>
        <Text style={styles.title} truncate={false} variant="H2">
          {__('Request received')}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text component="p" style={styles.firstParagraph} truncate={false} variant="Paragraph">
          {requestReceived}
        </Text>
        <Text component="p" truncate={false} variant="Paragraph">
          {workingHours}
        </Text>

        <Button
          data-test="support-continue"
          fullWidth={true}
          onClick={onClose}
          style={styles.button}
          type="submit"
          variant="contained"
        >
          {__('Continue')}
        </Button>

        <PrivateAndSecure />
      </SlideDown>
    </div>
  )
})

const getStyles = (tokens) => ({
  title: {
    display: 'block',
    marginBottom: tokens.Spacing.XSmall,
  },
  firstParagraph: {
    display: 'block',
    marginBottom: tokens.Spacing.Small,
  },
  button: {
    marginTop: tokens.Spacing.XLarge,
  },
})

SupportSuccess.propTypes = {
  email: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  setAriaLiveRegionMessage: PropTypes.func.isRequired,
}

SupportSuccess.displayName = 'SupportSuccess'
