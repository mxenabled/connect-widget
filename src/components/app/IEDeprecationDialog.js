import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { Close } from '@kyper/icon/Close'
import { Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'
import { Button, Link } from '@mui/material'

import { __ } from 'src/utilities/Intl'
import { isIE } from 'src/utilities/Browser'
import { PageviewInfo } from 'src/const/Analytics'

export const IEDeprecationDialog = (props) => {
  const [showDialog, setShowDialog] = useState(true)
  const widgetProfile = useSelector((state) => state.profiles.widgetProfile)
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
          color="secondary"
          onClick={() => setShowDialog(false)}
          style={styles.closeButton}
          variant="text"
        >
          <Close height={24} width={24} />
        </Button>
      </div>
      <AttentionFilled color={tokens.Color.Brand300} height={32} style={styles.icon} width={32} />
      <Text component="h2" style={styles.title} truncate={false} variant="H2">
        {__('This browser is not supported')}
      </Text>
      <Text component="p" style={styles.paragraph} truncate={false} variant="Paragraph">
        {
          // --TR: Full String: "We no longer support Internet Explorer. You can continue, or switch to a supported browser, like Edge, Chrome, or Firefox, for a better experience."
          __(
            'We no longer support Internet Explorer. You can continue, or switch to a supported browser, like ',
          )
        }
        <Link
          color="primary"
          href="https://www.microsoft.com/edge"
          rel="noreferrer noopener"
          style={{ marginRight: 0 }}
          target="_blank"
          variant="ParagraphSmall"
        >
          {__('Edge')}
        </Link>
        {', '}
        <Link
          color="primary"
          href="https://www.google.com/chrome/"
          rel="noreferrer noopener"
          style={{ marginRight: 0 }}
          target="_blank"
          variant="ParagraphSmall"
        >
          {__('Chrome')}
        </Link>
        {', or '}
        <Link
          color="primary"
          href="https://www.mozilla.org/firefox/"
          rel="noreferrer noopener"
          style={{ marginRight: 0 }}
          target="_blank"
          variant="ParagraphSmall"
        >
          {__('Firefox')}
        </Link>
        {', '}
        {__(' for a better experience.')}
      </Text>
      <Button
        fullWidth={true}
        onClick={() => setShowDialog(false)}
        style={styles.continueButton}
        variant="contained"
      >
        Continue
      </Button>
      <Text
        color="secondary"
        component="p"
        style={styles.paragraph}
        truncate={false}
        variant="XSmall"
      >
        {__(
          'Clicking the links to supported browsers will take you to an external website with a different privacy policy, security measures, and terms and conditions.',
        )}
      </Text>
    </div>
  ) : null
}

const getStyles = (tokens) => ({
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
