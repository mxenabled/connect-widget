// TODO: REMOVE no-unused-vars
import axios from 'axios'
import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import _isArray from 'lodash/isArray'

import { REFERRAL_SOURCES, VERIFY_MODE } from 'src/const/Connect'
import { JOB_TYPES } from 'src/const/consts'

export const ApiEndpoints = {
  ACCOUNTS: '/accounts',
  ANALYTICS_EVENTS: '/analytics_events',
  ANALYTICS_PAGEVIEW: '/analytics_pageviews',
  ANALYTICS_SESSION: '/analytics_sessions',
  APPDATA: '/raja/data?type=master',
  BLOCKED_ROUTING_NUMBERS: '/blocked_routing_numbers',
  CONNECT_FEEDBACK: '/connect_feedback',
  FEATURE_VISITS: '/feature_visits',
  INSTITUTIONS: '/institutions',
  INSTRUMENTATION: '/instrumentation',
  JOBS: '/jobs',
  LOGOUT: '/logout',
  MEMBERS: '/members',
  MICRODEPOSITS: '/micro_deposits',
  ROOT: '/raja',
  OAUTH_STATES: '/oauth_states',
  SUPPORT_TICKETS: '/support_tickets',
  USER_FEATURES: '/user_features',
  USER_PROFILES: '/user_profiles',
}

function getHumanInteractionGuid(isHuman) {
  const token = _get(window, ['app', 'options', 'session_token'], '')

  return window.btoa(token.slice(0, 10)) + (isHuman ? '1' : '0')
}

export function buildQueryString(queryObj) {
  return _reduce(
    queryObj,
    (queryStr, value, queryName) => {
      const queryParam = buildQueryParameter(queryName, value)

      return queryStr === '' ? `?${queryParam}` : `${queryStr}&${queryParam}`
    },
    '',
  )
}

export function buildQueryParameter(key, value) {
  return _isArray(value)
    ? value.map((val) => `${key}[]=${encodeURIComponent(val)}`).join('&')
    : `${key}=${encodeURIComponent(value)}`
}

/**
 * FireflyDataSource is made to be used with ConnectAPIService.
 *
 * Each method that exists in ConnectAPIService should also exist
 * as a method here.  Until we have something like Typescript to
 * help with type safety, we much ensure proper implementation
 * using tests and other means.
 */
export class FireflyDataSource {
  constructor(axios) {
    this.axios = axios
  }
  /**
 * 
 * @returns {Promise<Object>} - api response with widget configs
 * 
 * example object: 
 *  "client": {
        "guid": "CLT-123",
    },
    "client_color_scheme": {},
    "client_communication_profile": {},
    "client_profile": {},
    "user": {
        "guid": "USR-123",
    },
    "user_profile": {
        "guid": "USP-123",
    },
    "user_communication_profile": {
        "client_guid": "CLT-123"
    },
    "address": {}
 */
  loadMaster() {
    return this.axios
      .get(ApiEndpoints.APPDATA)
      .then((response) => response.data)
      .catch((error) => error)
  }

  /**
   * @returns - no data is returned
   */
  extendSession() {
    return this.axios
      .get(ApiEndpoints.ROOT + '/extend_session')
      .then((response) => response.data)
      .catch((error) => error)
  }
  /**
   * @returns - no data is returned
   */
  logout() {
    return this.axios
      .get(ApiEndpoints.LOGOUT)
      .then((response) => response.data)
      .catch((error) => error)
  }
  /**
   *
   * @param {Object} configOptions
   * @returns - no data is returned
   */
  instrumentation(configOptions) {
    return this.axios
      .post(ApiEndpoints.INSTRUMENTATION, configOptions)
      .then((response) => response && response.data)
  }
  /**
   *
   * @param {*} memberData
   * @param {Object} connectConfig - configs for MXconnect
   * @param {string} connectConfig.client_redirect_url
   * @param {boolean} connectConfig.include_transactions
   * @param {string} connectConfig.mode
   * @param {string} connectConfig.oauth_referral_source
   * @param {boolean|null} connectConfig.disable_background_agg
   * @param {Object} appConfig - configs for the app
   * @param {boolean} appConfig.is_mobile_webview
   * @param {string} appConfig.ui_message_webview_url_scheme
   * @param {boolean} isHuman
   */
  addMember(memberData, connectConfig = {}, appConfig = {}, isHuman = false) {
    const referralSource =
      appConfig.is_mobile_webview === true
        ? REFERRAL_SOURCES.APP
        : (connectConfig.oauth_referral_source ?? REFERRAL_SOURCES.BROWSER)

    /* When creating new members in Verify Mode, Background Aggregation is DISABLED by default.
       When creating new members in other modes, Background Aggregation is ENABLED.

       If desired, Clients can pass a boolean value for 'disable_background_agg' to connect's config
       which will allow new members to be created with that value for 'background_aggregation_is_disabled'

       See the addMember tests for more info: src/services/__tests__/ConnectAPIService.test.js
    */
    const background_aggregation_is_disabled = Boolean(
      connectConfig.disable_background_agg ?? connectConfig.mode === VERIFY_MODE,
    )
    const options = {
      ...memberData,
      background_aggregation_is_disabled,
      client_redirect_url: connectConfig.client_redirect_url ?? null,
      include_transactions: connectConfig.include_transactions ?? null,
      referral_source: referralSource,
      skip_aggregation: true,
      ui_message_webview_url_scheme: appConfig.ui_message_webview_url_scheme ?? 'mx',
    }

    if (memberData.is_oauth) {
      options.enable_app2app = connectConfig.enable_app2app
    }

    return this.axios
      .post(ApiEndpoints.MEMBERS, options, {
        headers: {
          'x-inter-hu': getHumanInteractionGuid(isHuman),
        },
      })
      .then((response) => response.data)
  }
  /**
   *
   * @param {Object} member
   * @param {Object} connectConfig - configs for MXconnect
   * @param {boolean} connectConfig.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - updated member object
   * Example object
   * {
   *   "guid": "MBR-1",
   *   "connection_status": 6,
   * }
   */
  updateMember(member, connectConfig = {}, isHuman = false) {
    const includeTransactions = connectConfig.include_transactions ?? null
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .put(
        `${ApiEndpoints.MEMBERS}/${member.guid}`,
        {
          ...member,
          include_transactions: includeTransactions,
          skip_aggregation: true,
        },
        { headers },
      )
      .then((response) => response.data.member)
  }

  /**
   *
   * @param {Object} member
   * @param {Object} connectConfig - configs for MXconnect
   * @param {boolean} connectConfig.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - updated member object
   * Example object
   * {
   *   "guid": "MBR-1",
   *   "connection_status": 6,
   * }
   */
  updateMFA(member, connectConfig = {}, isHuman = false) {
    const includeTransactions = connectConfig.include_transactions ?? null
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .put(
        `${ApiEndpoints.MEMBERS}/${member.guid}/update_mfa`,
        {
          ...member,
          include_transactions: includeTransactions,
          skip_aggregation: true,
        },
        { headers },
      )
      .then((response) => response.data.member)
  }

  /**
   *
   * @param {Object} member
   * @returns {Promise<object>} - API response with null
   */
  deleteMember(member) {
    return this.axios
      .delete(`${ApiEndpoints.MEMBERS}/${member.guid}`)
      .then((response) => response.data)
  }
  /**
   *
   * @returns {Promise<Array>} - API response with members
   * Example array
   *
   * [
   *   {
   *     "guid": "MBR-1",
   *     "connection_status": 6,
   *   },
   *   {
   *     "guid": "MBR-2"
   *     "connection_status": 2,
   *   }
   * ]
   */
  loadMembers() {
    return this.axios.get(ApiEndpoints.MEMBERS).then((response) => response.data.members)
  }
  /**
   *
   * @param {string} memberGuid
   * @returns {Promise<Object>} - API response with requested member
   * Example object
   *  {
   *    "guid": "MBR-1",
   *    "connection_status": 6,
   *  }
   */
  loadMemberByGuid(memberGuid) {
    return this.axios.get(`${ApiEndpoints.MEMBERS}/${memberGuid}`).then((resp) => {
      return resp.data.member
    })
  }

  /**
   * 
   * @param {*} queryObject 
   * @returns {Promise<Object>}
   * 
   * Example object
    [{
            "guid": "OAS-1",
            "auth_status": 1,
            "created_at": "2023-07-27T20:13:44+00:00",
            "error_reason": null,
            "first_retrieved_at": null,
            "inbound_member_guid": null,
            "outbound_member_guid": "MBR-1",
            "updated_at": "2023-07-27T20:13:44+00:00",
            "user_guid": "USR-1"
        }]
   */
  loadOAuthStates(queryObject) {
    const query = buildQueryString(queryObject)

    return this.axios
      .get(`${ApiEndpoints.OAUTH_STATES}${query}`)
      .then((resp) => resp.data.oauth_states)
  }

  /**
   *
   * @param {string} oauthStateGuid the guid of the oauth state
   * @returns {Promise<Object>} - API response with oauth state object
   * 
   * Example Object
   *   "oauth_state": {
        "guid": "OAS-1",
        "auth_status": 1,
        "created_at": "2023-07-31T21:37:22+00:00",
        "error_reason": null,
        "first_retrieved_at": null,
        "inbound_member_guid": null,
        "outbound_member_guid": "MBR-123",
        "updated_at": "2023-07-31T21:37:22+00:00",
        "user_guid": "USR-123"
    }
   * 
   */
  loadOAuthState(oauthStateGuid) {
    return this.axios
      .get(`${ApiEndpoints.OAUTH_STATES}/${oauthStateGuid}`)
      .then((resp) => resp.data.oauth_state)
  }

  /**
   *
   * @param {Object} feedback - The feedback from end-user.
   * @param {string} feedback.rating - The rating from end-user.
   * @param {string} feedback.comments - The comment from end-user.
   * @param {string} feedback.source - The source/connections_status from member.
   * @returns {Promise<object>} - API response with feedback object
   * 
   * Example object
   * {
      connect_feedback: {
        client_guid: 'CLT-9e20ea82-0beb-43ac-ac34-eb3756a41509',
        comments: 'This is an internal test',
        guid: 'CFB-123',
        rating: 4,
        source: 6,
        user_guid: 'USR-123'
      },
    }
   */
  submitConnectFeedback(feedback) {
    return this.axios
      .post(ApiEndpoints.CONNECT_FEEDBACK, feedback)
      .then((response) => response.data)
      .catch((error) => error)
  }
  /**
   *
   * @param {Object} ticket - The ticket from end-user.
   * @param {string} ticket.email - The email from end-user.
   * @param {string} ticket.message - The message from end-user.
   * @param {string} ticket.title - The title from end-user.
   * @returns {Promise<object>} - API response with empty body
   *
   * Example object
   * {}
   */
  createSupportTicket(ticket) {
    return this.axios
      .post(ApiEndpoints.SUPPORT_TICKETS, ticket)
      .then((response) => response.data)
      .catch((error) => error)
  }

  /**
   *
   * @param {Object} query
   * @returns {Promise<Array>} - API response with an array of institutions
   *
   * Example Object
   * [{
   *    account_verification_is_enabled: true,
   *    code: "gringotts",
   *    forgot_password_credential_recovery_url: "https://mx.com/forgot_password",
   *    forgot_username_credential_recovery_url: null,
   *    guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",
   *    login_url: null,
   *    name: "Gringotts",
   *    popularity: 32685,
   *    supports_oauth: false,
   *    tax_statement_is_enabled: false,
   *    trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",
   *    url: "https://gringotts.sand.internal.mx"
   * }]
   */

  loadInstitutions(query) {
    const url =
      typeof query === 'undefined'
        ? `${ApiEndpoints.INSTITUTIONS}`
        : `${ApiEndpoints.INSTITUTIONS}${buildQueryString(query)}`

    return this.axios.get(url).then((response) => response.data)
  }

  /**
   *
   * @param {string} guid
   * @returns {Promise<Object>} - API response with institution
   *
   * Example Object:
   * { account_verification_is_enabled: true,
   *   code: "gringotts",
   *   credentials: [{credential:{}}],
   *   forgot_password_credential_recovery_url: "https://mx.com/forgot_password",
   *   forgot_username_credential_recovery_url: null,
   *   guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",
   *   instructional_data: {,…},
   *   instructional_text: "",
   *   login_url: null,
   *   name: "Gringotts",
   *   popularity: 32688,
   *   supports_oauth: false,
   *   tax_statement_is_enabled: false,
   *   trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",
   *   url: "https://gringotts.sand.internal.mx",
   *  }
   *
   */
  loadInstitutionByGuid(guid) {
    return this.axios.get(ApiEndpoints.INSTITUTIONS + '/' + guid).then((response) => ({
      ...response.data.institution,
      // Remove extra level of nesting
      credentials: response.data.institution.credentials.map((credential) => credential.credential),
    }))
  }

  /**
   *
   * @param {string} code - provided to clients using Atrium API
   * @returns {Promise<Object>} - API Response with institution
   *  * Example Object:
   * { account_verification_is_enabled: true,
   *   code: "gringotts",
   *   credentials: [{credential:{}}],
   *   forgot_password_credential_recovery_url: "https://mx.com/forgot_password",
   *   forgot_username_credential_recovery_url: null,
   *   guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",
   *   instructional_data: {,…},
   *   instructional_text: "",
   *   login_url: null,
   *   name: "Gringotts",
   *   popularity: 32688,
   *   supports_oauth: false,
   *   tax_statement_is_enabled: false,
   *   trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",
   *   url: "https://gringotts.sand.internal.mx",
   *  }
   *
   */
  loadInstitutionByCode(code) {
    const headers = {
      Accept: 'application/vnd.moneydesktop.v2+json',
      'Content-Type': 'application/json',
      'MD-Session-Token': window.app.options.session_token,
    }

    return this.axios.get(ApiEndpoints.INSTITUTIONS + '/' + code, { headers }).then((response) => ({
      ...response.data.institution,
      // Remove extra level of nesting
      credentials: response.data.institution.credentials.map((credential) => credential.credential),
    }))
  }

  /**
   *
   * @param {Object} query
   * @returns {Promise<Array>} - API Response with an array of institutions
   *
   * Example Array
   * * [{
   *    account_verification_is_enabled: true,
   *    code: "gringotts",
   *    forgot_password_credential_recovery_url: "https://mx.com/forgot_password",
   *    forgot_username_credential_recovery_url: null,
   *    guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",
   *    login_url: null,
   *    name: "Gringotts",
   *    popularity: 32685,
   *    supports_oauth: false,
   *    tax_statement_is_enabled: false,
   *    trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",
   *    url: "https://gringotts.sand.internal.mx"
   * }]
   *
   */
  loadPopularInstitutions(query) {
    const url =
      typeof query === 'undefined'
        ? `${ApiEndpoints.INSTITUTIONS}/favorite`
        : `${ApiEndpoints.INSTITUTIONS}/favorite${buildQueryString(query)}`

    return this.axios.get(url).then((response) => {
      return response.data
    })
  }

  /**
   *
   * @returns {Promise<Array>} - API Response with an array of institutions
   *
   * Example Array
   * * [{
   *    account_verification_is_enabled: true,
   *    code: "gringotts",
   *    forgot_password_credential_recovery_url: "https://mx.com/forgot_password",
   *    forgot_username_credential_recovery_url: null,
   *    guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",
   *    login_url: null,
   *    name: "Gringotts",
   *    popularity: 32685,
   *    supports_oauth: false,
   *    tax_statement_is_enabled: false,
   *    trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",
   *    url: "https://gringotts.sand.internal.mx"
   * }]
   *
   */
  loadDiscoveredInstitutions() {
    const url = `${ApiEndpoints.INSTITUTIONS}/discovered`

    return this.axios.get(url).then((response) => response.data)
  }

  /**
   * This is used for creating manual accounts.
   * @param {Object} account - The account details
   * @returns {Promise<Object>} - API response with new account
   * Example object
   * {
   *   "guid": "ACC-123",
   *   "account_type": "CHECKING",
   * }
   */
  createAccount(account) {
    return this.axios.post(ApiEndpoints.ACCOUNTS, account).then((response) => response.data.account)
  }

  /**
   *
   * @returns {Promise<Object>} - API response with accounts
   * Example object
   * {
   *  accounts: [
   *    {
   *      "guid": "ACC-123",
   *      "account_type": "CHECKING",
   *    },
   *    {
   *      "guid": "ACC-234",
   *      "account_type": "SAVINGS",
   *    },
   *  ]
   * }
   */
  loadAccounts() {
    return this.axios
      .get(ApiEndpoints.ACCOUNTS)
      .then((response) => response.data.accounts)
      .catch((error) => error)
  }

  /**
   *
   * @param {string} currentMemberGuid
   * @returns {Promise<Object>} API response with accounts
   *
   * Example object
   *
   * accounts: [{
   * account_number : '1234'
   * account_type : 1
   * available_balance : 1000
   * balance : 1000
   * balance_updated_at: 1690834994
   * currency_code: "USD"
   * feed_name: "Gringotts Checking"
   * guid: "ACT-123"
   * institution_guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9"
   * member_guid: "MBR-323" ...
   * }]
   */
  loadAccountsByMember(currentMemberGuid) {
    return this.axios
      .get(`${ApiEndpoints.ACCOUNTS}/${buildQueryString({ member_id: currentMemberGuid })}`)
      .then((response) => response.data.accounts)
      .catch((error) => error)
  }

  /**
   *
   * @returns {Promise<Object>} - API response with accounts and members
   * Example object
   * {
   *   accounts: [
   *     {
   *       "guid": "ACC-123",
   *       "account_type": "CHECKING",
   *     },
   *     {
   *       "guid": "ACC-234"
   *       "account_type": "SAVINGS",
   *     }
   *   ],
   *   members: [
   *     {
   *       "guid": "MBR-1",
   *       "connection_status": 6,
   *     }
   *   ]
   * }
   */
  loadAccountsAndMembers() {
    const requests = [this.axios.get(ApiEndpoints.MEMBERS), this.axios.get(ApiEndpoints.ACCOUNTS)]

    return axios
      .all(requests)
      .then(
        axios.spread((membersResponse, accountsResponse) => {
          const payload = {
            accounts: accountsResponse.data.accounts,
            members: membersResponse.data.members,
          }

          return payload
        }),
      )
      .catch((error) => error)
  }
  /**
   *
   * @param {Array<String>} accountGuids
   * @returns {Promise<Object>} API response with accounts
   * example object
   * "atlas::abacus::account": {
        "account_number": "XXXXXX1234",
        "account_subtype": 0,
        "account_type": 0,
        "available_balance": 1000.0,
        "balance": 1000.0,
        "balance_updated_at": 1690908975,
        "currency_code": "USD",
        "external_guid": "account-123",
        "feed_name": "Gringotts Any",
        "guid": "ACT-123",
        "institution_guid": "INS-123",
        "member_guid": "MBR-123",
        "name": "Gringotts Any",
        "original_balance": 0.0,
        "payment_due_at": 0,
        "pending_balance": 0.0,
        "updated_at": 1691009016,
        "user_guid": "USR-123"
    }
   */
  mergeAccounts(accountGuids) {
    return this.axios
      .put(ApiEndpoints.ACCOUNTS + '/merge', { accounts: accountGuids })
      .catch((error) => error)
  }
  /**
   *
   * @param {Object} account
   * @returns {Promise<Object>} - api response with accounts
   * Example Object
   * 
   *  "account": {
        "account_number": "XXXXXX1234",
        "available_balance": 1000.0,
        "balance_updated_at": 1690908975,
        "currency_code": "USD",
        "external_guid": "account-123",
        "guid": "ACT-123",
        "institution_guid": "INS-123",
        "is_closed": true,
        "member_guid": "MBR-123",
        "name": "Gringotts Any",
        "updated_at": 1691010574,
        "user_guid": "USR-123",
        "user_name": "Gringotts Any"
    }
   */
  saveAccount(account) {
    return this.axios
      .put(ApiEndpoints.ACCOUNTS + '/' + account.guid, account)
      .then((response) => {
        return response.data.account
      })
      .catch((error) => error)
  }

  /**
   * @param {Object} microdeposit
   * @returns {Promise<Object>} API response with micro_deposit
   * example object
   *
   * { account_name: 'Checking',
   * account_number: '**** 3160',
   * account_type: '1',
   * can_auto_verify: 'false',
   * deposit_expected_at: "2023-04-13T09:00:00+00:00",
   * email: 'test@test.com',
   * first_name: 'First',
   * guid: 'MIC-123
   * last_name: 'Last',
   * routing_number: '123456789',
   * status: 0,
   * status_name: 'INITIATED',
   * updated_at: '1681150156',
   * user_guid: 'USR-123'
   */
  createMicrodeposit(microdeposit) {
    return this.axios.post(`${ApiEndpoints.MICRODEPOSITS}`, microdeposit).then((resp) => resp.data)
  }
  /**
   *
   * @param {string} microdepositGuid
   * @returns {Promise<Object>} API response with micro_deposit
   * example object
   *
   * { account_name: 'Test Checking',
   * account_number: '123456789',
   * account_type: 1,
   * can_auto_verify: false,
   * deposit_expected_at: '2023-04-13T09:00:00+00:00,
   * email: 'test@test.com',
   * first_name: 'First',
   * guid: 'MIC-123',
   * last_name: 'Last',
   * routing_number: '123456789',
   * status : 0,
   * status_name: 'INITIATED',
   * updated_at: '1681151550',
   * user_guid: 'USR-123', }
   *
   */
  loadMicrodepositByGuid(microdepositGuid) {
    return this.axios
      .get(`${ApiEndpoints.MICRODEPOSITS}/${microdepositGuid}`)
      .then((resp) => resp.data.micro_deposit)
  }

  /**
   * Update Microdeposit - This only works with PREINITIATED MicroDeposits. Once you update a PREINITIATED
   * MicroDeposit, it will automatically start the process and switch to REQUESTED.
   * @param {string} microdepositGuid "MIC-123"
   * @param {Object} updatedData - Cannot update `deposit_amount_1` or `deposit_amount_2`
   * @param {string} updatedData.account_name - The account name from the end-user
   * @param {string} updatedData.account_number - The account number from the end-user
   * @param {string} updatedData.account_type - The account type from the end-user
   * @param {string} updatedData.email - The email from the end-user
   * @param {string} updatedData.first_name - The first name from the end-user
   * @param {string} updatedData.last_name - The last name from the end-user
   * @param {string} updatedData.routingNumber- The routing number from the end-user
   *
   * @returns {Promise<Object>} - API response with micro_deposit
   * example object
   *
   * { account_name: 'Test Checking',
   * account_number: '123456789',
   * account_type: 1,
   * can_auto_verify: false,
   * deposit_expected_at: '2023-04-13T09:00:00+00:00,
   * email: 'test@test.com',
   * first_name: 'First',
   * guid: 'MIC-123',
   * last_name: 'Last',
   * routing_number: '123456789',
   * status : 0,
   * status_name: 'INITIATED',
   * updated_at: '1681151550',
   * user_guid: 'USR-123', }
   *
   */
  updateMicrodeposit(microdepositGuid, updatedData) {
    return this.axios
      .put(`${ApiEndpoints.MICRODEPOSITS}/${microdepositGuid}`, updatedData)
      .then((resp) => resp.data)
  }

  /**
   *
   * @param {string} microdepositGuid
   * @return {Promise<Object>} - API response with micro-deposit
   * example object
   *
   * { account_name: 'Test Checking',
   * account_number: '123456789',
   * account_type: 1,
   * can_auto_verify: false,
   * deposit_expected_at: '2023-04-13T09:00:00+00:00,
   * email: 'test@test.com',
   * first_name: 'First',
   * guid: 'MIC-123',
   * last_name: 'Last',
   * routing_number: '123456789',
   * status : 0,
   * status_name: 'INITIATED',
   * updated_at: '1681151550',
   * user_guid: 'USR-123', }
   */
  refreshMicrodepositStatus(microdepositGuid) {
    return this.axios
      .get(`${ApiEndpoints.MICRODEPOSITS}/${microdepositGuid}/status`)
      .then((resp) => resp.data)
  }

  /**
   *
   * @param {string} microdepositGuid
   * @param {Object} amountData
   * @param {string} amountData.deposit_amount_1
   * @param {string} amountData.deposit_amount_2
   * @returns {Promise<Object>}
   * example object
   *  * { account_name: 'Test Checking',
   * account_number: '123456789',
   * account_type: 1,
   * can_auto_verify: false,
   * deposit_expected_at: '2023-04-13T09:00:00+00:00,
   * email: 'test@test.com',
   * first_name: 'First',
   * guid: 'MIC-123',
   * last_name: 'Last',
   * routing_number: '123456789',
   * status : 0,
   * status_name: 'DEPOSITED',
   * updated_at: '1681151550',
   * user_guid: 'USR-123', }
   */
  verifyMicrodeposit(microdepositGuid, amountData) {
    return this.axios
      .put(`${ApiEndpoints.MICRODEPOSITS}/${microdepositGuid}/verify`, amountData)
      .then((resp) => resp.data)
  }

  /**
   *
   * @param {string} routingNumber
   * @returns {Promise<Object>} - API response with blocked routing number
   * Example object
   * blockedRoutingNumber: {
   * guid: null,
   * reason: 3,
   * reason_name: "IAV_PREFERRED"
   * }
   */
  verifyRoutingNumber(routingNumber, accountIdentificationEnabled) {
    return this.axios
      .get(
        `${ApiEndpoints.BLOCKED_ROUTING_NUMBERS}/${routingNumber}?account_identification_is_enabled=${accountIdentificationEnabled}`,
      )
      .then((resp) => resp.data)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config - configs for MXconnect
   * @param {boolean} config.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   * Example object
   * member: {
   *   "job_guid": "MBR-1",
   *   "status": 6
   * }
   */
  aggregate = (memberGuid, config, isHuman) => {
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .post(
        `${ApiEndpoints.MEMBERS}/${memberGuid}/unthrottled_aggregate`,
        { include_transactions: config?.include_transactions ?? null },
        { headers },
      )
      .then((response) => response.data)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config - configs for MXconnect
   * @param {boolean} config.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   * Example object
   * member: {
   *   "job_guid": "MBR-1",
   *   "status": 6
   * }
   */
  identify = (memberGuid, config, isHuman) => {
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .post(
        `${ApiEndpoints.MEMBERS}/${memberGuid}/identify`,
        { include_transactions: config?.include_transactions ?? null },
        { headers },
      )
      .then((response) => response.data)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config - configs for MXconnect
   * @param {boolean} config.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   * Example object
   * member: {
   *   "job_guid": "MBR-1",
   *   "status": 6
   * }
   */
  verify = (memberGuid, config, isHuman) => {
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .post(
        `${ApiEndpoints.MEMBERS}/${memberGuid}/verify`,
        { include_transactions: config?.include_transactions ?? null },
        { headers },
      )
      .then((response) => response.data)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config - configs for MXconnect
   * @param {boolean} config.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   * Example object
   * member: {
   *   "job_guid": "MBR-1",
   *   "status": 6
   * }
   */
  reward = (memberGuid, config, isHuman) => {
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .post(
        `${ApiEndpoints.MEMBERS}/${memberGuid}/fetch_rewards`,
        { include_transactions: config?.include_transactions ?? null },
        { headers },
      )
      .then((response) => response.data)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config - configs for MXconnect
   * @param {boolean} config.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   * Example object
   * member: {
   *   "job_guid": "MBR-1",
   *   "status": 6
   * }
   */
  tax = (memberGuid, config, isHuman) => {
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .post(
        `${ApiEndpoints.MEMBERS}/${memberGuid}/tax`,
        { include_transactions: config?.include_transactions ?? null },
        { headers },
      )
      .then((response) => response.data)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config - configs for MXconnect
   * @param {boolean} config.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   * Example object
   * member: {
   *   "job_guid": "MBR-1",
   *   "status": 6
   * }
   */
  combination = (memberGuid, config, isHuman) => {
    const headers = {
      'x-inter-hu': getHumanInteractionGuid(isHuman),
    }

    return this.axios
      .post(
        `${ApiEndpoints.MEMBERS}/${memberGuid}/order_products`,
        {
          include_transactions: config?.include_transactions ?? null,
          products: config.data_request.products,
        },
        { headers },
      )
      .then((response) => response.data)
  }

  /**
   *
   * @param {string} jobGuid
   * @returns {Promise<Object>} - API response with job
   * Example object
   * job: {
   *  guid: "JOB-1",
   *  job_type: 0,
   *  status: 6,
   *  finished_at: 1682356863
   * }
   */
  loadJob(jobGuid) {
    return this.axios.get(ApiEndpoints.JOBS + '/' + jobGuid).then((response) => response.data.job)
  }

  /**
   *
   * @param {string} jobType
   * @param {string} memberGuid
   * @param {Object} connectConfig - configs for MXconnect
   * @param {boolean} connectConfig.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   * Example object
   * member: {
   *   "job_guid": "MBR-1",
   *   "status": 6
   * }
   */
  runJob(jobType, memberGuid, connectConfig, isHuman) {
    let jobCall = this.aggregate

    if (jobType === JOB_TYPES.VERIFICATION) {
      jobCall = this.verify
    } else if (jobType === JOB_TYPES.REWARD) {
      jobCall = this.reward
    } else if (jobType === JOB_TYPES.TAX) {
      jobCall = this.tax
    } else if (jobType === JOB_TYPES.IDENTIFICATION) {
      jobCall = this.identify
    } else if (jobType === JOB_TYPES.COMBINATION) {
      jobCall = this.combination
    }

    return jobCall(memberGuid, connectConfig, isHuman)
  }

  /**
   *
   * @param {string} institutionGuid "INS-123"
   * @returns {Promise<object>} - API response with credentials
   * 
   * Example object
   * {
      credentials: [
        {
          display_order: 1,
          field_name: 'LOGIN',
          field_type: 3,
          guid: 'CRD-123',
          label: 'Username',
          meta_data: null,
          optional: false,
          options: null,
        },
        ...
      ],
    }
   */
  getInstitutionCredentials(institutionGuid) {
    return this.axios
      .get(`${ApiEndpoints.INSTITUTIONS}/${institutionGuid}/credentials`)
      .then((response) => response.data.credentials)
  }

  /**
   *
   * @param {string} memberGuid "MBR-123"
   * @returns {Promise<object>} - API response with credentials
   * 
   * Example object
   * {
      credentials: [
        {
          display_order: 1,
          field_name: 'LOGIN',
          field_type: 3,
          guid: 'CRD-123',
          label: 'Username',
          meta_data: null,
          optional: false,
          options: null,
        },
        ...
      ],
    }
   */
  getMemberCredentials(memberGuid) {
    return this.axios
      .get(`${ApiEndpoints.MEMBERS}/${memberGuid}/credentials`)
      .then((response) => response.data.credentials)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config
   * @returns {Promise<Object>} - API Response with Oauth URI
   * example object:
   * {
   *    guid: "MBR-123",
   *    oauth_window_uri: "https://banksy.kube.sand.internal.mx/oauth/authorize?client_id=QNxNCdUN5pjVdjPk1HKWRsGO2DE_EOaHutrXHZGp2KI&redirect_uri=https%3A%2F%2Fapp.sand.internal.mx%2Foauth%2Fredirect_from&response_type=code&scope=read&state=30b10bf99b063b8b0caee61ec42d3cd8"
   * }
   */
  getOAuthWindowURI(memberGuid, appConfig, connectConfig) {
    /**
     * referral source defaults to BROWSER but can be set to APP, either by
     * `is_mobile_webview`, or by `oauth_referral_source`.
     *
     * The reason we expose `oauth_referral_source` is for integrations that
     * wrap our widget in an iframe with a webapp that is wrapped in a webview.
     *
     * Example integrations:
     * Web app -> Iframe -> Connect
     * Native app -> webview -> Connect
     * Native app -> webview -> web app -> iframe -> Connect
     *
     * This way, clients that are wrapping us in an iframe but loading their app
     * in a webview can keep `is_mobile_webview` as `false` and still get
     * redirected back to their native app by setting the referral source
     * explicity by setting referral_source to APP.
     */

    const referralSource =
      appConfig?.is_mobile_webview === true
        ? REFERRAL_SOURCES.APP
        : (connectConfig?.oauth_referral_source ?? REFERRAL_SOURCES.BROWSER)

    const scheme = appConfig?.ui_message_webview_url_scheme ?? 'mx'
    const clientRedirectConfig = connectConfig?.client_redirect_url
    const client_redirect_querystring = clientRedirectConfig
      ? `&client_redirect_url=${clientRedirectConfig}`
      : ''
    const enableApp2App = connectConfig.enable_app2app ?? true

    return this.axios
      .get(
        `${ApiEndpoints.MEMBERS}/${memberGuid}/oauth_window_uri?referral_source=${referralSource}&ui_message_webview_url_scheme=${scheme}&skip_aggregation=true&enable_app2app=${enableApp2App}${client_redirect_querystring}`,
      )
      .then((response) => response.data)
  }

  /**
 * 
 * @param {Object} options 
 * @returns {Promise<Object>} - api response with analytics session
 * Example object: 
 *   "analytics_session": {
        "guid": "ANS-123",
        "is_first_visit": false,
        "browser_name": "Chrome",
        "browser_version": "115.0.0.0",
        "product_name": "Connect",
        "product_version": "1.0.0"
    }
 */
  createAnalyticsSession(options) {
    return this.axios
      .post(ApiEndpoints.ANALYTICS_SESSION, options)
      .then((response) => response.data)
  }

  /**
   * 
   * @param {Object} session 
   * @returns {Promise<Object>} - api response with analytics session
   * example object: 
   *   "analytics_session": {
        "guid": "ANS-123",
        "is_first_visit": false,
        "browser_name": "Chrome",
        "browser_version": "115.0.0.0",
        "product_name": "Connect",
        "product_version": "1.0.0"
    }
   */
  closeAnalyticsSession(session) {
    if (session && session.analytics_session && session.analytics_session.guid) {
      return this.axios
        .put(ApiEndpoints.ANALYTICS_SESSION + '/' + session.analytics_session.guid, session)
        .then((response) => response.data)
        .catch((error) => error)
    } else {
      return Promise.resolve(null)
    }
  }

  /**
 * 
 * @param {Object} userProfile 
 * @returns {Promise<Object>} - api response with user profile
 * example object: 
 * 
 * "user_profile": {
        "guid": "USP-123",
        "too_small_modal_dismissed_at": "2023-08-10T22:47:00+00:00",
        "user_guid": "USR-123" ...
    }
}
 */
  updateUserProfile(userProfile) {
    const url = `${ApiEndpoints.USER_PROFILES}/${userProfile.guid}`
    return this.axios
      .put(url, userProfile)
      .then((response) => response.data)
      .catch((error) => error)
  }
}
