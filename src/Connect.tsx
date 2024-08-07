import React, { createContext } from "react";
import _get from "lodash/get";
import _isEqual from "lodash/isEqual";
import _isNil from "lodash/isNil";
import _toLower from "lodash/toLower";
import { sha256 } from "js-sha256";
import { connect, ConnectedProps } from "react-redux";
import "posthog-js/dist/recorder-v2"; // Added for security requirements to use PostHog Session Recording
import { TokenContext } from "@kyper/tokenprovider";

import * as connectActions from "reduxify/actions/Connect";
import {
  addAnalyticPath,
  removeAnalyticPath,
} from "reduxify/reducers/analyticsSlice";
import { ActionTypes as PostMessageActionTypes } from "reduxify/actions/PostMessage";

import { getExperimentNamesToUserVariantMap } from "reduxify/selectors/Experiments";
import { shouldShowConnectGlobalNavigationHeader } from "reduxify/selectors/UserFeatures";
import {
  selectConnectConfig,
  selectIsMobileWebView,
  selectUIMessageVersion,
} from "reduxify/reducers/configSlice";
import { loadProfiles } from "reduxify/reducers/profilesSlice";
import { loadUserFeatures } from "reduxify/reducers/userFeaturesSlice";
import { selectConnectStep } from "reduxify/selectors/Connect";

import { LoadingSpinner } from "src/connect/components/LoadingSpinner";
import { GenericError } from "src/connect/components/GenericError";
import RenderConnectStep from "src/connect/components/RenderConnectStep";
import { DeleteMemberSurvey } from "src/connect/components/DeleteMemberSurvey";
import { ConnectNavigationHeader } from "src/connect/components/ConnectNavigationHeader";

import {
  AnalyticEvents,
  defaultEventMetadata,
  PageviewInfo,
} from "src/connect/const/Analytics";
import {
  AGG_MODE,
  VERIFY_MODE,
  TAX_MODE,
  STEPS,
} from "src/connect/const/Connect";
import { POST_MESSAGES } from "src/connect/const/postMessages";
import { connectABExperiments } from "src/connect/experiments";
import { getActiveABExperimentDetails } from "src/connect/hooks/useExperiment";

import PostMessage from "src/connect/utilities/PostMessage";
import { combineDispatchers } from "src/connect/utilities/reduxHelpers";
import { __ } from "src/connect/utilities/Intl";
import type { RootState } from "reduxify/Store";

type PropsFromRedux = ConnectedProps<typeof connector>;
type ConnectProps = PropsFromRedux & {
  addAnalyticPath: (arg0: any) => void;
  availableAccountTypes: [];
  clientConfig: any;
  connectConfig: any;
  connectGoBack: () => void;
  experimentDetails: any;
  goBackCredentials: (arg0: object) => void;
  goBackOauth: (arg0: object) => void;
  goBackPostMessage: (arg0: object) => void;
  hasAtriumAPI: boolean;
  isLoading: boolean;
  isMobileWebview: boolean;
  isTaxStatementIsEnabled: boolean;
  isVerificationEnabled: boolean;
  loadConnect: (arg0: any) => void;
  loadError: any;
  onAnalyticEvent: (eventName: string, metadata: object) => void;
  onAnalyticPageview: () => void;
  onManualAccountAdded: () => void;
  onMemberDeleted: (memberGuid: string) => void;
  onSuccessfulAggregation: () => void;
  onUpsertMember: () => void;
  profiles: any;
  removeAnalyticPath: (path: string) => void;
  resetConnect: () => void;
  sendPostMessage: (event: string, data?: object) => void;
  showConnectGlobalNavigationHeader: boolean;
  step: string;
  stepToAddManualAccount: () => void;
  stepToDeleteMemberSuccess: (memberGuid: string) => void;
  stepToMicrodeposits: () => void;
  uiMessageVersion: number;
  userFeatures: object;
};
type ConnectState = {
  memberToDelete: object | null;
  returnToMicrodeposits: boolean;
  stepComponentRef: object | null;
};

interface AnalyticContextType {
  onAnalyticEvent: (eventName: string, metadata: object) => void;
  onAnalyticPageview: () => void;
}

interface ConfigMetadata {
  disable_institution_search: boolean;
  include_identity: boolean;
  include_transactions: boolean;
  current_member_guid: string;
  current_institution_guid: string;
  current_institution_code: any;
  initial_step: string;
  mode: string;
}

export const AnalyticContext = createContext<AnalyticContextType | null>(null);

export class Connect extends React.Component<ConnectProps, ConnectState> {
  static defaultProps = {
    onAnalyticEvent: () => {},
    onAnalyticPageview: () => {},
    showPadding: true,
  };

  constructor(props: ConnectProps) {
    super(props);
    const [name, path] = PageviewInfo.CONNECT;
    const mode = props.clientConfig.connect.mode;

    props.addAnalyticPath({
      name,
      path: `${path}/${mode}${props.experimentDetails.variantPath}`,
    });

    this.state = {
      memberToDelete: null,
      // The `returnToMicrodeposits` is a temp fix to address the go back button.
      // We want to refactor how we handle the go back which will fix this too.
      returnToMicrodeposits: false,
      stepComponentRef: null, // This holds a reference to the current step component.
    };
    this.setState = this.setState.bind(this);
  }

  componentDidMount() {
    // When Connect is being used within our SDK's, we need to support an OS level back action
    // We listen to a specific event to handle our postMessage callback with our `did_go_back` boolean
    // To allow the host to know if we are still within Connect or to close it.
    window.addEventListener("message", this._handleNavigationPostMessage);

    loadProfiles(this.props.profiles);
    loadUserFeatures(this.props.userFeatures);

    this.props.loadConnect(this.props.clientConfig);

    // Also important to note that this is a race condition between connect
    // mounting and the master data loading the client data. It just so happens
    // that it is usually faster.
    if (
      this.props.hasAtriumAPI &&
      this.props.isMobileWebview &&
      this.props.uiMessageVersion < 4
    ) {
      (window as Window).location = "atrium://mxConnectLoaded";
    } else if (this.props.hasAtriumAPI && this.props.uiMessageVersion < 4) {
      // This is an old post message that has to be sent out or we break the atrium javascript loader
      PostMessage.send("mxConnect:widgetLoaded");
    }
  }

  componentDidUpdate(prevProps: ConnectProps) {
    const isFirstTimeLoading = prevProps.isLoading && !this.props.isLoading;

    // If this is the first time loading Connect:
    //  - Send out PostHog Event with config data and initial step.
    //  - Send out GA Event with initial step.
    //  - Send out the loaded post message with the initial step.
    if (isFirstTimeLoading) {
      const config = this.props.connectConfig;
      const metadata: ConfigMetadata = {
        initial_step: this.props.step,
        mode: _toLower(config.mode) || AGG_MODE,
        disable_institution_search: false,
        include_identity: false,
        include_transactions: false,
        current_member_guid: "",
        current_institution_guid: "",
        current_institution_code: undefined,
      };

      if (!_isNil(config.disable_institution_search))
        metadata.disable_institution_search = config.disable_institution_search;
      if (!_isNil(config.include_identity))
        metadata.include_identity = config.include_identity;
      if (!_isNil(config.include_transactions))
        metadata.include_transactions = config.include_transactions;
      if (!_isNil(config.current_member_guid))
        metadata.current_member_guid = sha256(config.current_member_guid);
      if (!_isNil(config.current_institution_guid))
        metadata.current_institution_guid = config.current_institution_guid;
      if (!_isNil(config.current_institution_code))
        metadata.current_institution_code = config.current_institution_code;

      if (this.props.onAnalyticEvent) {
        this.props.onAnalyticEvent(`connect_${AnalyticEvents.WIDGET_LOAD}`, {
          ...defaultEventMetadata,
          ...metadata,
        });
      }
      this.props.sendPostMessage("connect/loaded", {
        initial_step: this.props.step,
      });
    } else if (prevProps.step !== this.props.step) {
      // Otherwise if the step changed send out the message with prev and current
      this.props.sendPostMessage("connect/stepChange", {
        previous: prevProps.step,
        current: this.props.step,
      });
    }

    // if clientConfig prop changes while connect is already loaded update connect
    if (!_isEqual(prevProps.clientConfig, this.props.clientConfig)) {
      this.props.loadConnect(this.props.clientConfig);
    }
  }

  componentWillUnmount() {
    const mode = this.props.connectConfig.mode;
    const variantPath = this.props.experimentDetails.variantPath;

    this.props.resetConnect();
    this.props.removeAnalyticPath(
      `${PageviewInfo.CONNECT[1]}/${mode}${variantPath}`
    );

    window.removeEventListener("message", this._handleNavigationPostMessage);
  }

  _handleNavigationPostMessage = (event: MessageEvent) => {
    const eventData = PostMessage.parse(event.data);
    if (eventData.type === "mx/navigation") {
      // Specifically looking for the 'back' action, in the future we could support others
      if (eventData.payload.action === "back") {
        const dontChangeConnectStep =
          this.props.step === STEPS.SEARCH ||
          this.props.step === STEPS.DISCLOSURE ||
          this.props.step === STEPS.VERIFY_EXISTING_MEMBER ||
          this.props.connectConfig.disable_institution_search;

        if (dontChangeConnectStep) {
          // We consider SEARCH and DISCLOSURE to be as far back as Connect goes.
          // Loaded in verify mode, we show VERIFY_EXISTING_MEMBER as the root.
          // If disable_institution_search is `true`, we do not show the SEARCH step.
          // If any of those conditions are met, we do not change the step when a back navigation event is received.
          // Communicate that we did not go back to the SDK via the `did_go_back` payload.
          this.props.sendPostMessage("navigation", { did_go_back: false });
        } else {
          // We want to reset connect by taking us back to the SEARCH or VERIFY_EXISTING_MEMBER step depending on config
          this.props.goBackPostMessage(this.props.connectConfig);

          // And communicating that we did go back to the SDK
          this.props.sendPostMessage("navigation", { did_go_back: true });
        }
      }
    }
  };

  _handleAddManualAccountClick = () => {
    this.props.stepToAddManualAccount();
  };

  _handleCredentialsGoBack = () => {
    // If returnToMicrodeposits is true, we came from MDV and clicking go back should return to MDV
    if (this.state.returnToMicrodeposits) {
      this.props.stepToMicrodeposits();
      this.setState({ returnToMicrodeposits: false });
    } else {
      this.props.sendPostMessage(POST_MESSAGES.BACK_TO_SEARCH);

      this.props.goBackCredentials(this.props.connectConfig);
    }
  };

  _handleOAuthGoBack = () => {
    // If returnToMicrodeposits is true, we came from MDV and clicking go back should return to MDV
    if (this.state.returnToMicrodeposits) {
      this.props.stepToMicrodeposits();
      this.setState({ returnToMicrodeposits: false });
    } else {
      this.props.sendPostMessage(POST_MESSAGES.BACK_TO_SEARCH);

      this.props.goBackOauth(this.props.connectConfig);
    }
  };

  /**
   * We use a callback ref here, so that we can get notified
   * When the corresponding step component has been mounted in the DOM.
   * This is to ensure that the step component has the custom methods attached (if any)
   * Before we can act on it.
   */
  _handleStepDOMChange = (ref: any) => {
    this.setState({ stepComponentRef: ref });
  };

  render() {
    const mode = this.props.connectConfig?.mode ?? AGG_MODE;

    const IS_IN_TAX_MODE = mode === TAX_MODE;
    const IS_IN_VERIFY_MODE = mode === VERIFY_MODE;

    /**
     * For Microdeposits to be enabled, you have to have verification enabled,
     * microdeposits enabled, and have connect loaded in verification mode.
     */
    const invalidTaxMode =
      IS_IN_TAX_MODE && !this.props.isTaxStatementIsEnabled;

    const invalidVerifyMode =
      IS_IN_VERIFY_MODE && !this.props.isVerificationEnabled;

    // If the client has tried to load this widget in verify mode, but they
    // don't support verification, don't load anything and show an error. A
    // user should never hit this error unless their client really goofs
    // Or if the client is loading this widget in tax mode, but they
    // don't have tax statments enabled, don't load anything and show an error.
    if (invalidVerifyMode || invalidTaxMode) {
      const title = IS_IN_TAX_MODE
        ? __("Oops! Tax statements must be enabled to use this feature.")
        : __("Oops! Verification must be enabled to use this feature.");

      return (
        <GenericError
          onAnalyticPageview={this.props.onAnalyticPageview}
          title={title}
        />
      );
    }

    if (this.props.isLoading) {
      return <LoadingSpinner showText={true} />;
    }

    if (this.props.loadError) {
      return (
        <GenericError
          loadError={this.props.loadError}
          onAnalyticPageview={this.props.onAnalyticPageview}
          title={this.props.loadError.message}
        />
      );
    }

    return (
      <AnalyticContext.Provider
        value={{
          onAnalyticEvent: this.props.onAnalyticEvent,
          onAnalyticPageview: this.props.onAnalyticPageview,
        }}
      >
        <TokenContext.Consumer>
          {(tokens: any) => {
            const styles = this.styles(tokens);

            return (
              <div id="connect-wrapper" style={styles.component}>
                {this.state.memberToDelete && (
                  <DeleteMemberSurvey
                    member={this.state.memberToDelete}
                    onCancel={() => {
                      this.setState({ memberToDelete: null });
                    }}
                    onDeleteSuccess={(deletedMember) => {
                      this.props.sendPostMessage("connect/memberDeleted", {
                        member_guid: deletedMember.guid,
                      });
                      this.props.onMemberDeleted(deletedMember.guid);

                      this.setState({ memberToDelete: null }, () => {
                        this.props.stepToDeleteMemberSuccess(
                          deletedMember.guid
                        );
                      });
                    }}
                  />
                )}
                {this.props.showConnectGlobalNavigationHeader && (
                  <ConnectNavigationHeader
                    connectGoBack={this.props.connectGoBack}
                    stepComponentRef={this.state.stepComponentRef}
                  />
                )}
                <RenderConnectStep
                  availableAccountTypes={this.props.availableAccountTypes}
                  handleAddManualAccountClick={
                    this._handleAddManualAccountClick
                  }
                  handleCredentialsGoBack={this._handleCredentialsGoBack}
                  handleOAuthGoBack={this._handleOAuthGoBack}
                  navigationRef={this._handleStepDOMChange}
                  onManualAccountAdded={this.props.onManualAccountAdded}
                  onSuccessfulAggregation={this.props.onSuccessfulAggregation}
                  onUpsertMember={this.props.onUpsertMember}
                  setConnectLocalState={this.setState}
                />
              </div>
            );
          }}
        </TokenContext.Consumer>
      </AnalyticContext.Provider>
    );
  }

  styles = (tokens: any) => {
    return {
      component: {
        background: tokens.BackgroundColor.Container,
        position: "relative",
        height: "100%",
      } as React.CSSProperties,
    };
  };
}

const mapStateToProps = (state: RootState) => ({
  connectConfig: selectConnectConfig(state),
  experimentDetails: getActiveABExperimentDetails(
    getExperimentNamesToUserVariantMap(state),
    connectABExperiments
  ),
  loadError: _get(state, "connect.loadError"),
  hasAtriumAPI: _get(state, "profiles.client.has_atrium_api"),
  isLoading: _get(state, "connect.isComponentLoading", false),
  isMobileWebview: selectIsMobileWebView(state) ?? false,
  isVerificationEnabled: _get(
    state,
    "profiles.clientProfile.account_verification_is_enabled",
    false
  ),
  isTaxStatementIsEnabled: _get(
    state,
    "profiles.clientProfile.tax_statement_is_enabled",
    false
  ),
  showConnectGlobalNavigationHeader:
    shouldShowConnectGlobalNavigationHeader(state),
  step: selectConnectStep(state),
  uiMessageVersion: selectUIMessageVersion(state),
});

/**
 * These are all of the common dispatch props between connect implementations.
 * Override this as needed.
 */
const mapDispatchToProps = combineDispatchers(
  (dispatch: (arg0: { payload?: any; type: string }) => any) => ({
    addAnalyticPath: (path: any) => dispatch(addAnalyticPath(path)),
    connectGoBack: () =>
      dispatch({ type: connectActions.ActionTypes.CONNECT_GO_BACK }),
    goBackCredentials: (connectConfig: any) =>
      dispatch({
        type: connectActions.ActionTypes.GO_BACK_CREDENTIALS,
        payload: connectConfig,
      }),
    goBackOauth: (connectConfig: any) =>
      dispatch({
        type: connectActions.ActionTypes.GO_BACK_OAUTH,
        payload: connectConfig,
      }),
    goBackPostMessage: (connectConfig: any) =>
      dispatch({
        type: connectActions.ActionTypes.GO_BACK_POST_MESSAGE,
        payload: connectConfig,
      }),
    removeAnalyticPath: (path: any) => dispatch(removeAnalyticPath(path)),
    loadConnect: (config: {} | undefined) =>
      dispatch(connectActions.loadConnect(config)),
    stepToMicrodeposits: () => dispatch(connectActions.stepToMicrodeposits()),
    resetConnect: () => dispatch(connectActions.resetConnect()),
    sendPostMessage: (event: any, data: any) =>
      dispatch({
        type: PostMessageActionTypes.SEND_POST_MESSAGE,
        payload: { event, data },
      }),
    stepToDeleteMemberSuccess: (memberGuid: any) =>
      dispatch(connectActions.stepToDeleteMemberSuccess(memberGuid)),
    stepToAddManualAccount: () =>
      dispatch(connectActions.stepToAddManualAccount()),
  })
);

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(Connect);
