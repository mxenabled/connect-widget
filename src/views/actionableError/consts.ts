import { AGG_MODE } from 'src/const/Connect'
import { ActionTypes } from 'src/redux/actions/Connect'
import store from 'src/redux/Store'
import { __ } from 'src/utilities/Intl'

const ACTION_MAPPING = {
  LOG_IN_AGAIN: {
    label: __('Log in again'),
    action: () => store.dispatch({ type: ActionTypes.ACTIONABLE_ERROR_LOG_IN_AGAIN }),
  },
  CONNECT_DIFFERENT_INSTITUTION: {
    label: __('Connect a different institution'),
    action: () =>
      store.dispatch({
        type: ActionTypes.ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION,
        payload: store.getState().config.mode || AGG_MODE,
      }),
  },
}

// AED Step 1: Add new codes here
export const ACTIONABLE_ERROR_CODES = {
  NO_ELIGIBLE_ACCOUNTS: 1000,
}

// AED Step 2: Add code mapping for new codes here
export const actionableErrorCodeMapping = {
  [ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS]: {
    title: __('No eligible accounts'),
    user_message: (institution: InstitutionResponseType) =>
      __(
        'Only checking or savings accounts can be used for transfers. If you have one at %1, make sure to select it when connecting. Otherwise, try connecting a different institution.',
        institution.name,
      ),
    primaryAction: ACTION_MAPPING.LOG_IN_AGAIN,
    secondaryActions: [ACTION_MAPPING.CONNECT_DIFFERENT_INSTITUTION],
  },
}
