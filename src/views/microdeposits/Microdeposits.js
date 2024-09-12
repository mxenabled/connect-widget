import React, { useEffect, useReducer, useImperativeHandle, useContext } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { defer, interval } from 'rxjs'
import { filter, mergeMap, pluck, scan, switchMap, take, tap } from 'rxjs/operators'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { RoutingNumber } from 'src/views/microdeposits/RoutingNumber'
import { HowItWorks } from 'src/views/microdeposits/HowItWorks'
import { PersonalInfoForm } from 'src/views/microdeposits/PersonalInfoForm'
import { AccountInfo } from 'src/views/microdeposits/AccountInfo'
import { ConfirmDetails } from 'src/views/microdeposits/ConfirmDetails'
import { ComeBack } from 'src/views/microdeposits/ComeBack'
import { VerifyDeposits } from 'src/views/microdeposits/VerifyDeposits'
import { MicrodepositErrors } from 'src/views/microdeposits/MicrodepositErrors'
import { Verifying } from 'src/views/microdeposits/Verifying'
import { Verified } from 'src/views/microdeposits/Verified'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { AccountFields } from 'src/views/microdeposits/const'

import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { ErrorStatuses } from 'src/views/microdeposits/const'
import { ActionTypes } from 'src/redux/actions/Connect'
import connectAPI from 'src/services/api'
import { PostMessageContext } from 'src/ConnectWidget'

export const VIEWS = {
  LOADING: 'loading',
  OOPS: 'oops',
  ROUTING_NUMBER: 'routingNumber',
  HOW_IT_WORKS: 'howItWorks',
  PERSONAL_INFO_FORM: 'personal_info_form',
  ACCOUNT_INFO: 'accountInfo',
  CONFIRM_DETAILS: 'confirmDetails',
  COME_BACK: 'comeBack',
  VERIFY_DEPOSITS: 'verifyDeposits',
  ERRORS: 'errors',
  VERIFYING: 'verifying',
  VERIFIED: 'verified',
}

const ACTIONS = {
  LOAD_MICRODEPOSITS_SUCCESS: 'microdeposits/load_microdeposits',
  LOAD_MICRODEPOSITS_BY_GUID_SUCCESS: 'microdeposits/load_microdeposits_by_guid_success',
  LOAD_MICRODEPOSITS_ERROR: 'microdeposits/load_microdeposits_error',
  SAVE_USER_DATA_SUCCESS: 'microdeposits/save_user_data_success',
  CREATE_MICRODEPOSIT_SUCCESS: 'microdeposits/create_microdeposit_success',
  CREATE_MICRODEPOSIT_ERROR: 'microdeposits/create_microdeposit_error',
  AMOUNTS_SUBMITTED: 'microdeposits/amounts_submitted',
  AMOUNTS_SUBMITTED_ERROR: 'microdeposits/amounts_submitted_error',
  VERIFYING_ERROR: 'microdeposits/verifying_error',
  VERIFYING_SUCCESS: 'microdeposits/verifying_success',
  VERIFY_DEPOSITS_ERROR: 'microdeposits/verifying/depositst/error',
  STEP_TO_HOW_IT_WORKS: 'micro_deposits/step_to_how_it_works',
  STEP_TO_PERSONAL_INFO_FORM: 'micro_deposits/step_to_personal_info_form',
  STEP_TO_ACCOUNT_INFO: 'micro_deposits/step_to_account_info',
  STEP_TO_CONFIRM_DETAILS: 'micro_deposits/step_to_confirm_details',
  STEP_TO_ROUTING_NUMBER: 'micro_deposits/step_to_routing_number',
  EDIT_DETAILS: 'micro_deposits/edit_details',
  RESET_MICRODEPOSITS: 'micro_deposits/reset_microdeposits',
}

const initialState = {
  // The view that should be rendered. Must be one of VIEWS.
  currentView: VIEWS.LOADING,
  // The error from loading the widget, if applicable
  loadingError: null,
  // The error from creating microdeposit
  microdepositCreateError: null,
  // The current microdeposit
  currentMicrodeposit: {},
  accountDetails: null,
  focus: null,
  returnToConfirm: false,
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_MICRODEPOSITS_BY_GUID_SUCCESS:
      return {
        ...state,
        accountDetails: action.payload,
        currentView: getViewByStatus(action.payload.status),
        currentMicrodeposit: action.payload,
        loadingError: initialState.loadingError,
      }
    case ACTIONS.LOAD_MICRODEPOSITS_SUCCESS:
      return {
        ...state,
        currentView: VIEWS.ROUTING_NUMBER,
        loadingError: initialState.loadingError,
      }
    case ACTIONS.LOAD_MICRODEPOSITS_ERROR:
      return {
        ...state,
        loadingError: action.payload.message,
        currentView: VIEWS.OOPS,
      }
    case ACTIONS.STEP_TO_HOW_IT_WORKS:
      return {
        ...state,
        currentView: VIEWS.HOW_IT_WORKS,
        accountDetails: action.payload ?? state.accountDetails,
      }
    case ACTIONS.STEP_TO_PERSONAL_INFO_FORM:
      return {
        ...state,
        currentView: VIEWS.PERSONAL_INFO_FORM,
        accountDetails: action.payload || state.accountDetails,
      }
    case ACTIONS.SAVE_USER_DATA_SUCCESS:
      return {
        ...state,
        currentView: VIEWS.CONFIRM_DETAILS,
        accountDetails: { ...state.accountDetails, ...action.payload },
      }
    case ACTIONS.STEP_TO_ACCOUNT_INFO:
      return {
        ...state,
        currentView: VIEWS.ACCOUNT_INFO,
        accountDetails: action.payload ?? state.accountDetails,
      }
    case ACTIONS.EDIT_DETAILS: {
      let currentView = VIEWS.ACCOUNT_INFO

      if (action.payload === AccountFields.ROUTING_NUMBER) {
        currentView = VIEWS.ROUTING_NUMBER
      } else if ([AccountFields.EMAIL, AccountFields.USER_NAME].includes(action.payload)) {
        currentView = VIEWS.PERSONAL_INFO_FORM
      }

      return {
        ...state,
        currentView,
        returnToConfirm: true,
        focus: action.payload,
      }
    }
    case ACTIONS.STEP_TO_CONFIRM_DETAILS:
      return {
        ...state,
        currentView: VIEWS.CONFIRM_DETAILS,
        accountDetails: action.payload,
      }
    case ACTIONS.STEP_TO_ROUTING_NUMBER:
      return {
        ...state,
        currentView: VIEWS.ROUTING_NUMBER,
      }
    case ACTIONS.CREATE_MICRODEPOSIT_SUCCESS:
      return {
        ...state,
        currentView: ErrorStatuses.includes(action.payload.status) ? VIEWS.ERRORS : VIEWS.COME_BACK,
        currentMicrodeposit: action.payload,
        accountDetails: initialState.accountDetails,
        microdepositCreateError: initialState.microdepositCreateError,
      }
    case ACTIONS.CREATE_MICRODEPOSIT_ERROR:
      return {
        ...state,
        currentView: VIEWS.ERRORS,
        microdepositCreateError: action.payload,
      }
    case ACTIONS.AMOUNTS_SUBMITTED:
      return {
        ...state,
        currentView: VIEWS.VERIFYING,
      }
    case ACTIONS.VERIFYING_ERROR:
      return {
        ...state,
        currentView: getViewByStatus(action.payload.status),
        currentMicrodeposit: action.payload,
      }
    case ACTIONS.VERIFYING_SUCCESS:
      return {
        ...state,
        currentView: VIEWS.VERIFIED,
        currentMicrodeposit: action.payload,
      }
    case ACTIONS.RESET_MICRODEPOSITS:
      return {
        ...initialState,
        currentView: VIEWS.ROUTING_NUMBER,
      }
    default:
      return state
  }
}

export const Microdeposits = React.forwardRef((props, navigationRef) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS)
  const [state, dispatch] = useReducer(reducer, initialState)
  const { microdepositGuid, stepToIAV } = props
  const postMessageFunctions = useContext(PostMessageContext)
  const reduxDispatch = useDispatch()
  const shouldShowUserDetails =
    !state.currentMicrodeposit.first_name ||
    !state.currentMicrodeposit.last_name ||
    !state.currentMicrodeposit.email

  /**
   * 1. Call loadMicrodepositByGuid() to get current status of Microdeposit
   * 2. Call refreshMicrodepositStatus() to tell backend to ask Dwolla for updated status
   * 3. Poll loadMicrodepositByGuid() and compare to microdeposit from step 1.
   *   - Once status has updated navigate to step based on new status
   */
  useEffect(() => {
    if (microdepositGuid) {
      const pollStatus = (originalMicrodeposit) =>
        interval(2000).pipe(
          switchMap(() => defer(() => connectAPI.loadMicrodepositByGuid(microdepositGuid))),
          scan(
            (acc, newMicrodeposit) => {
              return {
                newMicrodeposit,
                attempts: acc.attempts + 1,
              }
            },
            { newMicrodeposit: {}, attempts: 0 },
          ),
          filter(({ attempts, newMicrodeposit }) => {
            // If we have polled 3 attempts (6 seconds) without any updates
            // load based off current status
            if (attempts === 3) {
              return true
            }
            // If status is updated, load based off current status
            if (originalMicrodeposit.status !== newMicrodeposit.status) {
              return true
            }
            return false
          }),
          pluck('newMicrodeposit'),
          take(1),
        )

      const stream$ = defer(() => connectAPI.loadMicrodepositByGuid(microdepositGuid))
        .pipe(
          tap(() => connectAPI.refreshMicrodepositStatus(microdepositGuid)),
          mergeMap((originalMicrodeposit) => pollStatus(originalMicrodeposit)),
        )
        .subscribe(
          (microdeposit) => {
            postMessageFunctions.onPostMessage('connect/microdeposits/loaded', {
              initial_step: getViewByStatus(microdeposit.status),
            })

            return dispatch({
              type: ACTIONS.LOAD_MICRODEPOSITS_BY_GUID_SUCCESS,
              payload: microdeposit,
            })
          },
          (err) =>
            dispatch({
              type: ACTIONS.LOAD_MICRODEPOSITS_ERROR,
              payload: { message: err },
            }),
        )

      return () => stream$.unsubscribe()
    } else {
      postMessageFunctions.onPostMessage('connect/microdeposits/loaded', {
        initial_step: VIEWS.ROUTING_NUMBER,
      })

      dispatch({ type: ACTIONS.LOAD_MICRODEPOSITS_SUCCESS })

      return () => {}
    }
  }, [microdepositGuid])

  useImperativeHandle(navigationRef, () => {
    return {
      handleBackButton() {
        handleGoBack()
      },
      showBackButton() {
        return true
      },
    }
  }, [state.currentView])

  const handleGoBack = () => {
    switch (state.currentView) {
      case VIEWS.HOW_IT_WORKS:
        return dispatch({ type: ACTIONS.STEP_TO_ROUTING_NUMBER })
      case VIEWS.ACCOUNT_INFO:
        return dispatch({ type: ACTIONS.STEP_TO_HOW_IT_WORKS })
      case VIEWS.PERSONAL_INFO_FORM:
        return dispatch({ type: ACTIONS.STEP_TO_ACCOUNT_INFO })
      case VIEWS.CONFIRM_DETAILS:
        return dispatch({
          type: shouldShowUserDetails
            ? ACTIONS.STEP_TO_PERSONAL_INFO_FORM
            : ACTIONS.STEP_TO_ACCOUNT_INFO,
        })
      default:
        return reduxDispatch({ type: ActionTypes.EXIT_MICRODEPOSITS })
    }
  }

  // This allows us to bubble up the exception in the case of an endpoint failing
  // Which will show the GlobalErrorBoundary screen, while retaining the error
  if (state.currentView === VIEWS.OOPS) {
    throw state.loadingError
  }

  return (
    <React.Fragment>
      {state.currentView === VIEWS.LOADING && <LoadingSpinner />}

      {state.currentView === VIEWS.ROUTING_NUMBER && (
        <RoutingNumber
          accountDetails={state.accountDetails}
          handleGoBack={handleGoBack}
          onContinue={(accountDetails) =>
            dispatch({
              type: state.returnToConfirm
                ? ACTIONS.STEP_TO_CONFIRM_DETAILS
                : ACTIONS.STEP_TO_HOW_IT_WORKS,
              payload: accountDetails,
            })
          }
          stepToIAV={stepToIAV}
        />
      )}

      {state.currentView === VIEWS.HOW_IT_WORKS && (
        <HowItWorks
          handleGoBack={handleGoBack}
          onContinue={() => dispatch({ type: ACTIONS.STEP_TO_ACCOUNT_INFO })}
        />
      )}

      {state.currentView === VIEWS.PERSONAL_INFO_FORM && (
        <PersonalInfoForm
          accountDetails={state.accountDetails}
          handleGoBack={handleGoBack}
          onContinue={(userData) =>
            dispatch({ type: ACTIONS.SAVE_USER_DATA_SUCCESS, payload: userData })
          }
        />
      )}

      {state.currentView === VIEWS.ACCOUNT_INFO && (
        <AccountInfo
          accountDetails={state.accountDetails}
          focus={state.focus}
          handleGoBack={handleGoBack}
          onContinue={(accountDetails) => {
            if (state.returnToConfirm || !shouldShowUserDetails) {
              dispatch({ type: ACTIONS.STEP_TO_CONFIRM_DETAILS, payload: accountDetails })
            } else {
              dispatch({ type: ACTIONS.STEP_TO_PERSONAL_INFO_FORM, payload: accountDetails })
            }
          }}
        />
      )}

      {state.currentView === VIEWS.CONFIRM_DETAILS && (
        <ConfirmDetails
          accountDetails={state.accountDetails}
          currentMicrodeposit={state.currentMicrodeposit}
          handleGoBack={handleGoBack}
          onEditForm={(focus) =>
            dispatch({
              type: ACTIONS.EDIT_DETAILS,
              payload: focus,
            })
          }
          onError={(err) => dispatch({ type: ACTIONS.CREATE_MICRODEPOSIT_ERROR, payload: err })}
          onSuccess={(microdeposit) =>
            dispatch({ type: ACTIONS.CREATE_MICRODEPOSIT_SUCCESS, payload: microdeposit })
          }
          shouldShowUserDetails={shouldShowUserDetails}
        />
      )}

      {state.currentView === VIEWS.COME_BACK && (
        <ComeBack
          microdeposit={state.currentMicrodeposit}
          onDone={() => reduxDispatch({ type: ActionTypes.FINISH_MICRODEPOSITS })}
        />
      )}

      {state.currentView === VIEWS.VERIFY_DEPOSITS && (
        <VerifyDeposits
          amountsSubmittedError={state.amountsSubmittedError}
          microdeposit={state.currentMicrodeposit}
          onSuccess={() => dispatch({ type: ACTIONS.AMOUNTS_SUBMITTED })}
        />
      )}

      {state.currentView === VIEWS.ERRORS && (
        <MicrodepositErrors
          accountDetails={state.accountDetails}
          microdeposit={state.currentMicrodeposit}
          microdepositCreateError={state.microdepositCreateError}
          onResetMicrodeposits={() => reduxDispatch({ type: ActionTypes.FINISH_MICRODEPOSITS })}
          resetMicrodeposits={() => dispatch({ type: ACTIONS.RESET_MICRODEPOSITS })}
        />
      )}

      {state.currentView === VIEWS.VERIFYING && (
        <Verifying
          microdeposit={state.currentMicrodeposit}
          onError={(microdeposit) =>
            dispatch({ type: ACTIONS.VERIFYING_ERROR, payload: microdeposit })
          }
          onSuccess={(microdeposit) =>
            dispatch({ type: ACTIONS.VERIFYING_SUCCESS, payload: microdeposit })
          }
        />
      )}

      {state.currentView === VIEWS.VERIFIED && (
        <Verified
          microdeposit={state.currentMicrodeposit}
          onDone={() => reduxDispatch({ type: ActionTypes.FINISH_MICRODEPOSITS })}
        />
      )}

      <PrivateAndSecure />
    </React.Fragment>
  )
})

Microdeposits.propTypes = {
  microdepositGuid: PropTypes.string,
  stepToIAV: PropTypes.func.isRequired,
}

Microdeposits.displayName = 'Microdeposits'

const getViewByStatus = (status) => {
  if (status === MicrodepositsStatuses.PREINITIATED) {
    return VIEWS.ROUTING_NUMBER
  } else if ([MicrodepositsStatuses.INITIATED, MicrodepositsStatuses.REQUESTED].includes(status)) {
    return VIEWS.COME_BACK
  } else if ([MicrodepositsStatuses.DEPOSITED, MicrodepositsStatuses.DENIED].includes(status)) {
    return VIEWS.VERIFY_DEPOSITS
  } else if (status === MicrodepositsStatuses.VERIFIED) {
    return VIEWS.VERIFIED
  } else {
    return VIEWS.ERRORS
  }
}
