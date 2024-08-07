import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { Close } from '@kyper/icon/Close'
import { Text, A } from '@kyper/text'
import { Button } from '@kyper/button'
import { useTokens } from '@kyper/tokenprovider'

import { __ } from 'src/connect/utilities/Intl'
import { isIE } from 'src/connect/utilities/Browser'
import { PageviewInfo } from 'src/connect/const/Analytics'

export const IEDeprecationDialog = props => {
  const [showDialog, setShowDialog] = useState(true)
  const widgetProfile = useSelector(state => state.profiles.widgetProfile)
  const tokens = useTokens()
  const styles = getStyles(tokens)

  useEffect(() => {
    if (isIE() && widgetProfile?.enable_ie_11_deprecation && showDialog) {
      props.onAnalyticPageview(PageviewInfo.CONNECT_IE_11_DEPRECATION[1])
    }
  }, [isIE(), widgetProfile?.enable_ie_11_deprecation && showDialog])

  return isIE() && widgetProfile?.enable_ie_11_deprecation && showDialog ? (
    <div style={styles.container}>
      <div style={styles.header}>
        <Button
          aria-label="close modal"
          onClick={() => setShowDialog(false)}
          style={styles.closeButton}
          variant="transparent-tertiary"
        >
          <Close height={24} width={24} />
        </Button>
      </div>
      <AttentionFilled color={tokens.Color.Brand300} height={32} style={styles.icon} width={32} />
      <Text style={styles.title} tag="h2">
        {__('This browser is not supported')}
      </Text>
      <Text style={styles.paragraph} tag="p">
        {// --TR: Full String: "We no longer support Internet Explorer. You can continue, or switch to a supported browser, like Edge, Chrome, or Firefox, for a better experience."
        __(
          'We no longer support Internet Explorer. You can continue, or switch to a supported browser, like ',
        )}
        <A
          href="https://www.microsoft.com/edge"
          rel="noreferrer noopener"
          style={{ marginRight: 0 }}
          tag="a"
          target="_blank"
        >
          {__('Edge')}
        </A>
        {', '}
        <A
          href="https://www.google.com/chrome/"
          rel="noreferrer noopener"
          style={{ marginRight: 0 }}
          tag="a"
          target="_blank"
        >
          {__('Chrome')}
        </A>
        {', or '}
        <A
          href="https://www.mozilla.org/firefox/"
          rel="noreferrer noopener"
          style={{ marginRight: 0 }}
          tag="a"
          target="_blank"
        >
          {__('Firefox')}
        </A>
        {', '}
        {__(' for a better experience.')}
      </Text>
      <Button onClick={() => setShowDialog(false)} style={styles.continueButton} variant="primary">
        Continue
      </Button>
      <Text as="XSmall" color="secondary" style={styles.paragraph} tag="p">
        {__(
          'Clicking the links to supported browsers will take you to an external website with a different privacy policy, security measures, and terms and conditions.',
        )}
      </Text>
    </div>
  ) : null
}

const getStyles = tokens => ({
  container: {
    background: tokens.BackgroundColor.Modal,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `0 ${tokens.Spacing.ContainerSidePadding}px`,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: '352px', // Our max content width (does not include side margin)
    minWidth: '270px', // Our min content width (does not include side margin)
    margin: '0 auto',
  },
  header: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
  closeButton: {
    marginTop: tokens.Spacing.XSmall,
  },
  title: {
    textAlign: 'center',
    marginBottom: tokens.Spacing.Tiny,
  },
  paragraph: {
    textAlign: 'center',
  },
  continueButton: {
    marginTop: tokens.Spacing.XLarge,
    marginBottom: tokens.Spacing.Medium,
    width: '100%',
  },
  icon: {
    marginBottom: tokens.Spacing.Large,
    marginTop: tokens.Spacing.Jumbo,
    paddingTop: tokens.Spacing.Tiny,
  },
})

IEDeprecationDialog.propTypes = {
  onAnalyticPageview: PropTypes.func.isRequired,
}
