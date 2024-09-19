/**
 * ConnectAPIService adds an abstraction layer between how our code asks for
 * remote data and the concrete implementation.
 *
 * For example, we don't have to rely on FireflyAPI if we want to move to
 * another API source instead in the future. It also leaves the option of
 * using axios or any other http library up the implementation
 */
export class ConnectAPIService {
  constructor(dataSource) {
    this.dataSource = dataSource
  }
  /**
   *
   * @returns {Promise<Object>} - api response with client configs
   */
  loadMaster() {
    return this.dataSource.loadMaster()
  }
  /**
   * @returns - no data is returned
   */
  extendSession() {
    return this.dataSource.extendSession()
  }
  /**
   * @returns - no data is returned
   */
  logout() {
    return this.dataSource.logout()
  }
  /**
   *
   * @param {Object} configOptions
   * @returns - no data is returned
   */
  instrumentation(configOptions) {
    return this.dataSource.instrumentation(configOptions)
  }
  /**
   *
   * @param {*} memberData
   * @param {Object} config - configs for MXconnect
   * @param {string} config.client_redirect_url
   * @param {boolean} config.include_transactions
   * @param {string} config.mode
   * @param {string} config.oauth_referral_source
   * @param {boolean|null} config.disable_background_agg
   * @param {boolean} config.is_mobile_webview
   * @param {string} config.ui_message_webview_url_scheme
   * @param {boolean} isHuman
   */
  addMember(memberData, config = {}, isHuman = false) {
    return this.dataSource.addMember(memberData, config, isHuman)
  }
  /**
   *
   * @param {Object} member
   * @param {Object} connectConfig - configs for MXconnect
   * @param {boolean} connectConfig.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - updated member object
   */
  updateMember(member, connectConfig = {}, isHuman = false) {
    return this.dataSource.updateMember(member, connectConfig, isHuman)
  }

  /**
   *
   * @param {Object} member
   * @param {Object} connectConfig - configs for MXconnect
   * @param {boolean} connectConfig.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - updated member object
   */
  updateMFA(member, connectConfig = {}, isHuman = false) {
    return this.dataSource.updateMFA(member, connectConfig, isHuman)
  }

  /**
   *
   * @param {Object} member
   * @returns {Promise<object>} - API response with null
   */
  deleteMember(member) {
    return this.dataSource.deleteMember(member)
  }
  /**
   *
   * @returns {Promise<Array>} - API response with members
   */
  loadMembers() {
    return this.dataSource.loadMembers()
  }
  /**
   *
   * @param {string} memberGuid
   * @returns {Promise<Object>} - API response with requested member
   */
  loadMemberByGuid(memberGuid) {
    return this.dataSource.loadMemberByGuid(memberGuid)
  }

  /**
   *
   * @param {Object} queryObject
   * @returns {Promise<Object>} - API response with OAuth State
   */
  loadOAuthStates(queryObject) {
    return this.dataSource.loadOAuthStates(queryObject)
  }

  /**
   *
   * @param {String} oauthStateGuid
   * @returns {Promise<Object>} - API response with OauthState
   */
  loadOAuthState(oauthStateGuid) {
    return this.dataSource.loadOAuthState(oauthStateGuid)
  }

  /**
   *
   * @param {Object} feedback - The feedback from end-user.
   * @param {string} feedback.rating - The rating from end-user.
   * @param {string} feedback.comment - The comment from end-user.
   * @param {string} feedback.source - The source/connection_status from member.
   * @returns {Promise<object>} - API response with feedback object
   */
  submitConnectFeedback(feedback) {
    return this.dataSource.submitConnectFeedback(feedback)
  }
  /**
   *
   * @param {Object} ticket - The ticket from end-user.
   * @param {string} ticket.email - The email from end-user.
   * @param {string} ticket.message - The message from end-user.
   * @param {string} ticket.title - The title from end-user.
   * @returns {Promise<object>} - API response with empty body
   */
  createSupportTicket(ticket) {
    return this.dataSource.createSupportTicket(ticket)
  }

  /**
   *
   * @param {Object} query
   * @returns {Promise<Array>} - API response with an array of institutions
   */
  loadInstitutions(query) {
    return this.dataSource.loadInstitutions(query)
  }

  /**
   *
   * @param {string} guid
   * @returns {Promise<Object>} - API Response with Institution
   */
  loadInstitutionByGuid(guid) {
    return this.dataSource.loadInstitutionByGuid(guid)
  }

  /**
   *
   * @param {string} code
   * @returns {Promise<Object>} - API Response with Institution
   */
  loadInstitutionByCode(code) {
    return this.dataSource.loadInstitutionByCode(code)
  }

  /**
   *
   * @param {Object} query
   * @returns {Promise<Array>} - API Response with an Array of institutions
   */
  loadPopularInstitutions(query) {
    return this.dataSource.loadPopularInstitutions(query)
  }

  /**
   * @returns {Promise<Array>} - API Response with an Array of institutions
   */
  loadDiscoveredInstitutions() {
    return this.dataSource.loadDiscoveredInstitutions()
  }

  /**
   * This is used for creating manual accounts.
   * @param {Object} account - The account details
   * @returns {Promise<Object>} API response with account object
   */
  createAccount(account) {
    return this.dataSource.createAccount(account)
  }

  /**
   *
   * @param {Array<String>} accountGuids
   * @returns {Promise<Object>} API response with account
   */
  mergeAccounts(accountGuids) {
    return this.dataSource.mergeAccounts(accountGuids)
  }

  /**
   *
   * @returns {Promise<Object>} API response with accounts
   */
  loadAccounts() {
    return this.dataSource.loadAccounts()
  }

  /**
   *
   * @returns {Promise<Object>} API response with accounts and members
   */
  loadAccountsAndMembers() {
    return this.dataSource.loadAccountsAndMembers()
  }
  /**
   *
   * @param {Object} account
   * @returns {Promise<Object>} API response with account
   */
  saveAccount(account) {
    return this.dataSource.saveAccount(account)
  }

  /**
   *
   * @param {string} currentMemberGuid
   * @returns {Promise<Object>} API response with accounts
   */
  loadAccountsByMember(currentMemberGuid) {
    return this.dataSource.loadAccountsByMember(currentMemberGuid)
  }

  /**
   *
   * @param {Object} microdeposit
   * @returns {Promise<Object>} API response with micro_deposit
   */
  createMicrodeposit(microdeposit) {
    return this.dataSource.createMicrodeposit(microdeposit)
  }

  /**
   *
   * @param {string} microdepositGuid ex. MIC-123
   *
   * @returns {Promise<Object>} API response with micro_deposit
   */
  loadMicrodepositByGuid(microdepositGuid) {
    return this.dataSource.loadMicrodepositByGuid(microdepositGuid)
  }

  /**
   * Update Microdeposit - This only works with PREINITIATED MicroDeposits. Once you update a PREINITIATED
   * MicroDeposit, it will automatically start the process and switch to REQUESTED.
   * @param {string} microdepositGuid - ex. MIC-123
   * @param {Object} updatedData - Cannot update `deposit_amount_1` or `deposit_amount_2`
   * @param {string} updatedData.account_name - The account name from the end-user
   * @param {string} updatedData.account_number - The account number from the end-user
   * @param {string} updatedData.account_type - The account type from the end-user
   * @param {string} updatedData.email - The email from the end-user
   * @param {string} updatedData.first_name - The first name from the end-user
   * @param {string} updatedData.last_name - The last name from the end-user
   * @param {string} updatedData.routingNumber- The routing number from the end-user
   *
   * @returns {Promise<Object>} API response with micro_deposit
   */
  updateMicrodeposit(microdepositGuid, updatedData) {
    return this.dataSource.updateMicrodeposit(microdepositGuid, updatedData)
  }

  /**
   *
   * @param {string} microdepositGuid
   * @returns {Promise<Object>} API response with micro_deposit
   */
  refreshMicrodepositStatus(microdepositGuid) {
    return this.dataSource.refreshMicrodepositStatus(microdepositGuid)
  }

  /**
   *
   * @param {string} microdepositGuid - Mic-123
   * @param {Object} amountData
   * @param {string} amountData.deposit_amount_1
   * @param {string} amountData.deposit_amount_2
   * @returns {Promise<Object>}
   */
  verifyMicrodeposit(microdepositGuid, amountData) {
    return this.dataSource.verifyMicrodeposit(microdepositGuid, amountData)
  }

  /**
   *
   * @param {string} routingNumber
   * @returns {Promise<Object>}
   */
  verifyRoutingNumber(routingNumber, accountIdentificationEnabled) {
    return this.dataSource.verifyRoutingNumber(routingNumber, accountIdentificationEnabled)
  }

  /**
   *
   * @param {string} jobGuid
   * @returns {Promise<Object>} - API response with job
   */
  loadJob(jobGuid) {
    return this.dataSource.loadJob(jobGuid)
  }

  /**
   *
   * @param {string} jobType
   * @param {string} memberGuid
   * @param {Object} connectConfig - configs for MXconnect
   * @param {boolean} connectConfig.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   */
  runJob(jobType, memberGuid, connectConfig = {}, isHuman = false) {
    return this.dataSource.runJob(jobType, memberGuid, connectConfig, isHuman)
  }

  /**
   *
   * @param {string} institutionGuid "INS-123"
   * @returns {Promise<object>} - API response with credentials
   */
  getInstitutionCredentials(institutionGuid) {
    return this.dataSource.getInstitutionCredentials(institutionGuid)
  }

  /**
   *
   * @param {string} memberGuid "MBR-123"
   * @returns {Promise<object>} - API response with credentials
   */
  getMemberCredentials(memberGuid) {
    return this.dataSource.getMemberCredentials(memberGuid)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config - configs for MXconnect
   * @param {boolean} config.include_transactions
   * @param {boolean} isHuman
   * @returns {Promise<object>} - member object
   */
  aggregate(memberGuid, config = {}, isHuman = false) {
    return this.dataSource.aggregate(memberGuid, config, isHuman)
  }

  /**
   *
   * @param {string} memberGuid
   * @param {Object} config
   * @returns {Promise<Object>} - API Response with OAuth uri
   */
  getOAuthWindowURI(memberGuid, config) {
    return this.dataSource.getOAuthWindowURI(memberGuid, config)
  }

  /**
   *
   * @param {Object} options
   * @returns {Promise<Object>} - api response with analytics session
   */
  createAnalyticsSession(options) {
    return this.dataSource.createAnalyticsSession(options)
  }

  /**
   *
   * @param {Object} session
   * @returns {Promise<Object>} - api response with analytics session
   */
  closeAnalyticsSession(session) {
    return this.dataSource.closeAnalyticsSession(session)
  }

  /**
   *
   * @param {Object} userProfile
   * @returns {Promise<Object>} - api response with user profile
   */
  updateUserProfile(userProfile) {
    return this.dataSource.updateUserProfile(userProfile)
  }
}
