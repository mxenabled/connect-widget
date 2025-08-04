/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'reduxify/Store'

import { __, getLocale, setLocale } from 'src/utilities/Intl'

import { Box, Button, IconButton, Link, Stack } from '@mui/material'
import { Icon, IconWeight } from '@mxenabled/mxui'
import { Text } from '@mxenabled/mxui'
import { useTokens } from '@mxenabled/mxui'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'

import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo } from 'src/const/Analytics'
import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'
import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'
import { getConsentDataClusters } from 'src/const/ConsentDataClusters'
import { DataClusterDropDown } from 'src/components/DataClusterDropDown'
import StickyComponentContainer from 'src/components/StickyComponentContainer'
import { ConsentModal } from './ConsentModal'
import { fadeOut } from 'src/utilities/Animation'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'

interface DynamicDisclosureProps {
  onConsentClick: () => void
  onGoBackClick: () => void
}

interface keyable {
  [key: string]: string
}

declare const window: Window &
  typeof globalThis & {
    app: {
      options: { language: string }
    }
  }

export const DynamicDisclosure = React.forwardRef<any, DynamicDisclosureProps>(
  ({ onConsentClick, onGoBackClick }, navigationRef) => {
    const [name, path] = PageviewInfo.CONNECT_DYNAMIC_DISCLOSURE
    useAnalyticsPath(name, path)

    const containerRef = useRef(null)

    const tokens = useTokens()
    const styles = getStyles(tokens)
    const getNextDelay = getDelay()

    const institution = useSelector((state: RootState) => state.connect.selectedInstitution)
    const appName = useSelector((state: RootState) => state.profiles.client.oauth_app_name || null)
    const [dialogIsOpen, setDialogIsOpen] = React.useState(false)
    const products = useSelector((state: RootState) => state.config?.data_request?.products || null)
    const include_transactions = useSelector(
      (state: RootState) => state.config.include_transactions,
    )
    const connectConfig = useSelector(selectConnectConfig)

    const { aggConsentCluster, iavAggCluster, iavConsentCluster } = getConsentDataClusters()
    const mode = useSelector((state: RootState) => state.config.mode || AGG_MODE)
    const initialLocal = window.app?.options?.language.toLowerCase() || 'en-us'

    const IS_IN_AGG_MODE =
      mode === AGG_MODE || products?.includes('transactions') || include_transactions
    const IS_IN_VERIFY_MODE = mode === VERIFY_MODE || products?.includes('identity_verification')

    let modeUseCase
    let accordionElement

    if (IS_IN_AGG_MODE && IS_IN_VERIFY_MODE) {
      modeUseCase = __('move money and manage your finances')
      accordionElement = iavAggCluster.map((cluster, i) => {
        return <DataClusterDropDown dataCluster={cluster} key={i} />
      })
    } else if (IS_IN_AGG_MODE) {
      modeUseCase = __('manage your finances')
      accordionElement = aggConsentCluster.map((cluster, i) => {
        return <DataClusterDropDown dataCluster={cluster} key={i} />
      })
    } else if (IS_IN_VERIFY_MODE) {
      accordionElement = iavConsentCluster.map((cluster, i) => {
        return <DataClusterDropDown dataCluster={cluster} key={i} />
      })
      modeUseCase = __('move money')
    }

    const localeMap: keyable = useMemo(
      () => ({ en: __('English'), es: __('Spanish'), 'fr-ca': __('French') }),
      [getLocale()],
    )

    const [isButtonDisabled, setIsButtonDisabled] = useState(true)
    const [altLocale, setAltLocale] = useState('en')

    useImperativeHandle(navigationRef, () => {
      return {
        handleBackButton() {
          if (['es', 'fr-ca'].includes(initialLocal) && initialLocal !== getLocale()) {
            setLocale(initialLocal)
          }
          fadeOut(containerRef.current, 'up', 300).then(() => onGoBackClick())
        },
        showBackButton() {
          return !connectConfig.disable_institution_search
        },
      }
    }, [connectConfig.disable_institution_search])

    useEffect(() => {
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight
        const scrollTop = document.documentElement.scrollTop
        const clientHeight = document.documentElement.clientHeight

        if (scrollHeight - scrollTop <= clientHeight + 1) {
          setIsButtonDisabled(false)
        }
      }

      window.addEventListener('scroll', handleScroll)
      handleScroll() // Check initial position on mount

      return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const footer = (
      <Button
        data-test="consent-button"
        disabled={isButtonDisabled}
        fullWidth={true}
        onClick={() => {
          if (['es', 'fr-ca'].includes(initialLocal) && initialLocal !== getLocale()) {
            setLocale(initialLocal)
          }

          onConsentClick()
        }}
        sx={styles.button}
        variant="contained"
      >
        {__('I consent')}
      </Button>
    )

    return (
      <StickyComponentContainer footer={footer} footerStyle={{ borderTop: '' }} ref={containerRef}>
        <Fragment>
          <SlideDown delay={getNextDelay()}>
            <div style={styles.logoHeader}>
              <ConnectLogoHeader institutionGuid={institution.guid} />
            </div>
          </SlideDown>
          <SlideDown delay={getNextDelay()}>
            <Text
              bold={true}
              component="h2"
              data-test="dynamic-disclosure-title"
              style={styles.title}
              truncate={false}
              variant="H2"
            >
              {__('Share your data')}
            </Text>
          </SlideDown>
          <SlideDown delay={getNextDelay()}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Text
                component="p"
                data-test="dynamic-disclosure-p1"
                style={styles.paragraph}
                truncate={false}
                variant="Paragraph"
              >
                {appName
                  ? __('%1 uses MX Technologies ', appName)
                  : __('This app uses MX Technologies ')}
                <IconButton
                  data-test="info-button"
                  onClick={() => setDialogIsOpen((prev) => !prev)}
                  sx={{ fontSize: 16, padding: 0, minWidth: 0, minHeight: 0 }}
                >
                  <Icon
                    color="secondary"
                    name="info"
                    size={16}
                    sx={{ marginBottom: '6px' }}
                    weight={IconWeight.Dark}
                  />
                </IconButton>
                {institution.name
                  ? __(' to securely access the following %1 data to', institution.name)
                  : __(' to securely access the following data to')}
                <span style={styles.useCase}>{__(' help you %1:', modeUseCase)}</span>
              </Text>
            </Stack>
            <div>{accordionElement}</div>
            <div style={styles.disclosureParagraph}>
              <Text component="p" truncate={false} variant="XSmall">
                {appName
                  ? __(
                      '%1 and MX Technologies will only collect, use, and retain your data to help manage your finances and will protect your data as required by',
                      appName,
                    )
                  : __(
                      'This app and MX Technologies will only collect, use, and retain your data to help manage your finances and will protect your data as required by',
                    )}
                <Link
                  color="#2C64EF"
                  href="https://www.ecfr.gov/current/title-12/chapter-X/part-1033/subpart-D/section-1033.421"
                  rel="noopener noreferrer"
                  sx={{ borderBottom: '1px solid', display: 'inline' }}
                  target="_blank"
                >
                  {__('applicable open banking regulations.')}
                </Link>
                {appName
                  ? __(
                      'Your consent is valid for 12 months and can be revoked anytime through your %1 portal.',
                      appName,
                    )
                  : __(
                      "Your consent is valid for 12 months and can be revoked anytime through your app's portal.",
                    )}
                {!['en-us', 'en-ca'].includes(initialLocal) ? (
                  <Link
                    data-test="translation-button"
                    onClick={() => {
                      const locale = getLocale()

                      setLocale(locale === 'en' ? initialLocal : 'en')
                      setAltLocale(locale)
                    }}
                    sx={{ borderBottom: '1px solid', color: '#2C64EF', height: '16px' }}
                  >
                    {__('View consent in %1.', localeMap[altLocale])}
                  </Link>
                ) : null}
                <Box component="b" fontWeight="fontWeightBold">
                  {__(" By clicking 'I consent,' you agree to this access and use.")}
                </Box>
              </Text>
            </div>
            <div style={styles.privateAndSecure}>
              <PrivateAndSecure />
            </div>
          </SlideDown>
          {dialogIsOpen && (
            <ConsentModal dialogIsOpen={dialogIsOpen} setDialogIsOpen={setDialogIsOpen} />
          )}
        </Fragment>
      </StickyComponentContainer>
    )
  },
)

const getStyles = (tokens: any) => {
  return {
    logoHeader: {
      marginTop: tokens.Spacing.XSmall,
    },
    title: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.Large,
      textAlign: 'center' as any,
    },
    paragraph: {
      marginBottom: tokens.Spacing.Large,
    },
    useCase: {
      fontWeight: tokens.FontWeight.Semibold,
    },
    disclosureParagraph: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.Large,
    },
    privateAndSecure: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.Large,
    },
    button: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.Large,
    },
  }
}

DynamicDisclosure.displayName = 'DynamicDisclosure'
