import React, { useReducer, useRef, useImperativeHandle, useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { fadeOut } from 'src/utilities/Animation'
import { ManualAccountForm } from 'src/views/manualAccount/ManualAccountForm'
import { ManualAccountMenu } from 'src/views/manualAccount/ManualAccountMenu'
import { ManualAccountSuccess } from 'src/views/manualAccount/ManualAccountSuccess'

import { selectInitialConfig } from 'src/redux/reducers/configSlice'
import { ActionTypes } from 'src/redux/actions/Connect'

import { PostMessageContext } from 'src/ConnectWidget'

export const ManualAccountConnect = React.forwardRef((props, ref) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_MANUAL_ACCOUNT)
  const formRef = useRef(null)
  const menuRef = useRef(null)
  const postMessageFunctions = useContext(PostMessageContext)
  const [showDayPicker, setShowDayPicker] = useState(false)
  const [state, dispatch] = useReducer(reducer, {
    showForm: false,
    showSuccess: false,
    // Autoload to the form if there is only one account type
    accountType: props.availableAccountTypes?.length === 1 ? props.availableAccountTypes[0] : null,
    validationErrors: {},
  })
  // Redux
  const initialConfig = useSelector(selectInitialConfig)

  useImperativeHandle(ref, () => {
    return {
      handleBackButton() {
        if (state.showForm && formRef.current) {
          fadeOut(formRef.current, 'up', 300).then(() => {
            dispatch({ type: Actions.CANCEL_FORM })
          })
        } else if (menuRef.current) {
          fadeOut(menuRef.current, 'up', 300).then(handleGoBackClick)
        }
      },
      showBackButton() {
        if (state.showSuccess || showDayPicker) {
          return false
        }
        return menuRef.current || formRef.current
      },
    }
  }, [state, showDayPicker])

  const handleAccountTypeSelect = (accountType) => {
    dispatch({ type: Actions.SELECT_ACCOUNT_TYPE, payload: accountType })
  }
  const handleGoBackClick = () => {
    postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)

    dispatch({
      type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
      payload: initialConfig,
    })
  }

  if (state.showSuccess) {
    return (
      <ManualAccountSuccess
        accountType={state.accountType}
        handleDone={() => {
          dispatch({
            type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
            payload: initialConfig,
          })
        }}
        onManualAccountAdded={props.onManualAccountAdded}
      />
    )
  }

  return (
    <React.Fragment>
      {state.showForm ? (
        <ManualAccountForm
          accountType={state.accountType}
          handleGoBack={() => {
            dispatch({ type: Actions.CANCEL_FORM })
          }}
          handleSuccess={() => {
            dispatch({ type: Actions.HANDLE_SUCCESS })
          }}
          ref={formRef}
          setShowDayPicker={setShowDayPicker}
          showDayPicker={showDayPicker}
        />
      ) : (
        <ManualAccountMenu
          availableAccountTypes={props.availableAccountTypes || []}
          handleAccountTypeSelect={handleAccountTypeSelect}
          ref={menuRef}
        />
      )}
    </React.Fragment>
  )
})

ManualAccountConnect.propTypes = {
  availableAccountTypes: PropTypes.array,
  onManualAccountAdded: PropTypes.func,
}

ManualAccountConnect.displayName = 'ManualAccountConnect'

const reducer = (state, action) => {
  switch (action.type) {
    case Actions.SELECT_ACCOUNT_TYPE:
      return {
        ...state,
        showForm: true,
        accountType: action.payload,
      }
    case Actions.CANCEL_FORM:
      return {
        ...state,
        showForm: false,
        accountType: null,
      }
    case Actions.HANDLE_SUCCESS:
      return {
        ...state,
        showSuccess: true,
        validationErrors: {},
      }
    default:
      return state
  }
}

const Actions = {
  SELECT_ACCOUNT_TYPE: 'manualAccount/selectAccountType',
  CANCEL_FORM: 'manualAccount/cancelForm',
  HANDLE_SUCCESS: 'manualAccount/handleSuccess',
}
