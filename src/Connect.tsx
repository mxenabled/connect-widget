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

import { isConsentEnabled, loadUserFeatures } from 'src/redux/reducers/userFeaturesSlice'
import { loadProfiles } from 'src/redux/reducers/profilesSlice'
import {
  selectConnectConfig,
  selectInitialConfig,
  selectIsMobileWebView,
  selectUIMessageVersion,
} from 'src/redux/reducers/configSlice'

import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { GenericError } from 'src/components/GenericError'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { DeleteMemberSurvey } from 'src/components/DeleteMemberSurvey'
import { ConnectNavigationHeader } from 'src/components/ConnectNavigationHeader'
import { ConfigError } from 'src/components/ConfigError'

import { AnalyticEvents, defaultEventMetadata, PageviewInfo } from 'src/const/Analytics'
import { AGG_MODE, STEPS } from 'src/const/Connect'
import { POST_MESSAGES } from 'src/const/postMessages'

import PostMessage from 'src/utilities/PostMessage'
import type { RootState } from 'reduxify/Store'
import useLoadConnect from 'src/hooks/useLoadConnect'
import { useNavigationPostMessage } from 'src/hooks/useNavigationPostMessage'
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
  onShowConnectSuccessSurvey: undefined,
  onSubmitConnectSuccessSurvey: () => {},
})

export const Connect: React.FC<ConnectProps> = ({
  availableAccountTypes = [],
  onManualAccountAdded = () => {},
  onMemberDeleted = () => {},
  onSuccessfulAggregation = () => {},
  onUpsertMember = () => {},
  onAnalyticEvent = () => {},
  onAnalyticPageview = () => {},
  onShowConnectSuccessSurvey = undefined,
  onSubmitConnectSuccessSurvey = () => {},

  ...props
}) => {
  useNavigationPostMessage()
  const connectConfig = useSelector(selectConnectConfig)
  const initialConfig = useSelector(selectInitialConfig)
  const loadError = useSelector((state: RootState) => state.connect.loadError)
  const hasAtriumAPI = useSelector((state: RootState) => state.profiles.client.has_atrium_api)
  const isLoading = useSelector((state: RootState) => state.connect.isComponentLoading)
  const isMobileWebview = useSelector(selectIsMobileWebView)

  const step = useSelector(
    (state: RootState) =>
      state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )

  const previousStep = useSelector((state: RootState) => {
    if (state.connect.location.length < 2) return null

    return state.connect.location[state.connect.location.length - 2]?.step ?? null
  })

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

  const consentIsEnabled = useSelector((state: RootState) => isConsentEnabled(state))

  /**
   * When necessary, this handles side effects of going "back to search".
   * We have to guarantee sending a message when going to the beginning steps.
   */
  const handleGoBackWithSideEffects = () => {
    const BACK_ACTION_WITH_PREV_STEP = {
      type: connectActions.ActionTypes.CONNECT_GO_BACK,
      payload: { previousStep },
    }

    if (step === STEPS.SEARCH || step === STEPS.VERIFY_EXISTING_MEMBER) {
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH, {})
    }

    return BACK_ACTION_WITH_PREV_STEP
  }

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

      const language = (window as any)?.app?.options?.language || 'en-US'

      if (onAnalyticEvent) {
        onAnalyticEvent(`connect_${AnalyticEvents.WIDGET_LOAD}`, {
          ...defaultEventMetadata,
          ...metadata,
          language,
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

  const _handleConsentGoBack = () => {
    // If returnToMicrodeposits is true, we came from MDV and clicking go back should return to MDV
    if (state.returnToMicrodeposits) {
      dispatch(connectActions.stepToMicrodeposits())
      setState({ ...state, returnToMicrodeposits: false })
    } else if (connectConfig.additional_product_option) {
      dispatch(handleGoBackWithSideEffects())
    } else {
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH, {})

      dispatch({ type: connectActions.ActionTypes.GO_BACK_CONSENT, payload: initialConfig })
    }
  }

  const _handleCredentialsGoBack = () => {
    // If returnToMicrodeposits is true, we came from MDV and clicking go back should return to MDV
    if (state.returnToMicrodeposits) {
      dispatch(connectActions.stepToMicrodeposits())
      setState({ ...state, returnToMicrodeposits: false })
    } else {
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH, {})

      dispatch({ type: connectActions.ActionTypes.GO_BACK_CREDENTIALS })
    }
  }

  const _handleOAuthGoBack = () => {
    // If returnToMicrodeposits is true, we came from MDV and clicking go back should return to MDV
    if (state.returnToMicrodeposits) {
      dispatch(connectActions.stepToMicrodeposits())
      setState({ ...state, returnToMicrodeposits: false })
    } else if (consentIsEnabled || connectConfig.additional_product_option) {
      dispatch(handleGoBackWithSideEffects())
    } else {
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH, {})

      dispatch({ type: connectActions.ActionTypes.GO_BACK_OAUTH })
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

  if (isLoading) {
    return <LoadingSpinner showText={true} />
  }

  if (loadError) {
    // If the client has tried to load this widget and either they
    // or the configured institution doesn't support the requested product(s),
    // the loadError type will be "config" in this case, nothing will load, and an error will be displayed.
    // The user should never encounter this error unless their client really goofs.
    if (loadError.type === 'config') {
      return <ConfigError error={loadError} />
    }
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
        onShowConnectSuccessSurvey: onShowConnectSuccessSurvey,
        onSubmitConnectSuccessSurvey: onSubmitConnectSuccessSurvey,
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
                connectGoBack={() => dispatch(handleGoBackWithSideEffects())}
                stepComponentRef={state.stepComponentRef}
              />
              <RenderConnectStep
                availableAccountTypes={availableAccountTypes}
                handleConsentGoBack={_handleConsentGoBack}
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
