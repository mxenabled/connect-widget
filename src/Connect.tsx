/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect, useState, useContext, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import _isEqual from 'lodash/isEqual'
import _isNil from 'lodash/isNil'
import _toLower from 'lodash/toLower'
import { Message, sha256 } from 'js-sha256'
// import 'posthog-js/dist/recorder-v2' // Added for security requirements to use PostHog Session Recording
import { TokenContext } from '@kyper/tokenprovider'
import { usePrevious } from '@kyper/hooks'

import * as connectActions from 'src/redux/actions/Connect'
import { addAnalyticPath, removeAnalyticPath } from 'src/redux/reducers/analyticsSlice'

import { loadUserFeatures } from 'src/redux/reducers/userFeaturesSlice'
import { loadProfiles } from 'src/redux/reducers/profilesSlice'
import {
  selectConnectConfig,
  selectIsMobileWebView,
  selectUIMessageVersion,
} from 'src/redux/reducers/configSlice'

import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { GenericError } from 'src/components/GenericError'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { DeleteMemberSurvey } from 'src/components/DeleteMemberSurvey'
import { ConnectNavigationHeader } from 'src/components/ConnectNavigationHeader'

import { AnalyticEvents, defaultEventMetadata, PageviewInfo } from 'src/const/Analytics'
import { AGG_MODE, VERIFY_MODE, TAX_MODE, STEPS } from 'src/const/Connect'
import { POST_MESSAGES } from 'src/const/postMessages'

import PostMessage from 'src/utilities/PostMessage'
import { __ } from 'src/utilities/Intl'
import type { RootState } from 'reduxify/Store'
import useLoadConnect from 'src/hooks/useLoadConnect'
import { PostMessageContext } from 'src/ConnectWidget'

type ConnectState = {
  memberToDelete: object | null
  returnToMicrodeposits: boolean
  stepComponentRef: object | null
}

interface ConfigMetadata {
  disable_institution_search: boolean
  include_identity: boolean | null
  include_transactions: boolean | null
  current_member_guid: string | null
  current_institution_guid: string | null
  current_institution_code: any
  initial_step: string
  mode: string
}

export const AnalyticContext = createContext<AnalyticContextType>({
  onAnalyticEvent: () => {},
  onAnalyticPageview: () => {},
})

export const Connect: React.FC<ConnectProps> = ({
  availableAccountTypes = [],
  onManualAccountAdded = () => {},
  onMemberDeleted = () => {},
  onSuccessfulAggregation = () => {},
  onUpsertMember = () => {},
  onAnalyticEvent = () => {},
  onAnalyticPageview = () => {},
  ...props
}) => {
  const connectConfig = useSelector(selectConnectConfig)
  const loadError = useSelector((state: RootState) => state.connect.loadError)
  const hasAtriumAPI = useSelector((state: RootState) => state.profiles.client?.has_atrium_api)
  const isLoading = useSelector((state: RootState) => state.connect.isComponentLoading)
  const isMobileWebview = useSelector(selectIsMobileWebView)
  const isVerificationEnabled = useSelector(
    (state: RootState) => state.profiles.clientProfile.account_verification_is_enabled,
  )
  const isTaxStatementIsEnabled = useSelector(
    (state: RootState) => state.profiles.clientProfile.tax_statement_is_enabled,
  )
  const step = useSelector(
    (state: RootState) =>
      state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )
  const uiMessageVersion = useSelector(selectUIMessageVersion)
  const prevProps = usePrevious({ isLoading, step, clientConfig: props.clientConfig })
  const { loadConnect } = useLoadConnect()
  const postMessageFunctions = useContext(PostMessageContext)
  const [state, setState] = useState<ConnectState>({
    memberToDelete: null,
    // The `returnToMicrodeposits` is a temp fix to address the go back button.
    // We want to refactor how we handle the go back which will fix this too.
    returnToMicrodeposits: false,
    stepComponentRef: null, // This holds a reference to the current step component.
  })

  const dispatch = useDispatch()

  useEffect(() => {
    const [name, path] = PageviewInfo.CONNECT
    const mode = props.clientConfig.mode

    dispatch(addAnalyticPath({ name, path: `${path}/${mode}` }))

    return () => {
      dispatch(removeAnalyticPath(`${PageviewInfo.CONNECT[1]}/${mode}`))
    }
  }, [])

  useEffect(() => {
    // When Connect is being used within our SDK's, we need to support an OS level back action
    // We listen to a specific event to handle our postMessage callback with our `did_go_back` boolean
    // To allow the host to know if we are still within Connect or to close it.
    window.addEventListener('message', _handleNavigationPostMessage)

    loadConnect(props.clientConfig)
    dispatch(loadProfiles(props.profiles))
    dispatch(loadUserFeatures(props.userFeatures))

    // Also important to note that this is a race condition between connect
    // mounting and the master data loading the client data. It just so happens
    // that it is usually faster.
    if (hasAtriumAPI && isMobileWebview && uiMessageVersion < 4) {
      // eslint-disable-next-line no-extra-semi
      ;(window as Window).location = 'atrium://mxConnectLoaded'
    } else if (hasAtriumAPI && uiMessageVersion < 4) {
      // This is an old post message that has to be sent out or we break the atrium javascript loader
      PostMessage.send('mxConnect:widgetLoaded')
    }
    return () => {
      dispatch(connectActions.resetConnect())
      window.removeEventListener('message', _handleNavigationPostMessage)
    }
  }, [])

  useEffect(() => {
    const isFirstTimeLoading = prevProps?.isLoading && !isLoading

    // If this is the first time loading Connect:
    //  - Send out PostHog Event with config data and initial step.
    //  - Send out GA Event with initial step.
    //  - Send out the loaded post message with the initial step.
    if (isFirstTimeLoading) {
      const config = connectConfig
      const metadata: ConfigMetadata = {
        initial_step: step,
        mode: _toLower(config.mode) || AGG_MODE,
        disable_institution_search: false,
        include_identity: false,
        include_transactions: false,
        current_member_guid: '',
        current_institution_guid: '',
        current_institution_code: undefined,
      }

      if (!_isNil(config.disable_institution_search))
        metadata.disable_institution_search = config.disable_institution_search
      if (!_isNil(config.include_identity)) metadata.include_identity = config.include_identity
      if (!_isNil(config.include_transactions))
        metadata.include_transactions = config.include_transactions
      if (!_isNil(config.current_member_guid))
        metadata.current_member_guid = sha256(config.current_member_guid as Message)
      if (!_isNil(config.current_institution_guid))
        metadata.current_institution_guid = config.current_institution_guid
      if (!_isNil(config.current_institution_code))
        metadata.current_institution_code = config.current_institution_code

      if (onAnalyticEvent) {
        onAnalyticEvent(`connect_${AnalyticEvents.WIDGET_LOAD}`, {
          ...defaultEventMetadata,
          ...metadata,
        })
      }
      postMessageFunctions.onPostMessage('connect/loaded', { initial_step: step })
    } else if (prevProps?.step !== step) {
      // Otherwise if the step changed send out the message with prev and current
      postMessageFunctions.onPostMessage('connect/stepChange', {
        previous: prevProps?.step,
        current: step,
      })
    }

    // if clientConfig prop changes while connect is already loaded update connect
    if (!_isEqual(prevProps?.clientConfig, props.clientConfig)) {
      loadConnect(props.clientConfig)
    }
  }, [isLoading, step, props.clientConfig])

  const _handleNavigationPostMessage = (event: MessageEvent) => {
    const eventData = PostMessage.parse(event.data)
    if (eventData.type === 'mx/navigation') {
      // Specifically looking for the 'back' action, in the future we could support others
      if (eventData.payload.action === 'back') {
        const dontChangeConnectStep =
          step === STEPS.SEARCH ||
          step === STEPS.DISCLOSURE ||
          step === STEPS.VERIFY_EXISTING_MEMBER ||
          connectConfig.disable_institution_search

        if (dontChangeConnectStep) {
          // We consider SEARCH and DISCLOSURE to be as far back as Connect goes.
          // Loaded in verify mode, we show VERIFY_EXISTING_MEMBER as the root.
          // If disable_institution_search is `true`, we do not show the SEARCH step.
          // If any of those conditions are met, we do not change the step when a back navigation event is received.
          // Communicate that we did not go back to the SDK via the `did_go_back` payload.
          postMessageFunctions.onPostMessage('navigation', { did_go_back: false })
        } else {
          // We want to reset connect by taking us back to the SEARCH or VERIFY_EXISTING_MEMBER step depending on config
          dispatch({
            type: connectActions.ActionTypes.GO_BACK_POST_MESSAGE,
            payload: connectConfig,
          })

          // And communicating that we did go back to the SDK
          postMessageFunctions.onPostMessage('navigation', { did_go_back: true })
        }
      }
    }
  }

  const _handleAddManualAccountClick = () => {
    dispatch(connectActions.stepToAddManualAccount())
  }

  const _handleCredentialsGoBack = () => {
    // If returnToMicrodeposits is true, we came from MDV and clicking go back should return to MDV
    if (state.returnToMicrodeposits) {
      dispatch(connectActions.stepToMicrodeposits())
      setState({ ...state, returnToMicrodeposits: false })
    } else {
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH, {})

      dispatch({ type: connectActions.ActionTypes.GO_BACK_CREDENTIALS, payload: connectConfig })
    }
  }

  const _handleOAuthGoBack = () => {
    // If returnToMicrodeposits is true, we came from MDV and clicking go back should return to MDV
    if (state.returnToMicrodeposits) {
      dispatch(connectActions.stepToMicrodeposits())
      setState({ ...state, returnToMicrodeposits: false })
    } else {
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH, {})

      dispatch({ type: connectActions.ActionTypes.GO_BACK_OAUTH, payload: connectConfig })
    }
  }

  /**
   * We use a callback ref here, so that we can get notified
   * When the corresponding step component has been mounted in the DOM.
   * This is to ensure that the step component has the custom methods attached (if any)
   * Before we can act on it.
   */
  const _handleStepDOMChange = useCallback((ref: any) => {
    setState((prevState) => ({ ...prevState, stepComponentRef: ref }))
  }, [])

  const mode = connectConfig?.mode ?? AGG_MODE

  const IS_IN_TAX_MODE = mode === TAX_MODE
  const IS_IN_VERIFY_MODE = mode === VERIFY_MODE

  /**
   * For Microdeposits to be enabled, you have to have verification enabled,
   * microdeposits enabled, and have connect loaded in verification mode.
   */
  const invalidTaxMode = IS_IN_TAX_MODE && !isTaxStatementIsEnabled

  const invalidVerifyMode = IS_IN_VERIFY_MODE && !isVerificationEnabled

  // If the client has tried to load this widget in verify mode, but they
  // don't support verification, don't load anything and show an error. A
  // user should never hit this error unless their client really goofs
  // Or if the client is loading this widget in tax mode, but they
  // don't have tax statments enabled, don't load anything and show an error.
  if (invalidVerifyMode || invalidTaxMode) {
    const title = IS_IN_TAX_MODE
      ? __('Oops! Tax statements must be enabled to use this feature.')
      : __('Oops! Verification must be enabled to use this feature.')

    return <GenericError onAnalyticPageview={onAnalyticPageview} title={title} />
  }

  if (isLoading) {
    return <LoadingSpinner showText={true} />
  }

  if (loadError) {
    return (
      <GenericError
        loadError={loadError}
        onAnalyticPageview={onAnalyticPageview}
        title={loadError.message}
      />
    )
  }

  return (
    <AnalyticContext.Provider
      value={{
        onAnalyticEvent: onAnalyticEvent,
        onAnalyticPageview: onAnalyticPageview,
      }}
    >
      <TokenContext.Consumer>
        {(tokens: any) => {
          const styles = getStyles(tokens)

          return (
            <div id="connect-wrapper" style={styles.component}>
              {state.memberToDelete && (
                <DeleteMemberSurvey
                  member={state.memberToDelete}
                  onCancel={() => {
                    setState({ ...state, memberToDelete: null })
                  }}
                  onDeleteSuccess={(deletedMember) => {
                    postMessageFunctions.onPostMessage('connect/memberDeleted', {
                      member_guid: deletedMember.guid,
                    })
                    onMemberDeleted(deletedMember.guid)

                    setState((prevState) => {
                      dispatch(connectActions.stepToDeleteMemberSuccess(deletedMember.guid))
                      return { ...prevState, memberToDelete: null }
                    })
                  }}
                />
              )}

              <ConnectNavigationHeader
                connectGoBack={() => dispatch({ type: connectActions.ActionTypes.CONNECT_GO_BACK })}
                stepComponentRef={state.stepComponentRef}
              />
              <RenderConnectStep
                availableAccountTypes={availableAccountTypes}
                handleAddManualAccountClick={_handleAddManualAccountClick}
                handleCredentialsGoBack={_handleCredentialsGoBack}
                handleOAuthGoBack={_handleOAuthGoBack}
                navigationRef={_handleStepDOMChange}
                onManualAccountAdded={onManualAccountAdded}
                onSuccessfulAggregation={onSuccessfulAggregation}
                onUpsertMember={onUpsertMember}
                setConnectLocalState={setState}
              />
            </div>
          )
        }}
      </TokenContext.Consumer>
    </AnalyticContext.Provider>
  )
}

const getStyles = (tokens: any) => {
  return {
    component: {
      background: tokens.BackgroundColor.Container,
      position: 'relative',
      height: '100%',
    } as React.CSSProperties,
  }
}

export default Connect
