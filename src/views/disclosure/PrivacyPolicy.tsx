import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { LeavingNoticeFlat } from 'src/components/LeavingNoticeFlat'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { goToUrlLink } from 'src/utilities/global'
import { RootState } from 'src/redux/Store'

const PRIVACY_POLICY_URL = 'https://www.mx.com/privacy/'

export const PrivacyPolicy = () => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE_PRIVACY_POLICY)
  const [showLeavingNotice, setShowLeavingNotice] = useState(false)
  const showExternalLinkPopup = useSelector(
    (state: RootState) => state.profiles.clientProfile.show_external_link_popup,
  )

  const getNextDelay = getDelay()

  useEffect(() => {
    if (showExternalLinkPopup) {
      setShowLeavingNotice(true)
    } else {
      goToUrlLink(PRIVACY_POLICY_URL, true)
    }
  }, [showExternalLinkPopup])

  return (
    <div>
      {showLeavingNotice && (
        <SlideDown delay={getNextDelay()}>
          <LeavingNoticeFlat
            onCancel={() => {
              setShowLeavingNotice(false)
            }}
            onContinue={() => {
              goToUrlLink(PRIVACY_POLICY_URL, true)
              setShowLeavingNotice(false)
            }}
          />
        </SlideDown>
      )}
    </div>
  )
}
