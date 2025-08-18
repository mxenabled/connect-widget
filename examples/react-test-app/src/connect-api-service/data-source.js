import { banks, credentialBank, discoveredBank, oauthBank } from './data/institutions'
import * as members from './data/members'

export const JOB_TYPES = {
  AGGREGATION: 0,
  VERIFICATION: 1,
  IDENTIFICATION: 2,
  HISTORY: 3,
  STATEMENT: 4,
  ORDER: 5,
  REWARD: 6,
  BALANCE: 7,
  MICRO_DEPOSIT: 8,
  TAX: 9,
  CREDIT_REPORT: 10,
  COMBINATION: 11,
}

/**
 * MockDataSource provides stubbed implementations of all the data source methods
 * used by ConnectAPIService for testing and development purposes.
 */
export class MockDataSource {
  constructor() {
    this.delay = 500 // Simulate network delay
  }

  /**
   * Simulate async API call with delay
   */
  async _mockApiCall(data = {}) {
    await new Promise((resolve) => setTimeout(resolve, this.delay))
    console.log('return mocked data: ', data)
    return data
  }

  /**
   * Add member
   */
  async addMember(memberData, config = {}, isHuman = false) {
    console.log('MockDataSource.addMember called with:', { memberData, config, isHuman })

    const member = members.create(memberData, config)
    const memberResponse = { member }

    return this._mockApiCall(memberResponse)
  }

  /**
   * Update member
   */
  async updateMember(member, connectConfig = {}, isHuman = false) {
    console.log('MockDataSource.updateMember called with:', { member, connectConfig, isHuman })

    const updatedMember = members.update(member)
    const updateMemberResponse = { member: updatedMember }

    return this._mockApiCall(updateMemberResponse.member)
  }

  /**
   * Update MFA
   */
  async updateMFA(member, connectConfig = {}, isHuman = false) {
    console.log('MockDataSource.updateMFA called with:', { member, connectConfig, isHuman })

    const updatedMember = members.update(member)
    updatedMember.connection_status = 18 // 18 is RESUMED
    const updateMfaResponse = { member: updatedMember }

    return this._mockApiCall(updateMfaResponse.member)
  }

  /**
   * Delete member
   */
  async deleteMember(member) {
    console.log('MockDataSource.deleteMember called with:', { member })
    members.remove(member)
    return this._mockApiCall(null)
  }

  /**
   * Load members
   */
  async loadMembers(clientLocale) {
    console.log('MockDataSource.loadMembers called with:', { clientLocale })

    const allMembers = [] //members.get()
    const loadMembersResponse = {
      members: allMembers,
    }

    return this._mockApiCall(loadMembersResponse.members)
  }

  /**
   * Load member by GUID
   */
  async loadMemberByGuid(memberGuid, clientLocale) {
    console.log('MockDataSource.loadMemberByGuid called with:', { memberGuid, clientLocale })

    // Add this to the response to simulate a successful connection...  Need to handle other statuses still
    const successfulConnectionProp = {
      aggregation_status: 6,
      connection_status: 6,
    }

    const member = members.getByGuid(memberGuid)
    const memberResponse = { member }
    return this._mockApiCall({ ...memberResponse.member, ...successfulConnectionProp })
  }

  /**
   * Load OAuth states
   */
  async loadOAuthStates(queryObject) {
    console.log('MockDataSource.loadOAuthStates called with:', { queryObject })

    const oauthStatesResponse = {
      oauth_states: [
        {
          guid: 'OAS-e6f5fdf7-5d04-42b2-80e8-3c4005a89f60',
          auth_status: 1,
          created_at: '2025-08-14T19:12:40+00:00',
          error_reason: null,
          first_retrieved_at: null,
          inbound_member_guid: null,
          outbound_member_guid: 'MBR-bae9bcbf-9825-4305-b62f-9aebe5d2f597',
          updated_at: '2025-08-14T19:12:40+00:00',
          user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        },
      ],
    }

    return this._mockApiCall(oauthStatesResponse.oauth_states)
  }

  /**
   * Load OAuth state
   */
  async loadOAuthState(oauthStateGuid) {
    console.log('MockDataSource.loadOAuthState called with:', { oauthStateGuid })

    const oauthStateResponse = {
      oauth_state: {
        guid: 'OAS-e6f5fdf7-5d04-42b2-80e8-3c4005a89f60',
        auth_status: 1,
        created_at: '2025-08-14T19:12:40+00:00',
        error_reason: null,
        first_retrieved_at: null,
        inbound_member_guid: null,
        outbound_member_guid: 'MBR-bae9bcbf-9825-4305-b62f-9aebe5d2f597',
        updated_at: '2025-08-14T19:12:40+00:00',
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
      },
    }
    return this._mockApiCall(oauthStateResponse.oauth_state) // wrap in object?
  }

  /**
   * Create support ticket
   */
  async createSupportTicket(ticket) {
    console.log('MockDataSource.createSupportTicket called with:', { ticket })
    return this._mockApiCall(null)
  }

  /**
   * Load institutions
   */
  async loadInstitutions(query) {
    console.log('MockDataSource.loadInstitutions called with:', { query })
    const { search_name: searchName } = query
    const institutionsResponse = banks.filter((bank) => {
      return bank.name.toLowerCase().includes(searchName.toLowerCase())
    })

    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Load institution by GUID
   */
  async loadInstitutionByGuid(guid) {
    console.log('MockDataSource.loadInstitutionByGuid called with:', { guid })

    const institutionByGuidResponse = { institution: null }
    const institution = banks.find((bank) => bank.guid === guid)
    if (institution) {
      institutionByGuidResponse.institution = institution
    }

    // Reform the data for convenience
    const updatedResponseData = {
      ...institutionByGuidResponse.institution,
      credentials: institutionByGuidResponse.institution.credentials.map(
        (credential) => credential.credential,
      ),
    }
    return this._mockApiCall(updatedResponseData)
  }

  /**
   * Load institution by code
   */
  async loadInstitutionByCode(code) {
    console.log('MockDataSource.loadInstitutionByCode called with:', { code })

    const institutionByCodeResponse = { institution: null }
    const institution = banks.find((bank) => bank.code === code)
    if (institution) {
      institutionByCodeResponse.institution = institution
    }

    // Reform the data for convenience
    const updatedResponseData = {
      ...institutionByCodeResponse.institution,
      credentials: institutionByCodeResponse.institution.credentials.map(
        (credential) => credential.credential,
      ),
    }
    return this._mockApiCall(updatedResponseData)
  }

  /**
   * Load popular institutions
   */
  async loadPopularInstitutions(query) {
    console.log('MockDataSource.loadPopularInstitutions called with:', { query })
    const institutionsResponse = [credentialBank, oauthBank]

    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Load discovered institutions
   */
  async loadDiscoveredInstitutions(query) {
    console.log('MockDataSource.loadDiscoveredInstitutions called with:', { query })
    const institutionsResponse = [discoveredBank]
    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Create account (manual)
   */
  async createAccount(account) {
    console.log('MockDataSource.createAccount called with:', { account })
    const createdAccountResponse = {
      account: {
        account_number: null,
        account_subtype: null,
        account_type: 1,
        apr: null,
        apy: null,
        available_balance: null,
        balance: 100.0,
        balance_updated_at: 1755200797,
        cash_balance: null,
        credit_limit: null,
        currency_code: null,
        day_payment_is_due: null,
        display_order: null,
        external_guid: null,
        feed_account_type: null,
        feed_apr: null,
        feed_apy: null,
        feed_credit_limit: null,
        feed_day_payment_is_due: null,
        feed_interest_rate: null,
        feed_is_closed: null,
        feed_localized_name: null,
        feed_name: null,
        feed_nickname: null,
        feed_original_balance: null,
        flags: 0,
        guid: 'ACT-11fb6942-f9e7-4943-ba8e-d045f4cd6f67',
        institution_guid: 'INS-MANUAL-cb5c-1d48-741c-b30f4ddd1730',
        interest_rate: 0.01,
        interest_rate_set_by: 2,
        is_closed: false,
        is_deleted: false,
        is_excluded_from_accounts: false,
        is_excluded_from_budgets: false,
        is_excluded_from_cash_flow: false,
        is_excluded_from_debts: false,
        is_excluded_from_goals: false,
        is_excluded_from_investments: false,
        is_excluded_from_net_worth: false,
        is_excluded_from_spending: false,
        is_excluded_from_transactions: false,
        is_excluded_from_trends: false,
        is_hidden: false,
        is_manual: true,
        is_personal: true,
        localized_name: null,
        member_guid: 'MBR-4cda47bd-6f8f-4bc0-b90d-4717b1ad866c',
        member_is_managed_by_user: true,
        metadata: null,
        minimum_payment: null,
        name: 'name',
        nickname: null,
        original_balance: null,
        payment_due_at: null,
        pending_balance: null,
        property_type: null,
        revision: 1,
        updated_at: 1755200797,
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        user_name: 'name',
      },
    }
    return this._mockApiCall(createdAccountResponse.account)
  }

  /**
   * Create microdeposit
   */
  async createMicrodeposit(microdeposit) {
    console.log('MockDataSource.createMicrodeposit called with:', { microdeposit })
    const createdMicrodepositResponse = {
      micro_deposit: {
        guid: 'MIC-cb50c45f-e62b-4807-bc52-58efbf524d02',
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        institution_guid: null,
        member_guid: null,
        account_type: 1,
        account_name: 'Checking ...4123',
        routing_number: '091000019',
        account_number: '4123',
        status: 2,
        status_name: 'DEPOSITED',
        updated_at: 1755201096,
        deposit_expected_at: '2025-08-19T09:00:00+00:00',
        can_auto_verify: false,
        email: 'logan.rasmussen@mx.com',
        first_name: 'Logan',
        last_name: 'Rasmussen',
      },
    }
    return this._mockApiCall(createdMicrodepositResponse.micro_deposit)
  }

  /**
   * Load microdeposit by GUID
   */
  async loadMicrodepositByGuid(microdepositGuid) {
    console.log('MockDataSource.loadMicrodepositByGuid called with:', { microdepositGuid })
    const microdepositResponse = {
      micro_deposit: {
        guid: 'MIC-cb50c45f-e62b-4807-bc52-58efbf524d02',
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        institution_guid: null,
        member_guid: null,
        account_type: 1,
        account_name: 'Checking ...4123',
        routing_number: '091000019',
        account_number: '4123',
        status: 2,
        status_name: 'DEPOSITED',
        updated_at: 1755201096,
        deposit_expected_at: '2025-08-19T09:00:00+00:00',
        can_auto_verify: false,
        email: 'logan.rasmussen@mx.com',
        first_name: 'Logan',
        last_name: 'Rasmussen',
      },
    }
    return this._mockApiCall(microdepositResponse.micro_deposit)
  }

  /**
   * Update microdeposit
   */
  async updateMicrodeposit(microdepositGuid, updatedData) {
    console.log('MockDataSource.updateMicrodeposit called with:', { microdepositGuid, updatedData })
    const microdepositResponse = {
      micro_deposit: {
        guid: 'MIC-cb50c45f-e62b-4807-bc52-58efbf524d02',
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        institution_guid: null,
        member_guid: null,
        account_type: 1,
        account_name: 'Checking ...4123',
        routing_number: '091000019',
        account_number: '4123',
        status: 2,
        status_name: 'INITIATED',
        updated_at: 1755201096,
        deposit_expected_at: '2025-08-19T09:00:00+00:00',
        can_auto_verify: false,
        email: 'logan.rasmussen@mx.com',
        first_name: 'Logan',
        last_name: 'Rasmussen',
      },
    }
    return this._mockApiCall(microdepositResponse)
  }

  /**
   * Refresh microdeposit status
   */
  async refreshMicrodepositStatus(microdepositGuid) {
    console.log('MockDataSource.refreshMicrodepositStatus called with:', { microdepositGuid })
    const microdepositResponse = {
      micro_deposit: {
        guid: 'MIC-cb50c45f-e62b-4807-bc52-58efbf524d02',
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        institution_guid: null,
        member_guid: null,
        account_type: 1,
        account_name: 'Checking ...4123',
        routing_number: '091000019',
        account_number: '4123',
        status: 2,
        status_name: 'DEPOSITED',
        updated_at: 1755201096,
        deposit_expected_at: '2025-08-19T09:00:00+00:00',
        can_auto_verify: false,
        email: 'logan.rasmussen@mx.com',
        first_name: 'Logan',
        last_name: 'Rasmussen',
      },
    }
    return this._mockApiCall(microdepositResponse)
  }

  /**
   * Verify microdeposit
   */
  async verifyMicrodeposit(microdepositGuid, amountData) {
    console.log('MockDataSource.verifyMicrodeposit called with:', { microdepositGuid, amountData })
    const verifyMicrodepositResponse = {
      micro_deposit: {
        guid: 'MIC-cb50c45f-e62b-4807-bc52-58efbf524d02',
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        institution_guid: null,
        member_guid: null,
        account_type: 1,
        account_name: 'Checking ...4123',
        routing_number: '091000019',
        account_number: '4123',
        status: 3,
        status_name: 'VERIFIED',
        updated_at: 1755201311,
        deposit_expected_at: '2025-08-19T09:00:00+00:00',
        can_auto_verify: false,
        email: 'logan.rasmussen@mx.com',
        first_name: 'Logan',
        last_name: 'Rasmussen',
      },
    }
    return this._mockApiCall(verifyMicrodepositResponse.micro_deposit)
  }

  /**
   * Verify routing number
   */
  async verifyRoutingNumber(routingNumber, accountIdentificationEnabled) {
    console.log('MockDataSource.verifyRoutingNumber called with:', {
      routingNumber,
      accountIdentificationEnabled,
    })
    const routingInfoResponse = {}
    return this._mockApiCall(routingInfoResponse)
  }

  /**
   * Aggregate member
   */
  async aggregate(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.aggregate called with:', { memberGuid, config, isHuman })
    const aggregateResponse = {
      member: { job_guid: 'JOB-21104560-94cf-4e23-b655-f155c188a260', status: 6 },
    }
    return this._mockApiCall(aggregateResponse.member)
  }

  /**
   * Identity member
   */
  async identify(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.identify called with:', { memberGuid, config, isHuman })
    const identifyResponse = {}
    return this._mockApiCall(identifyResponse)
  }

  /**
   * Verify member
   */
  async verify(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.verify called with:', { memberGuid, config, isHuman })
    const verifyResponse = {
      member: { job_guid: 'JOB-30dd3b0c-afc1-46eb-b3fd-fc577ecf98a3', status: 1 },
    }
    return this._mockApiCall(verifyResponse)
  }

  /**
   * Get member rewards
   */
  async reward(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.reward called with:', { memberGuid, config, isHuman })
    const rewardResponse = {}
    return this._mockApiCall(rewardResponse)
  }

  /**
   * member order_products / combination job
   */
  async combination(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.combination called with:', { memberGuid, config, isHuman })
    const combinationResponse = {}
    return this._mockApiCall(combinationResponse)
  }

  /**
   * Load job
   */
  async loadJob(jobGuid) {
    console.log('MockDataSource.loadJob called with:', { jobGuid })

    const jobResponse = {
      job: {
        guid: 'JOB-fb90f71d-179c-4f49-99f3-c95d0697e428',
        has_processed_account_numbers: false,
        member_guid: 'MBR-b324432a-1c5e-4c0e-b1d2-c10757cf0e9c',
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        status: 6,
        error_message: null,
        is_authenticated: true,
        job_type: 0,
        async_account_data_ready: false,
        finished_at: 1755195614,
        started_at: 1755195610,
        updated_at: 1755195614,
      },
    }

    return this._mockApiCall(jobResponse.job) // wrap in object?
  }

  /**
   * Run job
   */
  runJob(jobType, memberGuid, connectConfig, isHuman) {
    let jobCall = this.aggregate.bind(this)

    if (jobType === JOB_TYPES.VERIFICATION) {
      jobCall = this.verify.bind(this)
    } else if (jobType === JOB_TYPES.REWARD) {
      jobCall = this.reward.bind(this)
      // } else if (jobType === JOB_TYPES.TAX) {
      //   jobCall = this.tax
    } else if (jobType === JOB_TYPES.IDENTIFICATION) {
      jobCall = this.identify.bind(this)
    } else if (jobType === JOB_TYPES.COMBINATION) {
      jobCall = this.combination.bind(this)
    }

    return jobCall(memberGuid, connectConfig, isHuman)
  }

  /**
   * Get institution credentials
   */
  async getInstitutionCredentials(institutionGuid) {
    console.log('MockDataSource.getInstitutionCredentials called with:', { institutionGuid })

    const institution = banks.find((bank) => bank.guid === institutionGuid)
    let credentials = []
    if (institution) {
      credentials = institution.credentials.map((credential) => credential.credential)
    }

    const credentialsResponse = {
      credentials,
    }
    return this._mockApiCall(credentialsResponse.credentials)
  }

  /**
   * Get member credentials
   */
  async getMemberCredentials(memberGuid) {
    console.log('MockDataSource.getMemberCredentials called with:', { memberGuid })
    const memberCredentialsResponse = {
      credentials: [
        {
          display_order: 1,
          field_name: 'LOGIN',
          field_type: 3,
          guid: 'CRD-ec626db1-8bde-beb8-d749-5a8b579e48e5',
          label: 'Username',
          meta_data: null,
          optional: false,
          options: null,
        },
        {
          display_order: 2,
          field_name: 'PASSWORD',
          field_type: 1,
          guid: 'CRD-bd540f58-03cf-df92-4fea-c7aa3ee4ead0',
          label: 'Password',
          meta_data: null,
          optional: false,
          options: null,
        },
      ],
    }
    return this._mockApiCall(memberCredentialsResponse.credentials)
  }

  /**
   * Get OAuth window URI
   */
  async getOAuthWindowURI(memberGuid, config) {
    console.log('MockDataSource.getOAuthWindowURI called with:', { memberGuid, config })
    const oauthWindowUriResponse = {
      guid: 'MBR-8938c5d4-91bb-442c-91f3-91d3d1228af2',
      oauth_window_uri:
        'https://banksy.kube.sand.internal.mx/oauth/authorize?client_id=QNxNCdUN5pjVdjPk1HKWRsGO2DE_EOaHutrXHZGp2KI\u0026redirect_uri=https%3A%2F%2Fapp.sand.internal.mx%2Foauth%2Fredirect_from\u0026response_type=code\u0026scope=read\u0026state=2c0a1f36361ecc88c4794a6d830b638f',
    }
    return this._mockApiCall(oauthWindowUriResponse)
  }

  /**
   * TODO: find real response
   * Update user profile
   */
  async updateUserProfile(userProfile) {
    console.log('MockDataSource.updateUserProfile called with:', { userProfile })
    const updatedProfile = {
      ...userProfile,
      updated_at: new Date().toISOString(),
    }
    return this._mockApiCall({ user_profile: updatedProfile })
  }
}
