import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'

import * as connectActions from 'src/redux/actions/Connect'

import { getSize } from 'src/redux/selectors/Browser'
import { getCurrentMember, getMembers, getSelectedInstitution } from 'src/redux/selectors/Connect'
import {
  selectConnectConfig,
  selectIsMobileWebView,
  selectUIMessageVersion,
} from 'src/redux/reducers/configSlice'

import Disclosure from 'src/views/disclosure/Disclosure'
import { Search } from 'src/views/search/Search'
import MFAStep from 'src/views/mfa/MFAStep'
import { OAuthStep } from 'src/views/oauth/OAuthStep'
import { OAuthError } from 'src/views/oauth/OAuthError'
import { UpdateMemberForm } from 'src/views/credentials/UpdateMemberForm'
import { CreateMemberForm } from 'src/views/credentials/CreateMemberForm'
import { DeleteMemberSuccess } from 'src/views/deleteMemberSuccess/DeleteMemberSuccess'
import { Connecting } from 'src/views/connecting/Connecting'
import { LoginError } from 'src/views/loginError/LoginError'
import { ActionableError } from 'src/views/actionableError/ActionableError'
import { Connected } from 'src/views/connected/Connected'
import { Microdeposits } from 'src/views/microdeposits/Microdeposits'
import VerifyExistingMember from 'src/views/verification/VerifyExistingMember'
import { VerifyError } from 'src/views/verification/VerifyError'
import { ManualAccountConnect } from 'src/views/manualAccount/ManualAccountConnect'

import { AGG_MODE, VERIFY_MODE, STEPS } from 'src/const/Connect'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'
import { PostMessageContext } from 'src/ConnectWidget'
import useSelectInstitution from 'src/hooks/useSelectInstitution'
import { DynamicDisclosure } from 'src/views/consent/DynamicDisclosure'

const RenderConnectStep = (props) => {
  const postMessageFunctions = useContext(PostMessageContext)
  const connectConfig = useSelector(selectConnectConfig)
  const uiMessageVersion = useSelector(selectUIMessageVersion)
  const isMobileWebview = useSelector(selectIsMobileWebView)

  const client = useSelector((state) => state.profiles.client)
  const clientProfile = useSelector((state) => state.profiles.clientProfile)
  const widgetProfile = useSelector((state) => state.profiles.widgetProfile)

  const size = useSelector(getSize)
  const currentMicrodepositGuid = useSelector(
    (state) => state.connect?.currentMicrodepositGuid ?? null,
  )
  const step = useSelector(
    (state) => state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )
  const connectedMembers = useSelector(getMembers)
  const currentMember = useSelector(getCurrentMember)
  const selectedInstitution = useSelector(getSelectedInstitution)
  const updateCredentials = useSelector((state) => state.connect.updateCredentials)
  const verifyMemberError = useSelector((state) => state.connect.error)

  const { handleSelectInstitution } = useSelectInstitution()

  const dispatch = useDispatch()

  const tokens = useTokens()
  const styles = getStyles(tokens, step)

  const mode = connectConfig?.mode ?? AGG_MODE
  const isMicrodepositsEnabled =
    mode === VERIFY_MODE && // MDV is only enabled in verification
    clientProfile.account_verification_is_enabled && // Client supports verification
    clientProfile.is_microdeposits_enabled && // Client supports MDV
    widgetProfile.show_microdeposits_in_connect // Client shows MDV in Connect

  const hasAtriumAPI = client.has_atrium_api

  /**
   * To show the add manual accounts option, you have to have the profile enabled,
   * be in agg mode, and not be an atrium client.
   */
  const isManualAccountsEnabled =
    widgetProfile.enable_manual_accounts && mode === AGG_MODE && !hasAtriumAPI

  const showSupport = widgetProfile.enable_support_requests && mode === AGG_MODE
  const usePopularOnly =
    (clientProfile.uses_custom_popular_institution_list ?? false) ||
    (client.has_limited_institutions ?? false)
  const isDeleteInstitutionOptionEnabled = widgetProfile?.display_delete_option_in_connect ?? true

  const handleInstitutionSelect = (institution) => {
    postMessageFunctions.onPostMessage(
      'connect/selectedInstitution',
      _pick(institution, ['name', 'guid', 'url', 'code']),
    )

    // The institution doesn't have credentials until we request it again from server
    handleSelectInstitution(institution.guid)
  }

  let connectStepView = null

  if (step === STEPS.DISCLOSURE) {
    connectStepView = (
      <Disclosure
        mode={mode}
        onContinue={() =>
          dispatch({ type: connectActions.ActionTypes.ACCEPT_DISCLOSURE, payload: connectConfig })
        }
        ref={props.navigationRef}
        size={size}
      />
    )
  } else if (step === STEPS.SEARCH) {
    connectStepView = (
      <Search
        connectConfig={connectConfig}
        connectedMembers={connectedMembers}
        enableManualAccounts={isManualAccountsEnabled}
        enableSupportRequests={showSupport}
        isMicrodepositsEnabled={isMicrodepositsEnabled}
        onAddManualAccountClick={props.handleAddManualAccountClick}
        onInstitutionSelect={handleInstitutionSelect}
        ref={props.navigationRef}
        size={size}
        stepToMicrodeposits={() => dispatch(connectActions.stepToMicrodeposits())}
        usePopularOnly={usePopularOnly}
      />
    )
  } else if (step === STEPS.CONSENT) {
    connectStepView = (
      <div>
        <DynamicDisclosure
          onConsentClick={() => {
            dispatch({ type: connectActions.ActionTypes.USER_CONSENTED })
          }}
          onGoBackClick={() => {
            props.handleConsentGoBack()
          }}
          ref={props.navigationRef}
        />
      </div>
    )
  } else if (step === STEPS.ADD_MANUAL_ACCOUNT) {
    connectStepView = (
      <ManualAccountConnect
        availableAccountTypes={props.availableAccountTypes}
        onClose={() =>
          dispatch({
            type: connectActions.ActionTypes.GO_BACK_MANUAL_ACCOUNT,
            payload: connectConfig,
          })
        }
        onManualAccountAdded={props.onManualAccountAdded}
        ref={props.navigationRef}
      />
    )
  } else if (step === STEPS.ENTER_CREDENTIALS) {
    let showOAuth = false

    // To show OAuth step, the client profile must be set
    if (clientProfile.uses_oauth) {
      // If there is a current member, look to wether it supports oauth or
      // not to decide to show oauth.
      if (!_isEmpty(currentMember)) {
        showOAuth = currentMember.is_oauth
      } else {
        // If there is not a current member, look to the selected institution
        showOAuth = selectedInstitution.supports_oauth
      }
    }

    if (showOAuth) {
      connectStepView = (
        <OAuthStep
          institution={selectedInstitution}
          onGoBack={props.handleOAuthGoBack}
          ref={props.navigationRef}
        />
      )
    } else if (updateCredentials) {
      connectStepView = (
        <UpdateMemberForm
          navigationRef={props.navigationRef}
          onDeleteConnectionClick={() =>
            props.setConnectLocalState({ memberToDelete: currentMember })
          }
          onGoBackClick={() => {
            props.handleCredentialsGoBack()
          }}
          onUpsertMember={props.onUpsertMember}
        />
      )
    } else {
      connectStepView = (
        <CreateMemberForm
          navigationRef={props.navigationRef}
          onGoBackClick={() => {
            props.handleCredentialsGoBack()
          }}
          onUpsertMember={props.onUpsertMember}
        />
      )
    }
  } else if (step === STEPS.MICRODEPOSITS && isMicrodepositsEnabled) {
    connectStepView = (
      <Microdeposits
        microdepositGuid={currentMicrodepositGuid}
        ref={props.navigationRef}
        stepToIAV={(guid) => {
          handleSelectInstitution(guid)
          // Set returnToMicrodeposits to true so if user clicks go back, they are taken to MDV
          props.setConnectLocalState({ returnToMicrodeposits: true })
        }}
      />
    )
  } else if (step === STEPS.CONNECTING) {
    connectStepView = (
      <Connecting
        connectConfig={connectConfig}
        hasAtriumAPI={hasAtriumAPI}
        institution={selectedInstitution}
        isMobileWebview={isMobileWebview}
        onUpsertMember={props.onUpsertMember}
        uiMessageVersion={uiMessageVersion}
      />
    )
  } else if (step === STEPS.MFA) {
    connectStepView = (
      <MFAStep
        enableSupportRequests={showSupport}
        institution={selectedInstitution}
        onGoBack={() => {
          postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)

          dispatch({
            type: connectActions.ActionTypes.RESET_WIDGET_MFA_STEP,
            payload: connectConfig,
          })
        }}
        ref={props.navigationRef}
      />
    )
  } else if (step === STEPS.ACTIONABLE_ERROR) {
    // We are slowly adding codes and statuses to use ActionableError instead of LoginError.
    // AED Step 2: Add codes or statuses to show new ACTIONABLE_ERROR
    connectStepView = [ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS].includes(
      currentMember?.most_recent_job_detail_code ?? -1,
    ) ? (
      <ActionableError />
    ) : (
      <LoginError
        institution={selectedInstitution}
        isDeleteInstitutionOptionEnabled={isDeleteInstitutionOptionEnabled}
        member={currentMember}
        onDeleteConnectionClick={() =>
          props.setConnectLocalState({ memberToDelete: currentMember })
        }
        onRefreshClick={() => dispatch(connectActions.stepToConnecting())}
        onUpdateCredentialsClick={() => dispatch(connectActions.stepToUpdateCredentials())}
        ref={props.navigationRef}
        showExternalLinkPopup={clientProfile.show_external_link_popup}
        showSupport={showSupport}
        size={size}
      />
    )
  } else if (step === STEPS.VERIFY_EXISTING_MEMBER) {
    connectStepView = (
      <VerifyExistingMember
        members={connectedMembers}
        onAddNew={() => dispatch(connectActions.verifyDifferentConnection())}
      />
    )
  } else if (step === STEPS.VERIFY_ERROR) {
    connectStepView = (
      <VerifyError
        error={verifyMemberError}
        onGoBack={() => dispatch(connectActions.stepToVerifyExistingMember())}
      />
    )
  } else if (step === STEPS.CONNECTED) {
    connectStepView = (
      <Connected
        currentMember={currentMember}
        institution={selectedInstitution}
        onContinueClick={() => {
          dispatch({ type: connectActions.ActionTypes.RESET_WIDGET_CONNECTED })
        }}
        onSuccessfulAggregation={props.onSuccessfulAggregation}
        ref={props.navigationRef}
      />
    )
  } else if (step === STEPS.DELETE_MEMBER_SUCCESS) {
    connectStepView = (
      <DeleteMemberSuccess
        institution={selectedInstitution}
        onContinueClick={() => {
          postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)
          dispatch({
            type: connectActions.ActionTypes.DELETE_MEMBER_SUCCESS_RESET,
            payload: connectConfig,
          })
        }}
      />
    )
  } else if (step === STEPS.OAUTH_ERROR) {
    connectStepView = (
      <OAuthError
        currentMember={currentMember}
        institution={selectedInstitution}
        onRetry={() => dispatch(connectActions.retryOAuth())}
        onReturnToSearch={props.handleOAuthGoBack}
        ref={props.navigationRef}
      />
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>{connectStepView}</div>
    </div>
  )
}

RenderConnectStep.propTypes = {
  availableAccountTypes: PropTypes.array,
  handleAddManualAccountClick: PropTypes.func.isRequired,
  handleConsentGoBack: PropTypes.func.isRequired,
  handleCredentialsGoBack: PropTypes.func.isRequired,
  handleOAuthGoBack: PropTypes.func.isRequired,
  navigationRef: PropTypes.func.isRequired,
  onManualAccountAdded: PropTypes.func,
  onSuccessfulAggregation: PropTypes.func,
  onUpsertMember: PropTypes.func,
  setConnectLocalState: PropTypes.func.isRequired,
}

RenderConnectStep.displayName = 'RenderConnectStep'

const getStyles = (tokens, step) => {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      minHeight: 'calc(100% - 60px)',
      maxHeight: step === STEPS.SEARCH ? 'calc(100% - 60px)' : null,
      display: 'flex',
      justifyContent: 'center',
    },
    content: {
      maxWidth: '352px', // Our max content width (does not include side margin)
      minWidth: '270px', // Our min content width (does not include side margin)
      width: '100%', // We want this container to shrink and grow between our min-max
      margin: `0px ${tokens.Spacing.Large}px ${tokens.Spacing.Large}px`,
    },
  }
}

export default RenderConnectStep
