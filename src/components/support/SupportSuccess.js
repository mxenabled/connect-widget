import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@kyper/button'
import { Text } from '@kyper/text'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'

import { GoBackButton } from 'src/components/GoBackButton'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'

export const SupportSuccess = React.forwardRef((props, supportSuccessRef) => {
  const { email, handleClose } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_SUCCESS)
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  const onClose = () => fadeOut(supportSuccessRef.current, 'up', 300).then(() => handleClose())

  return (
    <div ref={supportSuccessRef}>
      <SlideDown delay={getNextDelay()}>
        {!showConnectGlobalNavigationHeader && <GoBackButton handleGoBack={onClose} />}

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
