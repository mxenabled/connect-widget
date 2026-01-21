import React, { useRef, useState, Fragment, useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { css } from '@mxenabled/cssinjs'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { Lock } from '@kyper/icon/Lock'
import { Link } from '@mui/material'
import { Button } from '@mui/material'

import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConnectConfig, selectCurrentMode } from 'src/redux/reducers/configSlice'
import { getSize } from 'src/redux/selectors/Browser'

import { PageviewInfo } from 'src/const/Analytics'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { __, _p, getLocale } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { ConnectInstitutionHeader } from 'src/components/ConnectInstitutionHeader'

import { PrivacyPolicy } from 'src/views/disclosure/PrivacyPolicy'
import PoweredByMXText from 'src/views/disclosure/PoweredByMXText'
import { scrollToTop } from 'src/utilities/ScrollToTop'
import { goToUrlLink } from 'src/utilities/global'

export const Disclosure = React.forwardRef((_, disclosureRef) => {
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE)
  const isSmall = size === 'small'
  const tokens = useTokens()
  const styles = getStyles(tokens, isSmall)
  const getNextDelay = getDelay()
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  // Redux
  const { isInAggMode, isInTaxMode, isInVerifyMode } = useSelector(selectCurrentMode)
  const connectConfig = useSelector(selectConnectConfig)
  const size = useSelector(getSize)
  const showExternalLinkPopup = useSelector(
    (state) => state.profiles.clientProfile.show_external_link_popup,
  )
  const dispatch = useDispatch()

  useImperativeHandle(disclosureRef, () => {
    return {
      handleBackButton() {
        setShowPrivacyPolicy(false)
      },
      showBackButton() {
        return showPrivacyPolicy
      },
    }
  }, [showPrivacyPolicy])

  return (
    <div
      // neustar looks for this id for automated tests
      // DO NOT change without first also changing neustar
      id="mx-connect-disclosure"
      ref={containerRef}
    >
      {showPrivacyPolicy ? (
        <SlideDown delay={getNextDelay()}>
          <PrivacyPolicy
            onCancel={() => setShowPrivacyPolicy(false)}
            showExternalLinkPopup={showExternalLinkPopup}
          />
        </SlideDown>
      ) : (
        <Fragment>
          <SlideDown delay={getNextDelay()}>
            <ConnectInstitutionHeader />
          </SlideDown>
          <SlideDown delay={getNextDelay()}>
            <div style={styles.flexGroup}>
              <Text data-test="disclosure-title" style={styles.title} truncate={false} variant="H2">
                {_p('connect/disclosure/title', 'Connect your account')}
              </Text>

              <Text data-test="disclosure-paragraph1" truncate={false} variant="Paragraph">
                {_p(
                  'connect/disclosure/body',
                  'This app will have access to the information below unless you choose to disconnect:',
                )}
              </Text>

              <ul data-test="disclosure-list" style={styles.dataList}>
                {isInAggMode && (
                  <Fragment>
                    <li className={css(styles.listItem)} data-test="disclosure-agg-mode-list-item1">
                      <Text truncate={false} variant="Paragraph">
                        {__('Account details')}
                      </Text>
                    </li>
                    <li className={css(styles.listItem)} data-test="disclosure-agg-mode-list-item2">
                      <Text truncate={false} variant="Paragraph">
                        {__('Account balances and transactions')}
                      </Text>
                    </li>
                  </Fragment>
                )}

                {isInTaxMode && (
                  <Fragment>
                    <li className={css(styles.listItem)} data-test="disclosure-tax-mode-list-item1">
                      <Text truncate={false} variant="Paragraph">
                        {__('Basic account information')}
                      </Text>
                    </li>
                    <li className={css(styles.listItem)} data-test="disclosure-tax-mode-list-item2">
                      <Text truncate={false} variant="Paragraph">
                        {__('Tax documents')}
                      </Text>
                    </li>
                  </Fragment>
                )}

                {isInVerifyMode && (
                  <Fragment>
                    <li className={css(styles.listItem)} data-test="disclosure-ver-mode-list-item1">
                      <Text truncate={false} variant="Paragraph">
                        {__('Routing and account numbers')}
                      </Text>
                    </li>
                    <li className={css(styles.listItem)} data-test="disclosure-ver-mode-list-item2">
                      <Text truncate={false} variant="Paragraph">
                        {__('Account balances')}
                      </Text>
                    </li>
                  </Fragment>
                )}
              </ul>

              <div style={styles.lockGroup}>
                <Lock
                  color={tokens.TextColor.Default}
                  data-test="disclosure-lock-svg"
                  size={16}
                  style={styles.lockIcon}
                />
                <Text
                  component="p"
                  data-test="disclosure-paragraph-2"
                  truncate={false}
                  variant="Paragraph"
                >
                  {__('Your information is protected with bank-level security.')}
                </Text>
              </div>
              <Text
                data-test="disclosure-privacy-policy-text"
                style={styles.disclaimer}
                truncate={false}
                variant="ParagraphSmall"
              >
                {_p('connect/disclosure/policy/text', 'By clicking Continue, you agree to the ')}
                <Link
                  data-test="disclosure-privacy-policy-link"
                  onClick={() => {
                    if (showExternalLinkPopup) {
                      scrollToTop(containerRef)
                      setShowPrivacyPolicy(true)
                    } else {
                      const locale = getLocale()
                      const privacyUrl =
                        locale === 'fr-ca'
                          ? 'https://www.mx.com/fr/privacy/'
                          : 'https://www.mx.com/privacy/'
                      goToUrlLink(privacyUrl, true)
                    }
                  }}
                  style={styles.link}
                >
                  {_p('connect/disclosure/policy/link', 'MX Privacy Policy.')}
                </Link>
              </Text>
            </div>
          </SlideDown>
          <SlideDown delay={getNextDelay()}>
            <div style={styles.flexGroup}>
              <Button
                data-test="disclosure-continue"
                onClick={() => {
                  fadeOut(containerRef.current, 'up', 300).then(() =>
                    dispatch({
                      type: ActionTypes.ACCEPT_DISCLOSURE,
                      payload: connectConfig,
                    }),
                  )
                }}
                variant="contained"
              >
                {_p('connect/disclosure/button', 'Continue')}
              </Button>
              <div data-test="disclosure-databymx" style={styles.poweredBy}>
                <PoweredByMXText />
              </div>
            </div>
          </SlideDown>
        </Fragment>
      )}
    </div>
  )
})

const getStyles = (tokens) => {
  return {
    svg: {
      margin: `${tokens.Spacing.Large}px auto 0`,
      width: 240,
    },
    flexGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      margin: `${tokens.Spacing.XLarge}px auto ${tokens.Spacing.Medium}px auto`,
      textAlign: 'center',
    },
    dataList: {
      listStylePosition: 'outside',
      marginTop: tokens.Spacing.XSmall,
      marginBottom: tokens.Spacing.Small,
      marginLeft: tokens.Spacing.XSmall,
    },
    listItem: {
      color: tokens.TextColor.Default,
      marginLeft: tokens.Spacing.Medium,
      '& span': {
        marginLeft: tokens.Spacing.XTiny,
      },
    },
    lockGroup: {
      display: 'flex',
    },
    lockIcon: {
      display: 'block',
      marginRight: tokens.Spacing.XSmall,
      marginTop: tokens.Spacing.Tiny,
      marginLeft: tokens.Spacing.Tiny,
    },
    disclaimer: {
      textAlign: 'center',
      marginTop: tokens.Spacing.XLarge,
      marginBottom: tokens.Spacing.Medium,
      lineHeight: tokens.LineHeight.Small,
      color: tokens.TextColor.Secondary,
    },
    link: {
      fontSize: tokens.FontSize.XSmall,
      display: 'inline',
    },
    poweredBy: {
      marginTop: tokens.Spacing.Medium,
    },
  }
}

Disclosure.displayName = 'Disclosure'

export default Disclosure
