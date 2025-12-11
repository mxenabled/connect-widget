import React, { useState, useEffect } from 'react'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { LeavingNoticeFlat } from 'src/components/LeavingNoticeFlat'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { goToUrlLink } from 'src/utilities/global'

const PRIVACY_POLICY_URL = 'https://www.mx.com/privacy/'

interface PrivacyPolicyProps {
  onCancel?: () => void
}

export const PrivacyPolicy = ({ onCancel }: PrivacyPolicyProps = {}) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE_PRIVACY_POLICY)
  const [isLeavingUrl, setIsLeavingUrl] = useState<string | null>(null)

  const getNextDelay = getDelay()

  useEffect(() => {
    setIsLeavingUrl(PRIVACY_POLICY_URL)
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
