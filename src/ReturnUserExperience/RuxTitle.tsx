import React from 'react'
import { useSelector } from 'react-redux'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { Text } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'
import styles from './returnUserExperience.module.css' // TODO: Update this
import { RootState } from 'src/redux/Store'
import { RUXViews } from 'src/ReturnUserExperience/ReturnUserExperience'

export const RuxTitle = ({
  userEnteredPhone,
  view,
}: {
  userEnteredPhone: string
  view: (typeof RUXViews)[keyof typeof RUXViews]
}) => {
  const appName = useSelector(
    (state: RootState) => state.profiles.client.oauth_app_name || 'This app',
  )
  const [{ title, description }, setTitleAndDescription] = React.useState({
    title: '',
    description: '',
  })

  React.useEffect(() => {
    switch (view) {
      case RUXViews.INFO:
        setTitleAndDescription({
          title: __('Connect your accounts'),
          description: __('%1 uses MX to connect your accounts.', appName),
        })
        break
      case RUXViews.PHONE_NUMBER:
        setTitleAndDescription({
          title: __('Sign in with your phone'),
          description: __('Sign into MX to securely access your accounts.'),
        })
        break
      case RUXViews.OTP:
        setTitleAndDescription({
          title: __('Verify your phone number'),
          description: __('Enter the code sent to %1', userEnteredPhone),
        })
        break
      case RUXViews.LIST:
        setTitleAndDescription({
          title: __('Select your institution'),
          description: __('Choose a previously connected institution or add a new one.'),
        })
        break
      default:
        setTitleAndDescription({
          title: '',
          description: '',
        })
    }
  }, [view, appName])

  return (
    <Stack spacing="6px" sx={{ paddingTop: '16px', paddingRight: '16px', paddingLeft: '16px' }}>
      <Text bold={true} className={styles.centerText} truncate={false} variant="h2">
        {title}
      </Text>
      <Text className={styles.centerText} truncate={false} variant="subtitle1">
        {description}
        <LearnMoreMXLink show={[RUXViews.INFO, RUXViews.PHONE_NUMBER].includes(view)} />
      </Text>
    </Stack>
  )
}

export default RuxTitle

const LearnMoreMXLink = ({ show = false }: { show?: boolean }) =>
  show && (
    <>
      {' '}
      <Link color="primary" href="https://mx.com/learn-more" underline="hover" variant="subtitle1">
        {__('Learn more about MX.')}
      </Link>
    </>
  )
