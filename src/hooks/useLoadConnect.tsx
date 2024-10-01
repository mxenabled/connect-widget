/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { from, of, defer } from 'rxjs'
import { catchError, mergeMap, map } from 'rxjs/operators'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'

import {
  loadConnect as loadConnectStart,
  loadConnectSuccess,
  loadConnectError,
} from 'src/redux/actions/Connect'
import { ReadableStatuses } from 'src/const/Statuses'
import { VERIFY_MODE } from 'src/const/Connect'
import { useApi, ApiContextTypes } from 'src/context/ApiContext'
import { __ } from 'src/utilities/Intl'
import type { configType } from 'src/redux/reducers/configSlice'
import type { RootState } from 'src/redux/Store'

export const getErrorResource = (err: { config: { url: string | string[] } }) => {
  if (err.config?.url.includes('/institutions')) {
    return '/institutions'
  } else if (err.config?.url.includes('/members')) {
    return '/member'
  } else if (err.config?.url.includes('/micro_deposits')) {
    return '/micro_deposits'
  } else {
    return null
  }
}

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
const useLoadConnect = () => {
  const { api } = useApi()
  const profiles = useSelector((state: RootState) => state.profiles)
  const [config, setConfig] = useState<configType>({} as configType)
  const dispatch = useDispatch()

  const loadConnect = useCallback((config: configType) => setConfig(config), [config])

  useEffect(() => {
    if (_isEmpty(config)) return () => {}
    dispatch(loadConnectStart(config))

    let request$
    if (config.current_member_guid) {
      request$ = loadConnectFromMemberConfig(config, api)
    } else if (config.current_institution_guid || config.current_institution_code) {
      request$ = loadConnectFromInstitutionConfig(config, api)
    } else if (config.mode === VERIFY_MODE && config.current_microdeposit_guid) {
      request$ = loadConnectFromMicrodepositConfig(config, api)
    } else {
      request$ = of({ config })
    }

    const requestSubscription$ = request$
      .pipe(
        mergeMap((dependencies) =>
          from(api.loadMembers()).pipe(
            map((members) =>
              loadConnectSuccess({
                members,
                widgetProfile: profiles.widgetProfile,
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
      .subscribe((action) => dispatch(action))

    return () => requestSubscription$.unsubscribe()
  }, [config])

  return { loadConnect }
}

export default useLoadConnect

/**
 * Load the data for the configured member. Dispatch an error if mode is in
 * verification but member does not support it.
 */
function loadConnectFromMemberConfig(config: configType, api: ApiContextTypes) {
  return from(api.loadMemberByGuid!(config.current_member_guid as string)).pipe(
    mergeMap((member: any) => {
      if (config.mode === VERIFY_MODE && !member.verification_is_enabled) {
        throw new VerifyNotEnabled(member, 'Loaded member does not support verification', '/member')
      }

      if (config.mode === VERIFY_MODE && member.connection_status === ReadableStatuses.CONNECTED) {
        return defer(() => api.loadInstitutionByGuid(member.institution_guid)).pipe(
          map((institution) => ({ member, institution, config })),
        )
      }

      return defer(() => api.loadInstitutionByGuid(member.institution_guid)).pipe(
        map((institution) => ({ member, institution, config })),
      )
    }),
  )
}

/**
 * Load the institution that is configured for the connect. When the
 * institution is successfully loaded, maker sure it is a valid configuration.
 */
function loadConnectFromInstitutionConfig(config: configType, api: ApiContextTypes) {
  const request$ = config.current_institution_guid
    ? from(api.loadInstitutionByGuid!(config.current_institution_guid))
    : from(api.loadInstitutionByCode!(config.current_institution_code as string))

  return request$.pipe(
    map((institution: any) => {
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
 */
function loadConnectFromMicrodepositConfig(config: configType, api: ApiContextTypes) {
  return from(api.loadMicrodepositByGuid!(config.current_microdeposit_guid as string)).pipe(
    map((microdeposit) => ({ microdeposit, config })),
  )
}

/**
 * Derived from the example at SO:
 * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 */
class VerifyNotEnabled extends Error {
  entity: object
  entity_type: string
  constructor(entity: object, message: string, entity_type: string) {
    super(message)
    this.name = 'VerifyNotEnabled'
    this.message = message
    this.stack = new Error().stack
    this.entity = entity
    this.entity_type = entity_type
  }
}
