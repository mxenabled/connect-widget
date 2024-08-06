/*eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }]*/
import { createReducer } from 'src/connections/utilities/reduxHelpers'
import _find from 'lodash/find'
import { ActionTypes } from 'reduxify/actions/Connections'

export const defaultState = {
  accounts: [],
  // this is Connections specific config we keep them here to avoid passing
  // them around to each and every epic/action/component that may need it
  connectionsConfig: {},
  isConnectionsLoading: true,
  members: [],
}

const connectionsUnmounted = state => state

const loadConnections = (state, { payload }) => {
  const { connections: connectionsConfig } = payload
  return {
    ...state,
    connectionsConfig: { ...state.connectionsConfig, ...connectionsConfig },
    isConnectionsLoading: true,
    members: state.members,
  }
}

const loadConnectionsSuccess = (state, action) => ({
  ...state,
  accounts: action.payload.accounts,
  isConnectionsLoading: false,
  members: action.payload.members,
})
const updateAccount = (state, action) => {
  const accounts = []

  state.accounts.forEach(account => {
    if (account.guid === action.payload.guid) {
      accounts.push({ ...account, ...action.payload })
    } else {
      accounts.push(account)
    }
  })

  return { ...state, accounts }
}
const mergeAccounts = (state, action) => {
  return { ...state, accounts: action.payload }
}
const updateAccountsAfterConnecting = (state, action) => ({
  ...state,
  accounts: action.payload.accounts,
  members: action.payload.members,
})

const createMemberSuccess = (state, action) => {
  return {
    ...state,
    members: upsertMember(state, { payload: action.payload }),
  }
}

const deleteMemberSuccess = (state, { payload }) => ({
  ...state,
  members: deleteMemberFromMembers(payload, state.members),
})

// Helper to either update or add the member to the members array.
const upsertMember = (state, action) => {
  const loadedMember = action.payload
  const previousMember = _find(state.members, { guid: loadedMember.guid })

  if (previousMember) {
    return [...state.members.filter(member => member.guid !== previousMember.guid), loadedMember]
  }

  return [...state.members, loadedMember]
}

/**
 * Use to remove a member with "guid" from an array of members
 * @param {String} guid guid of member to remove
 * @param {Array<{guid: string}>} members Array of members with a guid property
 * @returns Array of remaining members
 */
const deleteMemberFromMembers = (guid, members) => members.filter(member => member.guid !== guid)

export const connections = createReducer(defaultState, {
  [ActionTypes.CONNECTIONS_UNMOUNTED]: connectionsUnmounted,
  [ActionTypes.CREATE_MEMBER_SUCCESS]: createMemberSuccess,
  [ActionTypes.DELETE_MEMBER_SUCCESS]: deleteMemberSuccess,
  [ActionTypes.LOAD_CONNECTIONS]: loadConnections,
  [ActionTypes.LOAD_CONNECTIONS_SUCCESS]: loadConnectionsSuccess,
  [ActionTypes.MERGE_ACCOUNTS]: mergeAccounts,
  [ActionTypes.UPDATE_ACCOUNT]: updateAccount,
  [ActionTypes.UPDATE_ACCOUNTS_AFTER_CONNECTING]: updateAccountsAfterConnecting,
})
