import React, { Fragment, useState, useImperativeHandle } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { Link as LinkIcon } from '@kyper/icon/Link'
import { Lock } from '@kyper/icon/Lock'
import { InfoOutline } from '@kyper/icon/InfoOutline'
import { ChevronRight } from '@kyper/icon/ChevronRight'
import { Link, Stack } from '@mui/material'

import { PageviewInfo } from 'src/const/Analytics'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { __, _p } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'
import { PrivacyPolicy } from 'src/views/disclosure/PrivacyPolicy'
import { DataRequested } from 'src/views/disclosure/DataRequested'
import { DataAvailable } from 'src/views/disclosure/DataAvailable'

export const VIEWS = {
  AVAILABLE_DATA: 'available_data',
  DATA_REQUESTED: 'data_requested',
  INTERSTITIAL_DISCLOSURE: 'interstitial_disclosure',
  PRIVACY_POLICY: 'privacy_policy',
}

export const DisclosureInterstitial = React.forwardRef((props, interstitialNavRef) => {
  const { handleGoBack, scrollToTop } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const institution = useSelector((state) => state.connect.selectedInstitution)
  const appName = useSelector((state) => state.profiles.client.oauth_app_name || null)

  const [currentView, setCurrentView] = useState(VIEWS.INTERSTITIAL_DISCLOSURE)

  useImperativeHandle(interstitialNavRef, () => {
    return {
      handleCloseInterstitial() {
        backButtonClickHandler()
      },
    }
  }, [currentView])

  const backButtonClickHandler = () => {
    if (currentView === VIEWS.AVAILABLE_DATA) {
      setCurrentView(VIEWS.DATA_REQUESTED)
    } else if (currentView === VIEWS.DATA_REQUESTED || currentView === VIEWS.PRIVACY_POLICY) {
      setCurrentView(VIEWS.INTERSTITIAL_DISCLOSURE)
    } else if (currentView === VIEWS.INTERSTITIAL_DISCLOSURE) {
      handleGoBack()
    }
  }

  if (currentView === VIEWS.PRIVACY_POLICY) {
    return <PrivacyPolicy />
  } else if (currentView === VIEWS.DATA_REQUESTED) {
    return <DataRequested setCurrentView={setCurrentView} />
  } else if (currentView === VIEWS.AVAILABLE_DATA) {
    return <DataAvailable />
  }

  return (
    <Fragment>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.logoHeader}>
          <ConnectLogoHeader institutionGuid={institution.guid} />
        </div>
      </SlideDown>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.flexGroup}>
          <Text
            component="h2"
            data-test="interstitial-header"
            style={styles.title}
            truncate={false}
            variant="H2"
          >
            {appName && institution.name
              ? __('%1 trusts MX to connect your %2 account', appName, institution.name)
              : __('This app trusts MX to connect your account')}
          </Text>
        </div>
        <div style={styles.iconGroup}>
          <LinkIcon color={tokens.TextColor.Default} size={20} style={styles.icon} />
          <Text bold={true} data-test="connect-in-seconds" style={styles.subTitle} variant="Body">
            {__('Connect in seconds')}
          </Text>
        </div>
        <Text
          component="p"
          data-test="connect-in-seconds-body"
          style={styles.paragraph}
          truncate={false}
          variant={'Paragraph'}
        >
          {appName
            ? __(
                'MX helps you connect your financial accounts to apps and services. MX will allow %1 to access only the data requested.',
                appName,
              )
            : __(
                'MX helps you connect your financial accounts to apps and services. MX will allow your app to access only the data requested.',
              )}
        </Text>

        <div style={styles.iconGroup}>
          <Lock color={tokens.TextColor.Default} size={20} style={styles.icon} />
          <Text bold={true} data-test="private-secure" style={styles.subTitle} variant="Body">
            {__('Private and secure')}
          </Text>
        </div>
        <Text
          component="p"
          data-test="private-secure-body"
          style={styles.paragraph}
          truncate={false}
          variant={'Paragraph'}
        >
          {__(
            'Your data is encrypted and shared only with your permission. MX doesn’t sell your info, and you can stop sharing at any time.',
          )}
        </Text>

        <div style={styles.iconGroup}>
          <InfoOutline color={tokens.TextColor.Default} size={20} style={styles.icon} />
          <Text bold={true} data-test="learn-more" style={styles.subTitle} variant="Body">
            {__('Learn more')}
          </Text>
        </div>
      </SlideDown>
      <Stack direction={'column'}>
        <Link
          data-test="data-requested-button"
          onClick={() => {
            setCurrentView(VIEWS.DATA_REQUESTED)
          }}
          style={styles.link}
        >
          {__('Data requested')}
          <ChevronRight style={styles.chevron} />
        </Link>
        <Link
          data-test="privacy-policy-button"
          onClick={() => {
            scrollToTop()
            setCurrentView(VIEWS.PRIVACY_POLICY)
          }}
          style={styles.link}
        >
          {_p('connect/disclosure/policy/link', 'MX Privacy Policy')}

          <ChevronRight style={styles.chevron} />
        </Link>
      </Stack>
    </Fragment>
  )
})

const getStyles = (tokens) => {
  return {
    logoHeader: {
      marginTop: tokens.Spacing.Medium,
      marginBottom: tokens.Spacing.Small,
    },
    flexGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.Large,
      textAlign: 'center',
      // fontWeight: tokens.FontWeight.Bold,
    },
    iconGroup: {
      display: 'flex',
    },
    icon: {
      display: 'block',
      left: '0%',
      right: ' 0%',
      top: '0%',
      bottom: '-0.01%',
    },
    subTitle: {
      // fontStyle: 'normal',
      // fontWeight: tokens.FontWeight.Semibold,
      // fontSize: tokens.FontSize.Body,
      marginLeft: tokens.Spacing.Small,
      marginBottom: tokens.Spacing.Tiny,
    },
    paragraph: {
      // fontWeight: tokens.FontWeight.Regular,
      // fontSize: tokens.FontSize.Small,
      flexDirection: 'column',
      marginLeft: `36px`,
      marginBottom: tokens.Spacing.Medium,
    },
    link: {
      // fontWeight: tokens.FontWeight.Semibold,
      // fontSize: tokens.FontSize.Small,
      marginLeft: '32px',
      marginTop: tokens.Spacing.Medium,
      width: 'fit-content',
    },
    chevron: { marginLeft: '13.02px' },
  }
}

DisclosureInterstitial.propTypes = {
  handleGoBack: PropTypes.func.isRequired,
  scrollToTop: PropTypes.func.isRequired,
}

DisclosureInterstitial.displayName = 'DisclosureInterstitial'

export default DisclosureInterstitial
