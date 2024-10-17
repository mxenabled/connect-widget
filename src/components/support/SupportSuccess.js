import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@kyper/button'
import { Text } from '@kyper/text'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'

import { PrivateAndSecure } from 'src/connect/components/PrivateAndSecure'
import { SlideDown } from 'src/connect/components/SlideDown'
import { getDelay } from 'src/connect/utilities/getDelay'
import useAnalyticsPath from 'src/connect/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/connect/const/Analytics'

export const SupportSuccess = React.forwardRef((props, supportSuccessRef) => {
  const { email, handleClose } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_SUCCESS)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  const onClose = () => fadeOut(supportSuccessRef.current, 'up', 300).then(() => handleClose())

  return (
    <div ref={supportSuccessRef}>
      <SlideDown delay={getNextDelay()}>
        <Text style={styles.title} tag="h2">
          {__('Request received')}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text as="Paragraph" style={styles.firstParagraph} tag="p">
          {__(
            'Thanks! Your request has been received. A reply will be sent to %1. Be sure to check your junk mail or spam folder, as replies sometimes end up there.',
            email,
          )}
        </Text>
        <Text as="Paragraph">{__('Our hours are Monday to Friday, 9 a.m. – 5 p.m. MST.')}</Text>

        <Button
          data-test="support-continue"
          onClick={onClose}
          style={styles.button}
          type="submit"
          variant="primary"
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
    width: '100%',
  },
})

SupportSuccess.propTypes = {
  email: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
}

SupportSuccess.displayName = 'SupportSuccess'
