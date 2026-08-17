import React, { Fragment, useState, useImperativeHandle } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Icon, Text } from '@mxenabled/mxui'
import { InfoOutline } from '@kyper/icon/InfoOutline'
import { Link, Stack } from '@mui/material'

import { PageviewInfo } from 'src/const/Analytics'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { __, _p, getLocale } from 'src/utilities/Intl'
import { goToUrlLink } from 'src/utilities/global'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'
import { PrivacyPolicy } from 'src/views/disclosure/PrivacyPolicy'
import { DataRequested } from 'src/views/disclosure/DataRequested'
import { DataAvailable } from 'src/views/disclosure/DataAvailable'
import { getSelectedInstitution } from 'src/redux/selectors/Connect'
import styles from 'src/views/disclosure/Interstitial.module.css'

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
  const getNextDelay = getDelay()
  const institution = useSelector(getSelectedInstitution)
  const appName = useSelector((state) => state.profiles.client.oauth_app_name || null)
  const showExternalLinkPopup = useSelector(
    (state) => state.profiles.clientProfile.show_external_link_popup,
  )

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
    return (
      <PrivacyPolicy
        onCancel={() => setCurrentView(VIEWS.INTERSTITIAL_DISCLOSURE)}
        showExternalLinkPopup={showExternalLinkPopup}
      />
    )
  } else if (currentView === VIEWS.DATA_REQUESTED) {
    return <DataRequested setCurrentView={setCurrentView} />
  } else if (currentView === VIEWS.AVAILABLE_DATA) {
    return <DataAvailable />
  }

  return (
    <Fragment>
      <SlideDown delay={getNextDelay()}>
        <div className={styles.logoHeader}>
          <ConnectLogoHeader
            institutionGuid={institution.guid}
            institutionLogo={institution.logo_url}
          />
        </div>
      </SlideDown>
      <SlideDown delay={getNextDelay()}>
        <Stack spacing={3}>
          <Text
            className={styles.title}
            component="h2"
            data-test="interstitial-header"
            truncate={false}
            variant="H2"
          >
            {appName && institution.name
              ? __('%1 trusts MX to connect your %2 account', appName, institution.name)
              : __('This app trusts MX to connect your account')}
          </Text>

          <Stack className={styles.sections} spacing={2}>
            <Stack spacing={0.5}>
              <Stack direction="row">
                <Icon name="lock" size={20} />
                <Text
                  bold={true}
                  className={styles.subTitle}
                  data-test="connect-in-seconds"
                  truncate={false}
                  variant="Body"
                >
                  {__('Connect in seconds')}
                </Text>
              </Stack>
              <Text
                className={styles.paragraph}
                component="p"
                data-test="connect-in-seconds-body"
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
            </Stack>

            <Stack spacing={0.5}>
              <Stack direction="row">
                <Icon className={styles.icon} name="lock" size={20} />
                <Text
                  bold={true}
                  className={styles.subTitle}
                  data-test="private-secure"
                  truncate={false}
                  variant="Body"
                >
                  {__('Private and secure')}
                </Text>
              </Stack>
              <Text
                className={styles.paragraph}
                component="p"
                data-test="private-secure-body"
                truncate={false}
                variant={'Paragraph'}
              >
                {__(
                  'Your data is encrypted and shared only with your permission. MX doesn’t sell your info, and you can stop sharing at any time.',
                )}
              </Text>
            </Stack>

            <Stack direction="row">
              <InfoOutline className={styles.icon} color={tokens.TextColor.Default} size={20} />
              <Text
                bold={true}
                className={styles.subTitle}
                data-test="learn-more"
                truncate={false}
                variant="Body"
              >
                {__('Learn more')}
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </SlideDown>
      <Stack direction={'column'}>
        <Link
          className={styles.link}
          data-test="data-requested-button"
          onClick={() => {
            setCurrentView(VIEWS.DATA_REQUESTED)
          }}
          variant="ParagraphSmall"
        >
          {__('Data requested')}
          <Icon name="chevron_right" size={16} />
        </Link>
        <Link
          className={styles.link}
          data-test="privacy-policy-button"
          onClick={() => {
            if (showExternalLinkPopup) {
              scrollToTop()
              setCurrentView(VIEWS.PRIVACY_POLICY)
            } else {
              const locale = getLocale()
              const privacyUrl =
                locale === 'fr-ca'
                  ? 'https://www.mx.com/fr/privacy/'
                  : 'https://www.mx.com/privacy/'
              goToUrlLink(privacyUrl, true)
            }
          }}
          variant="ParagraphSmall"
        >
          {_p('connect/disclosure/policy/link', 'MX Privacy Policy')}

          <Icon name="chevron_right" size={16} />
        </Link>
      </Stack>
    </Fragment>
  )
})

DisclosureInterstitial.propTypes = {
  handleGoBack: PropTypes.func.isRequired,
  scrollToTop: PropTypes.func.isRequired,
}

DisclosureInterstitial.displayName = 'DisclosureInterstitial'

export default DisclosureInterstitial
