import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import styles from './returnUserExperience.module.css'
import RuxInfo from 'src/ReturnUserExperience/RuxInfo'
import { RuxPhoneNumber } from 'src/ReturnUserExperience/RuxPhoneNumber'

import { Stack } from '@mui/material'
import { Icon } from '@mxenabled/mxui'
import { MXLogoFilledIcon } from '@mxenabled/mxui'

import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { __ } from 'src/utilities/Intl'
import { AnalyticEvents } from 'src/const/Analytics'
import { RootState } from 'src/redux/Store'
import { ActionTypes } from 'src/redux/actions/Connect'
import { selectInitialConfig } from 'src/redux/reducers/configSlice'
import { ClientLogo } from 'src/components/ClientLogo'

export const RUXViews = {
  INFO: 'info',
  PHONE_NUMBER: 'phoneNumber',
  OTP: 'otp',
  LIST: 'list',
}

export const ReturnUserExperience = React.forwardRef(() => {
  const [view, setView] = React.useState<(typeof RUXViews)[keyof typeof RUXViews]>(RUXViews.INFO)
  const [userEnteredPhone, setUserEnteredPhone] = React.useState('')
  const clientGuid = useSelector((state: RootState) => state.profiles.client.guid)
  const connectConfig = useSelector(selectInitialConfig)
  const dispatch = useDispatch()
  const sendAnalyticsEvent = useAnalyticsEvent()

  const handleRuxInfoContinue = () => {
    // This is currently skipping the backend. See epic/ticket for more details.
    sendAnalyticsEvent(AnalyticEvents.RUX_INFO_CONTINUE_CLICKED)
    setView(RUXViews.PHONE_NUMBER)
  }
  const handleContinueWithoutPhone = () =>
    dispatch({ type: ActionTypes.RESET_WIDGET_MFA_STEP, payload: connectConfig })

  return (
    <div className={styles.pageContainer}>
      {view !== RUXViews.LIST && (
        <Stack className={styles.logoHeaders} direction="row" spacing="8px">
          {view === RUXViews.INFO && (
            <>
              <div className={styles.clientLogo}>
                <ClientLogo alt="Client logo" clientGuid={clientGuid} size={64} />
              </div>
              <Icon name="add" size={20} />
            </>
          )}
          <div className={styles.mxLogo}>
            <MXLogoFilledIcon size={64} />
          </div>
        </Stack>
      )}

      {view === RUXViews.INFO && <RuxInfo handleRuxContinue={handleRuxInfoContinue} />}

      {view === RUXViews.PHONE_NUMBER && (
        <RuxPhoneNumber
          handleContinueWithoutPhone={handleContinueWithoutPhone}
          handleRuxContinue={() => {
            // sendAnalyticsEvent(AnalyticEvents.RUX_PHONE_NUMBER_CONTINUE_CLICKED)
            setView(RUXViews.OTP)
          }}
          setUserEnteredPhone={setUserEnteredPhone}
          userEnteredPhone={userEnteredPhone}
        />
      )}

      {view === RUXViews.PHONE_NUMBER && (
        <RuxPhoneNumber
          setUserEnteredPhone={setUserEnteredPhone}
          userEnteredPhone={userEnteredPhone}
        />
      )}

      {view === RUXViews.PHONE_NUMBER && (
        <RuxPhoneNumber
          setUserEnteredPhone={setUserEnteredPhone}
          userEnteredPhone={userEnteredPhone}
        />
      )}
    </div>
  )
})

ReturnUserExperience.displayName = 'ReturnUserExperience'

export default ReturnUserExperience
