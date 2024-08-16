import React, { useReducer, useRef, useImperativeHandle } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { ActionTypes as PostMessageActionTypes } from 'src/redux/actions/PostMessage'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { fadeOut } from 'src/utilities/Animation'
import { ManualAccountForm } from 'src/views/manualAccount/ManualAccountForm'
import { ManualAccountMenu } from 'src/views/manualAccount/ManualAccountMenu'
import { ManualAccountSuccess } from 'src/views/manualAccount/ManualAccountSuccess'

export const ManualAccountConnect = React.forwardRef((props, ref) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_MANUAL_ACCOUNT)
  const formRef = useRef(null)
  const menuRef = useRef(null)
  const reduxDispatch = useDispatch()
  const [state, dispatch] = useReducer(reducer, {
    showForm: false,
    showSuccess: false,
    // Autoload to the form if there is only one account type
    accountType: props.availableAccountTypes?.length === 1 ? props.availableAccountTypes[0] : null,
    validationErrors: {},
  })

  useImperativeHandle(ref, () => {
    return {
      handleBackButton() {
        if (state.showForm) {
          fadeOut(formRef.current, 'up', 300).then(() => {
            dispatch({ type: Actions.CANCEL_FORM })
          })
        } else {
          fadeOut(menuRef.current, 'up', 300).then(handleGoBackClick)
        }
      },
      showBackButton() {
        if (state.showSuccess) {
          return false
        }
        return true
      },
    }
  }, [state])

  const handleAccountTypeSelect = (accountType) => {
    dispatch({ type: Actions.SELECT_ACCOUNT_TYPE, payload: accountType })
  }
  const handleGoBackClick = () => {
    reduxDispatch({
      type: PostMessageActionTypes.SEND_POST_MESSAGE,
      payload: {
        event: POST_MESSAGES.BACK_TO_SEARCH,
        data: {},
      },
    })

    props.onClose()
  }

  if (state.showSuccess) {
    return (
      <ManualAccountSuccess
        accountType={state.accountType}
        handleDone={() => {
          props.onClose()
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
        />
      ) : (
        <ManualAccountMenu
          availableAccountTypes={props.availableAccountTypes || []}
          handleAccountTypeSelect={handleAccountTypeSelect}
          handleGoBack={handleGoBackClick}
          ref={menuRef}
        />
      )}
    </React.Fragment>
  )
})

ManualAccountConnect.propTypes = {
  availableAccountTypes: PropTypes.array,
  onClose: PropTypes.func.isRequired,
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
