import connectAPI from "src/connect/services/api";
import { selectConnectConfig } from "reduxify/reducers/configSlice";

const ActionTypes = {
  ACCOUNTS_INSTITUTION_LOADED: "connections/accounts_institution_loaded",
  ADD_MEMBER_SUCCESS: "connections/add_member_success",
  CONNECTIONS_MOUNTED: "connections/mounted",
  CONNECTIONS_UNMOUNTED: "connections/unmounted",
  CREATE_MEMBER_SUCCESS: "connections/create_member_success",
  DELETE_MEMBER_SUCCESS: "connections/delete_member_success",
  LOAD_CONNECTIONS: "connections/load",
  LOAD_CONNECTIONS_SUCCESS: "connections/load_success",
  LOAD_CONNECTIONS_ERROR: "connections/load_error",
  MERGE_ACCOUNTS: "connections/merge_accounts",
  MEMBER_LOADED: "connections/member_loaded",
  UPDATE_ACCOUNT: "connections/update_account",
  UPDATE_ACCOUNTS_AFTER_CONNECTING:
    "connections/update_accounts_after_connecting",
};

/**
 * This is used in the Connection Details view. When you click the sync
 * icon this will run a background aggregation job. NOTE - When a member
 * is created via the createMember epic, aggregation automatically happens.
 *
 * This is also used when a closed external account is reopened.
 */
const syncMember = (guid) => (dispatch, getState) => {
  const isHuman = getState().app.humanEvent;
  const connectConfig = selectConnectConfig(getState());

  return connectAPI
    .aggregate(guid, connectConfig, isHuman)
    .then(() => {
      return connectAPI.loadMemberByGuid(guid).then((member) =>
        dispatch({
          type: ActionTypes.MEMBER_LOADED,
          payload: { item: member },
        })
      );
    })
    .catch(() => {
      // Swallowing the error here if aggregation fails or we get a 409 conflict
    });
};

const loadInstitutionByGuid = (guid) => (dispatch) => {
  return connectAPI.loadInstitutionByGuid(guid).then((accountsInstitution) => {
    dispatch({
      type: ActionTypes.ACCOUNTS_INSTITUTION_LOADED,
      payload: { item: accountsInstitution },
    });
  });
};

const dispatcher = (dispatch) => ({
  loadConnections: (config) =>
    dispatch({ type: ActionTypes.LOAD_CONNECTIONS, payload: config }),
  loadConnectionsSuccess: () =>
    dispatch({ type: ActionTypes.LOAD_CONNECTIONS_SUCCESS }),
  loadConnectionsError: () =>
    dispatch({ type: ActionTypes.LOAD_CONNECTIONS_ERROR }),
  loadInstitutionByGuid: (guid) => dispatch(loadInstitutionByGuid(guid)),
  connectionsUnmounted: () =>
    dispatch({ type: ActionTypes.CONNECTIONS_UNMOUNTED }),
  syncMember: (guid) => dispatch(syncMember(guid)),
});

export { ActionTypes, dispatcher };
