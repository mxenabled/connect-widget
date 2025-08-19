import {
  banks,
  credentialBank,
  discoveredBank,
  manualInstitution,
  oauthBank,
} from './data/institutions'
import * as accounts from './data/accounts'
import * as members from './data/members'
import * as microdeposits from './data/microdeposits'
import * as jobs from './data/jobs'
import { JOB_TYPES } from './data/jobs'

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
    return data
  }

  /**
   * Add member
   */
  async addMember(memberData, config = {}, isHuman = false) {
    console.log('MockDataSource.addMember called with:', { memberData, config, isHuman })

    const member = members.create(memberData, config)
    const memberResponse = { member }

    console.log('MockDataSource.addMember returning:', memberResponse)
    return this._mockApiCall(memberResponse)
  }

  /**
   * Update member
   */
  async updateMember(member, connectConfig = {}, isHuman = false) {
    console.log('MockDataSource.updateMember called with:', { member, connectConfig, isHuman })

    const updatedMember = members.update(member)
    const updateMemberResponse = { member: updatedMember }

    console.log('MockDataSource.updateMember returning:', updateMemberResponse.member)
    return this._mockApiCall(updateMemberResponse.member)
  }

  /**
   * Update MFA
   */
  async updateMFA(member, connectConfig = {}, isHuman = false) {
    console.log('MockDataSource.updateMFA called with:', { member, connectConfig, isHuman })

    const updatedMember = members.update({
      ...member,
      connection_status: members.CONNECTION_STATUSES.RESUMED,
    })
    const updateMfaResponse = { member: updatedMember }

    console.log('MockDataSource.updateMFA returning:', updateMfaResponse.member)
    return this._mockApiCall(updateMfaResponse.member)
  }

  /**
   * Delete member
   */
  async deleteMember(member) {
    console.log('MockDataSource.deleteMember called with:', { member })

    members.remove(member)

    console.log('MockDataSource.deleteMember returning:', null)
    return this._mockApiCall(null)
  }

  /**
   * Load members
   */
  async loadMembers(clientLocale) {
    console.log('MockDataSource.loadMembers called with:', { clientLocale })

    const allMembers = members.get()
    setTimeout(() => {
      const loadMembersResponse = {
        members: allMembers,
      }

      console.log('MockDataSource.loadMembers returning:', loadMembersResponse.members)
      return this._mockApiCall(loadMembersResponse.members)
    }, 100) // Not sure, but this seems to work, prevents a redux dispatch error
  }

  /**
   * Load member by GUID
   */
  async loadMemberByGuid(memberGuid, clientLocale) {
    console.log('MockDataSource.loadMemberByGuid called with:', { memberGuid, clientLocale })

    let member = members.getByGuid(memberGuid)
    member = members.updateToNextConnectionStatus(member)
    const memberResponse = { member }

    console.log('MockDataSource.loadMemberByGuid returning:', { ...memberResponse.member })
    return this._mockApiCall({ ...memberResponse.member }) // ...successfulConnectionProp
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

    console.log('MockDataSource.loadOAuthStates returning:', oauthStatesResponse.oauth_states)
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
    console.log('MockDataSource.loadOAuthState returning:', oauthStateResponse.oauth_state)
    return this._mockApiCall(oauthStateResponse.oauth_state) // wrap in object?
  }

  /**
   * Create support ticket
   */
  async createSupportTicket(ticket) {
    console.log('MockDataSource.createSupportTicket called with:', { ticket })
    console.log('MockDataSource.createSupportTicket returning:', null)
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

    console.log('MockDataSource.loadInstitutions returning:', institutionsResponse)
    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Load institution by GUID
   */
  async loadInstitutionByGuid(guid) {
    console.log('MockDataSource.loadInstitutionByGuid called with:', { guid })

    try {
      // Just return the manual institution directly
      if (guid === manualInstitution.guid) {
        console.log('MockDataSource.loadInstitutionByGuid returning:', manualInstitution)
        return this._mockApiCall(manualInstitution)
      }

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
      console.log('MockDataSource.loadInstitutionByGuid returning:', updatedResponseData)
      return this._mockApiCall(updatedResponseData)
    } catch (error) {
      console.error('Error loading institution by GUID:', error)
      throw new Error('Failed to load institution')
    }
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

    // Reform the data for convenience to match current UI code expectations
    const updatedResponseData = {
      ...institutionByCodeResponse.institution,
      credentials: institutionByCodeResponse.institution.credentials.map(
        (credential) => credential.credential,
      ),
    }

    console.log('MockDataSource.loadInstitutionByCode returning:', updatedResponseData)
    return this._mockApiCall(updatedResponseData)
  }

  /**
   * Load popular institutions
   */
  async loadPopularInstitutions(query) {
    console.log('MockDataSource.loadPopularInstitutions called with:', { query })

    const institutionsResponse = [credentialBank, oauthBank]

    console.log('MockDataSource.loadPopularInstitutions returning:', institutionsResponse)
    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Load discovered institutions
   */
  async loadDiscoveredInstitutions(query) {
    console.log('MockDataSource.loadDiscoveredInstitutions called with:', { query })

    const institutionsResponse = [discoveredBank]

    console.log('MockDataSource.loadDiscoveredInstitutions returning:', institutionsResponse)
    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Create account (manual)
   */
  async createAccount(account) {
    console.log('MockDataSource.createAccount called with:', { account })

    const createdAccount = accounts.create(account)
    const createdAccountResponse = {
      account: createdAccount,
    }

    console.log('MockDataSource.createAccount returning:', createdAccountResponse.account)
    return this._mockApiCall(createdAccountResponse.account)
  }

  /**
   * Create microdeposit
   */
  async createMicrodeposit(microdeposit) {
    console.log('MockDataSource.createMicrodeposit called with:', { microdeposit })

    const createdMicrodeposit = microdeposits.create(microdeposit)
    const createdMicrodepositResponse = {
      micro_deposit: createdMicrodeposit,
    }

    console.log('MockDataSource.createMicrodeposit returning:', createdMicrodepositResponse)
    return this._mockApiCall(createdMicrodepositResponse)
  }

  /**
   * Load microdeposit by GUID
   */
  async loadMicrodepositByGuid(microdepositGuid) {
    console.log('MockDataSource.loadMicrodepositByGuid called with:', { microdepositGuid })

    const microdeposit = microdeposits.getByGuid(microdepositGuid)
    const microdepositResponse = { micro_deposit: microdeposit }

    console.log(
      'MockDataSource.loadMicrodepositByGuid returning:',
      microdepositResponse.micro_deposit,
    )
    return this._mockApiCall(microdepositResponse.micro_deposit)
  }

  /**
   * Update microdeposit
   */
  async updateMicrodeposit(microdepositGuid, updatedData) {
    console.log('MockDataSource.updateMicrodeposit called with:', { microdepositGuid, updatedData })

    const updatedMicrodeposit = microdeposits.update(microdepositGuid, updatedData)
    const microdepositResponse = {
      micro_deposit: updatedMicrodeposit,
    }

    console.log('MockDataSource.updateMicrodeposit returning:', microdepositResponse)
    return this._mockApiCall(microdepositResponse)
  }

  /**
   * Refresh microdeposit status
   */
  async refreshMicrodepositStatus(microdepositGuid) {
    console.log('MockDataSource.refreshMicrodepositStatus called with:', { microdepositGuid })

    const microdeposit = microdeposits.getByGuid(microdepositGuid)
    const microdepositResponse = { micro_deposit: microdeposit }

    console.log('MockDataSource.refreshMicrodepositStatus returning:', microdepositResponse)
    return this._mockApiCall(microdepositResponse)
  }

  /**
   * Verify microdeposit
   */
  async verifyMicrodeposit(microdepositGuid, amountData) {
    console.log('MockDataSource.verifyMicrodeposit called with:', { microdepositGuid, amountData })

    let microdeposit = microdeposits.getByGuid(microdepositGuid)
    microdeposit = microdeposits.update(microdepositGuid, {
      status: microdeposits.MicrodepositsStatuses.VERIFIED,
    })

    const verifyMicrodepositResponse = {
      micro_deposit: microdeposit,
    }

    console.log(
      'MockDataSource.verifyMicrodeposit returning:',
      verifyMicrodepositResponse.micro_deposit,
    )
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

    console.log('MockDataSource.verifyRoutingNumber returning:', routingInfoResponse)
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

    console.log('MockDataSource.aggregate returning:', aggregateResponse.member)
    return this._mockApiCall(aggregateResponse.member)
  }

  /**
   * Identity member
   */
  async identify(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.identify called with:', { memberGuid, config, isHuman })

    const identifyResponse = {}

    console.log('MockDataSource.identify returning:', identifyResponse)
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

    console.log('MockDataSource.verify returning:', verifyResponse)
    return this._mockApiCall(verifyResponse)
  }

  /**
   * Get member rewards
   */
  async reward(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.reward called with:', { memberGuid, config, isHuman })

    const rewardResponse = {}

    console.log('MockDataSource.reward returning:', rewardResponse)
    return this._mockApiCall(rewardResponse)
  }

  /**
   * member order_products / combination job
   */
  async combination(memberGuid, config = {}, isHuman = false) {
    console.log('MockDataSource.combination called with:', { memberGuid, config, isHuman })

    const combinationResponse = {}

    console.log('MockDataSource.combination returning:', combinationResponse)
    return this._mockApiCall(combinationResponse)
  }

  /**
   * Load job
   */
  async loadJob(jobGuid) {
    console.log('MockDataSource.loadJob called with:', { jobGuid })

    const job = jobs.findByGuid(jobGuid)
    const jobResponse = {
      job: {
        ...job,
        status: 6, // simulate finishing the job
      },
    }

    console.log('MockDataSource.loadJob returning:', jobResponse.job)
    return this._mockApiCall(jobResponse.job)
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

    jobs.createJob({
      member_guid: memberGuid,
      job_type: jobType,
    })

    members.update({ guid: memberGuid, is_being_aggregated: true })

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

    console.log(
      'MockDataSource.getInstitutionCredentials returning:',
      credentialsResponse.credentials,
    )
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

    console.log(
      'MockDataSource.getMemberCredentials returning:',
      memberCredentialsResponse.credentials,
    )
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

    console.log('MockDataSource.getOAuthWindowURI returning:', oauthWindowUriResponse)
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

    console.log('MockDataSource.updateUserProfile returning:', { user_profile: updatedProfile })
    return this._mockApiCall({ user_profile: updatedProfile })
  }
}
