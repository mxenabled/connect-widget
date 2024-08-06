import { from, of } from 'rxjs'
import { catchError, mergeMap, map } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { ActionTypes } from 'reduxify/actions/Connections'
import { getSortedAccountsWithMembers } from 'src/connect/utilities/Accounts'
import connectAPI from 'src/connect/services/api'

export const loadConnections = actions$ =>
  actions$.pipe(
    ofType(ActionTypes.LOAD_CONNECTIONS),
    mergeMap(() => {
      return from(connectAPI.loadAccountsAndMembers()).pipe(
        map(({ members, accounts }) => {
          const sortedAccountsWithMembers = getSortedAccountsWithMembers(accounts, members)

          return {
            type: ActionTypes.LOAD_CONNECTIONS_SUCCESS,
            payload: {
              members,
              accounts: sortedAccountsWithMembers,
            },
          }
        }),
        catchError(error => {
          return of({ type: ActionTypes.LOAD_CONNECTIONS_ERROR, payload: error })
        }),
      )
    }),
  )

export const updateAccountsAfterConnecting = actions$ =>
  actions$.pipe(
    ofType(ActionTypes.ADD_MEMBER_SUCCESS),
    mergeMap(() => {
      return from(connectAPI.loadAccountsAndMembers()).pipe(
        map(({ members, accounts }) => {
          const sortedAccountsWithMembers = getSortedAccountsWithMembers(accounts, members)

          return {
            type: ActionTypes.UPDATE_ACCOUNTS_AFTER_CONNECTING,
            payload: {
              members,
              accounts: sortedAccountsWithMembers,
            },
          }
        }),
      )
    }),
  )
