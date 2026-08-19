import React, { useRef, useState, Fragment, useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Icon, Text } from '@mxenabled/mxui'
import { Link, Stack } from '@mui/material'
import { Button } from '@mui/material'

import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConnectConfig, selectCurrentMode } from 'src/redux/reducers/configSlice'

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
import styles from 'src/views/disclosure/Disclosure.module.css'

export const Disclosure = React.forwardRef((_, disclosureRef) => {
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE)
  const getNextDelay = getDelay()
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  // Redux
  const { isInAggMode, isInTaxMode, isInVerifyMode } = useSelector(selectCurrentMode)
  const connectConfig = useSelector(selectConnectConfig)
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
            <Stack>
              <Text
                className={styles.title}
                data-test="disclosure-title"
                truncate={false}
                variant="H2"
              >
                {_p('connect/disclosure/title', 'Connect your account')}
              </Text>

              <Text data-test="disclosure-paragraph1" truncate={false} variant="Paragraph">
                {_p(
                  'connect/disclosure/body',
                  'This app will have access to the information below unless you choose to disconnect:',
                )}
              </Text>

              <ul className={styles.dataList} data-test="disclosure-list">
                {isInAggMode && (
                  <Fragment>
                    <li className={styles.listItem} data-test="disclosure-agg-mode-list-item1">
                      <Text truncate={false} variant="Paragraph">
                        {__('Account details')}
                      </Text>
                    </li>
                    <li className={styles.listItem} data-test="disclosure-agg-mode-list-item2">
                      <Text truncate={false} variant="Paragraph">
                        {__('Account balances and transactions')}
                      </Text>
                    </li>
                  </Fragment>
                )}

                {isInTaxMode && (
                  <Fragment>
                    <li className={styles.listItem} data-test="disclosure-tax-mode-list-item1">
                      <Text truncate={false} variant="Paragraph">
                        {__('Basic account information')}
                      </Text>
                    </li>
                    <li className={styles.listItem} data-test="disclosure-tax-mode-list-item2">
                      <Text truncate={false} variant="Paragraph">
                        {__('Tax documents')}
                      </Text>
                    </li>
                  </Fragment>
                )}

                {isInVerifyMode && (
                  <Fragment>
                    <li className={styles.listItem} data-test="disclosure-ver-mode-list-item1">
                      <Text truncate={false} variant="Paragraph">
                        {__('Routing and account numbers')}
                      </Text>
                    </li>
                    <li className={styles.listItem} data-test="disclosure-ver-mode-list-item2">
                      <Text truncate={false} variant="Paragraph">
                        {__('Account balances')}
                      </Text>
                    </li>
                  </Fragment>
                )}
              </ul>

              <div className={styles.lockGroup} data-test="disclosure-lock-svg">
                <Icon name="lock" size={16} />
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
                className={styles.disclaimer}
                data-test="disclosure-privacy-policy-text"
                truncate={false}
                variant="ParagraphSmall"
              >
                {_p('connect/disclosure/policy/text', 'By clicking Continue, you agree to the ')}
                <Link
                  className={styles.link}
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
                  variant="caption"
                >
                  {_p('connect/disclosure/policy/link', 'MX Privacy Policy.')}
                </Link>
              </Text>
            </Stack>
          </SlideDown>
          <SlideDown delay={getNextDelay()}>
            <Stack>
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
              <div className={styles.poweredBy} data-test="disclosure-databymx">
                <PoweredByMXText />
              </div>
            </Stack>
          </SlideDown>
        </Fragment>
      )}
    </div>
  )
})

Disclosure.displayName = 'Disclosure'

export default Disclosure
