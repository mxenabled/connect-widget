import React from 'react'

import styles from './returnUserExperience.module.css'
import RuxLogosHeader from 'src/ReturnUserExperience/RuxLogosHeader'
import RuxTitle from 'src/ReturnUserExperience/RuxTitle'
import RuxInfo from 'src/ReturnUserExperience/RuxInfo'

import { __ } from 'src/utilities/Intl'

export const RUXViews = {
  INFO: 'info',
  PHONE_NUMBER: 'phoneNumber',
  OTP: 'otp',
  LIST: 'list',
}

export const ReturnUserExperience = () => {
  const [view, setView] = React.useState<(typeof RUXViews)[keyof typeof RUXViews]>(RUXViews.INFO)
  const [userEnteredPhone, _setUserEnteredPhone] = React.useState('')

  return (
    <div className={styles.pageContainer}>
      <RuxLogosHeader show={view !== RUXViews.LIST} />
      <RuxTitle userEnteredPhone={userEnteredPhone} view={view} />

      {view === RUXViews.INFO && (
        <RuxInfo handleRuxContinue={() => setView(RUXViews.PHONE_NUMBER)} />
      )}
    </div>
  )
}

export default ReturnUserExperience
