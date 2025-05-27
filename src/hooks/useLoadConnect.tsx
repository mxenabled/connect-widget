/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useMemo } from 'react'
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
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'
import { VERIFY_MODE } from 'src/const/Connect'
import { useApi, ApiContextTypes } from 'src/context/ApiContext'
import { __ } from 'src/utilities/Intl'
import type { RootState } from 'src/redux/Store'
import { instutionSupportRequestedProducts } from 'src/utilities/Institution'

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
  const clientLocale = useMemo(() => {
    return document.querySelector('html')?.getAttribute('lang') || 'en'
  }, [document.querySelector('html')?.getAttribute('lang')])
  const [config, setConfig] = useState<ClientConfigType>({} as ClientConfigType)
  const dispatch = useDispatch()

  const loadConnect = useCallback((config: ClientConfigType) => setConfig(config), [config])

  useEffect(() => {
    if (_isEmpty(config)) return () => {}
    dispatch(loadConnectStart(config))

    let request$
    if (config.current_member_guid) {
      request$ = loadConnectFromMemberConfig(config, api, clientLocale)
    } else if (config.current_institution_guid || config.current_institution_code) {
      request$ = loadConnectFromInstitutionConfig(config, api)
    } else if (config.mode === VERIFY_MODE && config.current_microdeposit_guid) {
      request$ = loadConnectFromMicrodepositConfig(config, api)
    } else {
      request$ = of({ config })
    }

    const requestSubscription$ = request$
      .pipe(
        mergeMap((dependencies) => {
          if (clientSupportRequestedProducts(config, profiles.clientProfile)) {
            return from(api.loadMembers(clientLocale)).pipe(
              map((members) =>
                loadConnectSuccess({
                  members,
                  widgetProfile: profiles.widgetProfile,
                  ...dependencies,
                }),
              ),
            )
          }
          return of(
            loadConnectError({
              title: __('Mode not enabled'),
              message: __(
                'This mode isn’t available in your current plan. Please contact your representative to explore options.',
              ),
              type: 'config',
            }),
          )
        }),
        catchError((err) => {
          if (err instanceof InstitutionConfigNotEnabled) {
            return of(
              loadConnectError({
                title: __('Feature not available'),
                message: __(
                  '%1 does not offer this feature. Please contact your representative to explore options.',
                  err.entity.name,
                ),
                resource: err.entity_type,
                type: 'config',
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
 * Load the data for the configured member. Dispatch an error if
 * member's institution does not support the requested products
 */
function loadConnectFromMemberConfig(
  config: ClientConfigType,
  api: ApiContextTypes,
  clientLocale: string,
) {
  return from(api.loadMemberByGuid!(config.current_member_guid as string, clientLocale)).pipe(
    mergeMap((member: any) => {
      return defer(() => api.loadInstitutionByGuid(member.institution_guid)).pipe(
        map((institution) => {
          if (instutionSupportRequestedProducts(config, institution)) {
            return {
              member,
              institution,
              config,
            }
          }
          throw new InstitutionConfigNotEnabled(
            institution,
            'Loaded institution does not support verification',
            '/institution',
          )
        }),
      )
    }),
  )
}

/**
 * Load the institution that is configured for the connect. When the
 * institution is successfully loaded, make sure it is a valid configuration
 * By checking if it supports requested products
 */
function loadConnectFromInstitutionConfig(config: ClientConfigType, api: ApiContextTypes) {
  const request$ = config.current_institution_guid
    ? from(api.loadInstitutionByGuid!(config.current_institution_guid))
    : from(api.loadInstitutionByCode!(config.current_institution_code as string))

  return request$.pipe(
    map((institution) => {
      if (instutionSupportRequestedProducts(config, institution)) {
        return {
          institution,
          config,
        }
      }
      throw new InstitutionConfigNotEnabled(
        institution,
        'Loaded institution does not support verification',
        '/institution',
      )
    }),
  )
}

/**
 * Load the microdeposit that is configured for the connect. Microdeposit status will be used to
 * determine initial step(SEARCH or MICRODEPOSITS) in the reducer.
 */
function loadConnectFromMicrodepositConfig(config: ClientConfigType, api: ApiContextTypes) {
  return from(api.loadMicrodepositByGuid!(config.current_microdeposit_guid as string)).pipe(
    map((microdeposit) => ({ microdeposit, config })),
  )
}

/**
 * Validate if the client(data recipient) supports
 * the requested products and returns a boolean.
 */
function clientSupportRequestedProducts(config: ClientConfigType, clientProfile: any) {
  const products = config?.data_request?.products

  if (Array.isArray(products) && products.length > 0) {
    return products.every((product) => {
      switch (product) {
        case COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER:
          return clientProfile.account_verification_is_enabled
        case COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER:
          return clientProfile.account_identification_is_enabled
        default:
          return true // For any other product, return true.
      }
    })
  }

  // Returns true if the products array is not provided or is empty.
  // This can happen when configurations are passed via postMessage,
  // as we don't yet have proper validations for the "mode" and "include" flags strategy.
  return true
}

/**
 * Derived from the example at SO:
 * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 */
class InstitutionConfigNotEnabled extends Error {
  entity: any
  entity_type: string
  constructor(entity: any, message: string, entity_type: string) {
    super(message)
    this.name = 'InstitutionConfigNotEnabled'
    this.message = message
    this.stack = new Error().stack
    this.entity = entity
    this.entity_type = entity_type
  }
}
