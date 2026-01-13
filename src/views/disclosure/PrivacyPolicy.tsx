import React, { useState, useEffect } from 'react'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { LeavingNoticeFlat } from 'src/components/LeavingNoticeFlat'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { goToUrlLink } from 'src/utilities/global'
import { getLocale } from 'src/utilities/Intl'

const PRIVACY_POLICY_URL = 'https://www.mx.com/privacy/'
const PRIVACY_POLICY_URL_FR = 'https://www.mx.com/fr/privacy/'

interface PrivacyPolicyProps {
  onCancel?: () => void
}

export const PrivacyPolicy = ({ onCancel }: PrivacyPolicyProps = {}) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE_PRIVACY_POLICY)
  const [isLeavingUrl, setIsLeavingUrl] = useState<string | null>(null)

  const getNextDelay = getDelay()

  useEffect(() => {
    const locale = getLocale()
    const privacyUrl = locale === 'fr-ca' ? PRIVACY_POLICY_URL_FR : PRIVACY_POLICY_URL
    setIsLeavingUrl(privacyUrl)
  }, [])

  if (isLeavingUrl) {
    return (
      <SlideDown delay={getNextDelay()}>
        <LeavingNoticeFlat
          onCancel={() => {
            setIsLeavingUrl(null)
            onCancel?.()
          }}
          onContinue={() => {
            goToUrlLink(isLeavingUrl, true)
          }}
        />
      </SlideDown>
    )
  }

  return null
}
