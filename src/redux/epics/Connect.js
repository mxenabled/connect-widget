import { from, of, defer } from 'rxjs'
import { catchError, mergeMap, map, pluck } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import _get from 'lodash/get'

import {
  ActionTypes,
  loadConnectSuccess,
  loadConnectError,
  selectInstitutionSuccess,
  selectInstitutionError,
} from 'reduxify/actions/Connect'
import { ReadableStatuses } from 'src/connect/const/Statuses'
import { VERIFY_MODE } from 'src/connect/const/Connect'
import connectAPI from 'src/connect/services/api'
import { getErrorResource } from 'src/components/app/GlobalErrorBoundary'
import { __ } from 'src/connect/utilities/Intl'

/**
 * Load connenct with the given config.
 *
 * If current_member_guid is configured, it takes precedence
 * next is current_microdeposit_guid
 * next is current_institution_guid
 * next is current_institution_code
 * last is no config, which doesn't actually fetch anything, just sets
 * loading to false.
 *
 * NOTE: loadConnectSuccess action is handled by multiple reducers in
 * connect, members, and instittuions, make sure to test all of them if you
 * change it.
 */
export const loadConnect = (actions$, state$) =>
  actions$.pipe(
    ofType(ActionTypes.LOAD_CONNECT),
    pluck('payload', 'connect'),
    mergeMap((config = {}) => {
      let request$

      if (config.current_member_guid) {
        request$ = loadConnectFromMemberConfig(config)
      } else if (config.current_institution_guid || config.current_institution_code) {
        request$ = loadConnectFromInstitutionConfig(config)
      } else if (config.mode === VERIFY_MODE && config.current_microdeposit_guid) {
        request$ = loadConnectFromMicrodepositConfig(config)
      } else {
        request$ = of({ config })
      }

      return request$.pipe(
        mergeMap((dependencies) =>
          from(connectAPI.loadMembers()).pipe(
            map((members) =>
              loadConnectSuccess({
                members,
                widgetProfile: state$.value.profiles.widgetProfile,
                ...dependencies,
              }),
            ),
          ),
        ),
        catchError((err) => {
          if (err instanceof VerifyNotEnabled) {
            return of(
              loadConnectError({
                message: __("This connection doesn't support verification."),
                resource: err.entity_type,
              }),
            )
          } else {
            const is404Status = _get(err, 'response.status', null) === 404

            return is404Status
              ? of(
                  loadConnectError({
                    message: __("Oops! We couldn't find that connection."),
                    resource: getErrorResource(err),
                    status: err.response.status || null,
                  }),
                )
              : of(
                  loadConnectError({
                    message: 'Oops! Something went wrong. Please try again later',
                    resource: getErrorResource(err),
                    status: err?.response?.status || null,
                  }),
                )
          }
        }),
      )
    }),
  )

/**
 * Select an insitution from the search list.
 * - Get the institution
 * - Check to see if we should show the existing member modal
 */
export const selectInstitution = (actions$, state$) =>
  actions$.pipe(
    ofType(ActionTypes.SELECT_INSTITUTION),
    pluck('payload'),
    mergeMap((guid) =>
      from(connectAPI.loadInstitutionByGuid(guid)).pipe(
        map((institution) => {
          return selectInstitutionSuccess({
            clientProfile: state$.value.profiles.clientProfile,
            institution,
          })
        }),
        catchError((err) => of(selectInstitutionError(err))),
      ),
    ),
  )

/**
 * Load the data for the configured member. Dispatch an error if mode is in
 * verification but member does not support it.
 * @param  {object} config -  the client config for the widget
 * @return {Observable}
 */
function loadConnectFromMemberConfig(config) {
  return from(connectAPI.loadMemberByGuid(config.current_member_guid)).pipe(
    mergeMap((member) => {
      if (config.mode === VERIFY_MODE && !member.verification_is_enabled) {
        throw new VerifyNotEnabled(member, 'Loaded member does not support verification', '/member')
      }

      if (config.mode === VERIFY_MODE && member.connection_status === ReadableStatuses.CONNECTED) {
        return defer(() => connectAPI.loadInstitutionByGuid(member.institution_guid)).pipe(
          map((institution) => ({ member, institution, config })),
        )
      }

      return defer(() => connectAPI.loadInstitutionByGuid(member.institution_guid)).pipe(
        map((institution) => ({ member, institution, config })),
      )
    }),
  )
}

/**
 * Load the institution that is configured for the connect. When the
 * institution is successfully loaded, maker sure it is a valid configuration.
 *
 * @param  {Object} config - the client config for the widget
 * @return {Observable}
 */
function loadConnectFromInstitutionConfig(config) {
  const request$ = config.current_institution_guid
    ? from(connectAPI.loadInstitutionByGuid(config.current_institution_guid))
    : from(connectAPI.loadInstitutionByCode(config.current_institution_code))

  return request$.pipe(
    map((institution) => {
      if (config.mode === VERIFY_MODE && !institution.account_verification_is_enabled) {
        throw new VerifyNotEnabled(
          institution,
          'Loaded institution does not support verification',
          '/institution',
        )
      }
      return { institution, config }
    }),
  )
}

/**
 * Load the microdeposit that is configured for the connect. Microdeposit status will be used to
 * determine initial step(SEARCH or MICRODEPOSITS) in the reducer.
 *
 * @param  {Object} config - the client config for the widget
 * @return {Observable}
 */
function loadConnectFromMicrodepositConfig(config) {
  return from(connectAPI.loadMicrodepositByGuid(config.current_microdeposit_guid)).pipe(
    map((microdeposit) => ({ microdeposit, config })),
  )
}

/**
 * Derived from the example at SO:
 * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 */
function VerifyNotEnabled(entity, message, entity_type) {
  this.name = 'VerifyNotEnabled'
  this.message = message
  this.stack = new Error().stack
  this.entity = entity
  this.entity_type = entity_type
}
VerifyNotEnabled.prototype = new Error()
