import { useContext, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PostMessageContext } from 'src/ConnectWidget'
import { ActionTypes } from 'src/redux/actions/Connect'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'
import { __ } from 'src/utilities/Intl'
import { selectInitialConfig } from 'src/redux/reducers/configSlice'
import { AGG_MODE } from 'src/const/Connect'

type ActionableErrorAction = {
  label: string
  action: () => void
}
type ActionableErrorMapEntry = {
  title: string
  primaryAction: ActionableErrorAction
  secondaryActions: ActionableErrorAction
}

export const useActionableErrorMap = (
  jobDetailCode: number,
  setShowSupport: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const postMessageFunctions = useContext(PostMessageContext)
  const initialConfig = useSelector(selectInitialConfig)
  const dispatch = useDispatch()

  // Action options for mapping below
  const goToSearch = () => {
    postMessageFunctions.onPostMessage('connect/backToSearch')
    dispatch({
      type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
      payload: initialConfig.mode || AGG_MODE,
    })
  }
  const goToSupport = () => setShowSupport(true)
  const goToCredentials = () => dispatch({ type: ActionTypes.ACTIONABLE_ERROR_LOG_IN_AGAIN })

  // AED Step 3: Add code mapping for new codes here
  const messagingMap: Record<string, ActionableErrorMapEntry> = useMemo(
    () => ({
      [ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS]: {
        title: __('No eligible accounts'),
        primaryAction: { label: __('Log in again'), action: goToCredentials },
        secondaryActions: { label: __('Connect a different institution'), action: goToSearch },
      },
      [ACTIONABLE_ERROR_CODES.NO_ACCOUNTS]: {
        title: __('No accounts found'),
        primaryAction: { label: __('Return to institution selection'), action: goToSearch },
        secondaryActions: { label: __('Get help'), action: goToSupport },
      },
      [ACTIONABLE_ERROR_CODES.ACCESS_DENIED]: {
        title: __('Additional permissions needed'),
        primaryAction: { label: __('Review instructions'), action: goToCredentials },
        secondaryActions: { label: __('Get help'), action: goToSupport },
      },
      [ACTIONABLE_ERROR_CODES.INSTITUTION_DOWN]: {
        title: __('Unable to connect'),
        primaryAction: { label: __('Return to institution selection'), action: goToSearch },
        secondaryActions: { label: __('Get help'), action: goToSupport },
      },
      [ACTIONABLE_ERROR_CODES.INSTITUTION_MAINTENANCE]: {
        title: __('Maintenance in progress'),
        primaryAction: { label: __('Return to institution selection'), action: goToSearch },
        secondaryActions: { label: __('Get help'), action: goToSupport },
      },
      [ACTIONABLE_ERROR_CODES.INSTITUTION_UNAVAILABLE]: {
        title: __('Unable to connect'),
        primaryAction: { label: __('Return to institution selection'), action: goToSearch },
        secondaryActions: { label: __('Get help'), action: goToSupport },
      },
    }),
    [dispatch],
  )

  return messagingMap[jobDetailCode]
}
