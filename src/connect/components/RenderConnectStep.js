import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'

import * as connectActions from 'reduxify/actions/Connect'
import { ActionTypes as PostMessageActionTypes } from 'reduxify/actions/PostMessage'

import { getSize } from 'reduxify/selectors/Browser'
import { getCurrentMember, getMembers } from 'reduxify/selectors/Connect'
import { shouldShowConnectGlobalNavigationHeader } from 'reduxify/selectors/UserFeatures'
import { selectConnectConfig, selectAppConfig } from 'reduxify/reducers/configSlice'

import { Container } from 'src/connect/components/Container'
import { Search } from 'src/connect/views/search/Search'

import { AGG_MODE, VERIFY_MODE, STEPS } from 'src/connect/const/Connect'
import { POST_MESSAGES } from 'src/connect/const/postMessages'

const RenderConnectStep = (props) => {
  const connectConfig = useSelector(selectConnectConfig)
  const appConfig = useSelector(selectAppConfig)
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
  const selectedInstitution = useSelector((state) => state.connect.selectedInstitution)
  const updateCredentials = useSelector((state) => state.connect.updateCredentials)
  const verifyMemberError = useSelector((state) => state.connect.error)
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)

  const dispatch = useDispatch()

  const tokens = useTokens()
  const styles = getStyles(tokens, step)

  const mode = connectConfig?.mode ?? AGG_MODE
  const isMicrodepositsEnabled =
    mode === VERIFY_MODE && // MDV is only enabled in verification
    clientProfile.account_verification_is_enabled && // Client supports verification
    clientProfile.is_microdeposits_enabled && // Client supports MDV
    widgetProfile.show_microdeposits_in_connect // Client shows MDV in Connect

  /**
   * To show the add manual accounts option, you have to have the profile enabled,
   * be in agg mode, and not be an atrium client.
   */
  const isManualAccountsEnabled =
    widgetProfile.enable_manual_accounts && mode === AGG_MODE && !hasAtriumAPI

  const showSupport = widgetProfile.enable_support_requests && mode === AGG_MODE
  const hasAtriumAPI = client.has_atrium_api
  const usePopularOnly =
    (clientProfile.uses_custom_popular_institution_list ?? false) ||
    (client.has_limited_institutions ?? false)
  const isDeleteInstitutionOptionEnabled = widgetProfile?.display_delete_option_in_connect ?? true
  const uiMessageVersion = appConfig?.ui_message_version ?? null
  const isMobileWebview = appConfig?.is_mobile_webview ?? false

  const sendPostMessage = (event, data) =>
    dispatch({
      type: PostMessageActionTypes.SEND_POST_MESSAGE,
      payload: { event, data },
    })

  const handleInstitutionSelect = (institution) => {
    sendPostMessage(
      'connect/selectedInstitution',
      _pick(institution, ['name', 'guid', 'url', 'code']),
    )

    // The institution doesn't have credentials until we request it again from server
    dispatch(connectActions.selectInstitution(institution.guid))
  }

  let connectStepView = null

  if (step === STEPS.SEARCH) {
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
  }

  return showConnectGlobalNavigationHeader ? (
    <div style={styles.container}>
      <div style={styles.content}>{connectStepView}</div>
    </div>
  ) : (
    <Container step={step}>{connectStepView}</Container>
  )
}

RenderConnectStep.propTypes = {
  availableAccountTypes: PropTypes.array,
  handleAddManualAccountClick: PropTypes.func.isRequired,
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
