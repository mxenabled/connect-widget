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

    const oauthMemberResponse = {
      member: {
        aggregation_status: null,
        connection_status: 21,
        guid: 'MBR-bae9bcbf-9825-4305-b62f-9aebe5d2f597',
        institution_guid: 'INS-57db361e-a9d1-45e0-87e4-b67a968a15a0',
        institution_name: null,
        institution_url: 'https://banksy.kube.sand.internal.mx/',
        instructional_data: null,
        is_being_aggregated: false,
        is_manual: false,
        is_managed_by_user: true,
        is_oauth: true,
        last_job_guid: null,
        last_job_status: null,
        last_update_time: null,
        metadata: null,
        mfa: {},
        most_recent_job_detail_code: null,
        most_recent_job_guid: null,
        needs_updated_credentials: false,
        name: 'MXCU (OAuth)',
        process_status: null,
        revision: 1,
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        use_cases: ['MONEY_MOVEMENT'],
        oauth_window_uri:
          'https://banksy.kube.sand.internal.mx/oauth/authorize?client_id=QNxNCdUN5pjVdjPk1HKWRsGO2DE_EOaHutrXHZGp2KI&redirect_uri=https%3A%2F%2Fapp.sand.internal.mx%2Foauth%2Fredirect_from&response_type=code&scope=read&state=a6a1d3556d3b485d36e4c0fe9e11f9b7',
        verification_is_enabled: true,
        tax_statement_is_enabled: false,
        successfully_aggregated_at: null,
      },
    }

    return this._mockApiCall(oauthMemberResponse)
  }

  /**
   * Update member
   */
  async updateMember(member, connectConfig = {}, isHuman = false) {
    console.log('MockDataSource.updateMember called with:', { member, connectConfig, isHuman })

    const updateMemberResponse = {
      member: {
        aggregation_status: 6,
        connection_status: 15,
        guid: 'MBR-9e76f1e0-e3d8-4b87-b0f3-5a6038ba76f9',
        institution_guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
        institution_name: null,
        institution_url: 'https://gringotts.sand.internal.mx',
        instructional_data: {
          title: null,
          description:
            'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
          steps: [
            'First the most important thing that you need to do is this thing that is right here in the link <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'The second most important thing is to do all the things <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'And you really should be doing this thing :) Thank you!!! <a href="https://google.com" id="instructional_text">My Test Link</a>',
          ],
        },
        is_being_aggregated: false,
        is_manual: false,
        is_managed_by_user: true,
        is_oauth: false,
        last_job_guid: 'JOB-95f70b02-9b39-4b5d-af31-3a1c4634f167',
        last_job_status: null,
        last_update_time: null,
        metadata: null,
        mfa: {},
        most_recent_job_detail_code: null,
        most_recent_job_guid: 'JOB-95f70b02-9b39-4b5d-af31-3a1c4634f167',
        needs_updated_credentials: false,
        name: 'Gringotts',
        process_status: null,
        revision: 9,
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        use_cases: ['MONEY_MOVEMENT', 'PFM'],
        oauth_window_uri: null,
        verification_is_enabled: true,
        tax_statement_is_enabled: false,
        successfully_aggregated_at: 1755198142,
      },
    }
    return this._mockApiCall(updateMemberResponse.member)
  }

  /**
   * Update MFA
   */
  async updateMFA(member, connectConfig = {}, isHuman = false) {
    console.log('MockDataSource.updateMFA called with:', { member, connectConfig, isHuman })

    const updateMfaResponse = {
      member: {
        aggregation_status: 1,
        connection_status: 18,
        guid: 'MBR-9e76f1e0-e3d8-4b87-b0f3-5a6038ba76f9',
        institution_guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
        institution_name: null,
        institution_url: 'https://gringotts.sand.internal.mx',
        instructional_data: {
          title: null,
          description:
            'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
          steps: [
            'First the most important thing that you need to do is this thing that is right here in the link <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'The second most important thing is to do all the things <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'And you really should be doing this thing :) Thank you!!! <a href="https://google.com" id="instructional_text">My Test Link</a>',
          ],
        },
        is_being_aggregated: true,
        is_manual: false,
        is_managed_by_user: true,
        is_oauth: false,
        last_job_guid: 'JOB-c92c60d6-97f7-449a-8736-09e2780d0b30',
        last_job_status: null,
        last_update_time: null,
        metadata: null,
        mfa: {},
        most_recent_job_detail_code: null,
        most_recent_job_guid: 'JOB-c92c60d6-97f7-449a-8736-09e2780d0b30',
        needs_updated_credentials: false,
        name: 'Gringotts',
        process_status: null,
        revision: 16,
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        use_cases: ['MONEY_MOVEMENT', 'PFM'],
        oauth_window_uri: null,
        verification_is_enabled: true,
        tax_statement_is_enabled: false,
        successfully_aggregated_at: 1755198230,
      },
    }
    return this._mockApiCall(updateMfaResponse.member)
  }

  /**
   * Delete member
   */
  async deleteMember(member) {
    console.log('MockDataSource.deleteMember called with:', { member })
    return this._mockApiCall(null)
  }

  /**
   * Load members
   */
  async loadMembers(clientLocale) {
    console.log('MockDataSource.loadMembers called with:', { clientLocale })

    const loadMembersResponse = {
      members: [
        {
          aggregation_status: null,
          connection_status: null,
          guid: 'MBR-4cda47bd-6f8f-4bc0-b90d-4717b1ad866c',
          institution_guid: 'INS-MANUAL-cb5c-1d48-741c-b30f4ddd1730',
          institution_name: null,
          institution_url: 'none',
          instructional_data: null,
          is_being_aggregated: false,
          is_manual: true,
          is_managed_by_user: true,
          is_oauth: false,
          last_job_guid: null,
          last_job_status: null,
          last_update_time: null,
          metadata: null,
          mfa: {},
          most_recent_job_detail_code: null,
          most_recent_job_guid: null,
          needs_updated_credentials: false,
          name: 'Manual Institution',
          process_status: null,
          revision: 1,
          user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
          use_cases: ['PFM'],
          oauth_window_uri: null,
          verification_is_enabled: false,
          tax_statement_is_enabled: false,
          successfully_aggregated_at: null,
        },
        {
          aggregation_status: 6,
          connection_status: 6,
          guid: 'MBR-b324432a-1c5e-4c0e-b1d2-c10757cf0e9c',
          institution_guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
          institution_name: null,
          institution_url: 'https://gringotts.sand.internal.mx',
          instructional_data: {
            title: null,
            description:
              'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
            steps: [
              'First the most important thing that you need to do is this thing that is right here in the link <a href="https://google.com" id="instructional_text">My Test Link</a>',
              'The second most important thing is to do all the things <a href="https://google.com" id="instructional_text">My Test Link</a>',
              'And you really should be doing this thing :) Thank you!!! <a href="https://google.com" id="instructional_text">My Test Link</a>',
            ],
          },
          is_being_aggregated: false,
          is_manual: false,
          is_managed_by_user: true,
          is_oauth: false,
          last_job_guid: 'JOB-fb90f71d-179c-4f49-99f3-c95d0697e428',
          last_job_status: null,
          last_update_time: null,
          metadata: null,
          mfa: {},
          most_recent_job_detail_code: null,
          most_recent_job_guid: 'JOB-fb90f71d-179c-4f49-99f3-c95d0697e428',
          needs_updated_credentials: false,
          name: 'Gringotts',
          process_status: null,
          revision: 22,
          user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
          use_cases: ['PFM'],
          oauth_window_uri: null,
          verification_is_enabled: true,
          tax_statement_is_enabled: false,
          successfully_aggregated_at: 1755195614,
        },
        {
          aggregation_status: 6,
          connection_status: 6,
          guid: 'MBR-9e76f1e0-e3d8-4b87-b0f3-5a6038ba76f9',
          institution_guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
          institution_name: null,
          institution_url: 'https://gringotts.sand.internal.mx',
          instructional_data: {
            title: null,
            description:
              'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
            steps: [
              'First the most important thing that you need to do is this thing that is right here in the link <a href="https://google.com" id="instructional_text">My Test Link</a>',
              'The second most important thing is to do all the things <a href="https://google.com" id="instructional_text">My Test Link</a>',
              'And you really should be doing this thing :) Thank you!!! <a href="https://google.com" id="instructional_text">My Test Link</a>',
            ],
          },
          is_being_aggregated: false,
          is_manual: false,
          is_managed_by_user: true,
          is_oauth: false,
          last_job_guid: 'JOB-95f70b02-9b39-4b5d-af31-3a1c4634f167',
          last_job_status: null,
          last_update_time: null,
          metadata: null,
          mfa: {},
          most_recent_job_detail_code: null,
          most_recent_job_guid: 'JOB-95f70b02-9b39-4b5d-af31-3a1c4634f167',
          needs_updated_credentials: false,
          name: 'Gringotts',
          process_status: null,
          revision: 8,
          user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
          use_cases: ['PFM'],
          oauth_window_uri: null,
          verification_is_enabled: true,
          tax_statement_is_enabled: false,
          successfully_aggregated_at: 1755198142,
        },
      ],
    }
    return this._mockApiCall(loadMembersResponse.members)
  }

  /**
   * Load member by GUID
   */
  async loadMemberByGuid(memberGuid, clientLocale) {
    console.log('MockDataSource.loadMemberByGuid called with:', { memberGuid, clientLocale })

    const memberResponse = {
      member: {
        aggregation_status: 6,
        connection_status: 6,
        guid: 'MBR-b324432a-1c5e-4c0e-b1d2-c10757cf0e9c',
        institution_guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
        institution_name: null,
        institution_url: 'https://gringotts.sand.internal.mx',
        instructional_data: {
          title: null,
          description:
            'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
          steps: [
            'First the most important thing that you need to do is this thing that is right here in the link <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'The second most important thing is to do all the things <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'And you really should be doing this thing :) Thank you!!! <a href="https://google.com" id="instructional_text">My Test Link</a>',
          ],
        },
        is_being_aggregated: false,
        is_manual: false,
        is_managed_by_user: true,
        is_oauth: false,
        last_job_guid: 'JOB-fb90f71d-179c-4f49-99f3-c95d0697e428',
        last_job_status: null,
        last_update_time: null,
        metadata: null,
        mfa: {},
        most_recent_job_detail_code: null,
        most_recent_job_guid: 'JOB-fb90f71d-179c-4f49-99f3-c95d0697e428',
        needs_updated_credentials: false,
        name: 'Gringotts',
        process_status: null,
        revision: 22,
        user_guid: 'USR-810d4e82-750f-4c2a-a194-8c9b2897c629',
        use_cases: ['PFM'],
        oauth_window_uri: null,
        verification_is_enabled: true,
        tax_statement_is_enabled: false,
        successfully_aggregated_at: 1755195614,
      },
    }
    return this._mockApiCall(memberResponse.member) // wrap in object?
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
    const institutionsResponse = [
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'gringotts',
        guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Gringotts',
        popularity: 14574,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://gringotts.sand.internal.mx',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'db89d19e-f8ec-4720-8bae-2a0d413cae04',
        guid: 'INS-4aa33e67-610e-4198-8e89-06bfe89f75be',
        is_disabled_by_client: false,
        login_url: 'https://mx.com',
        name: 'My Fake Bank',
        popularity: 5016,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://myfakebank.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'cb10e1e1-5ef6-41d2-808f-bf796c6706c8',
        guid: 'INS-abe527d2-0c4b-4535-a1bf-a75fde3ef2e1',
        is_disabled_by_client: false,
        login_url: 'https://sophtron.com',
        name: 'Sophtron Bank NoMFA',
        popularity: 46,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://sophtron.com',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: '146453c7-984b-4348-8cdd-ccc74eb042c2',
        guid: 'INS-c31f26ff-add9-4992-b844-b2b51067e5fa',
        is_disabled_by_client: false,
        login_url: 'https://sophtron.com',
        name: 'Sophtron Bank Token',
        popularity: 6,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://sophtron.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'c05c2843-c513-4c2b-a3ac-d0b4e907a9a7',
        guid: 'INS-0531cc0b-17b7-4531-95e5-f185aac8ee32',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Chime Bank',
        popularity: 4,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://www.chimebank.com',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: 'ae8cb2d2-8f04-487d-ae7e-06790990cb2f',
        guid: 'INS-054fa8bb-1e3a-4914-8fe3-d4c0ae288c5f',
        is_disabled_by_client: false,
        login_url: 'https://sophtron.com',
        name: 'Sophtron Bank Captcha',
        popularity: 3,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://sophtron.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: '04714bd7-e45f-4ed7-acff-79473548fac0',
        guid: 'INS-47196026-3cd0-4988-8017-a8f5714e8c78',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Current Bank',
        popularity: 2,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'http://current_bank.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'c0fda359-db35-4821-aefa-2babb6d77611',
        guid: 'INS-09fec48d-a02e-492b-b465-913c3e19cda7',
        is_disabled_by_client: false,
        login_url: 'https://sophtron.com',
        name: 'Sophtron Bank SecurityQuestion',
        popularity: 2,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://sophtron.com',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: 'my_fake_bank',
        guid: 'INS-9d6d5600-84c9-4a8d-a8c6-9b9f3ebf6925',
        is_disabled_by_client: false,
        login_url: 'https://integration.myfakebank.com/users/sign_in',
        name: 'My Fake Bank',
        popularity: 2,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://integration.myfakebank.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: '1c370ab8-6c50-460e-885e-baf55d7a2fc0',
        guid: 'INS-d4f99f6c-60a7-449b-9d27-e027c2b9d794',
        is_disabled_by_client: false,
        login_url: null,
        name: 'GY_bank_3',
        popularity: 1,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://jfuspckdur.s.unit.sh',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'a9afb74e-6340-4dca-b92a-f0375fba04ad',
        guid: 'INS-53648f2b-857f-40eb-b288-a45d302819f2',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Lili Bank',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'www.lili_bank.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'b1dac9a9-294a-45d8-a407-79d8a32244ed',
        guid: 'INS-22d29f16-024c-4321-b997-8979d5e20ab2',
        is_disabled_by_client: false,
        login_url: null,
        name: 'GY_Money_Bank',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://mx.com',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: '7133b3e3-6ca0-4cbd-94be-63c70f799f82',
        guid: 'INS-71d04e71-f8df-4100-a993-ed9ff5f96649',
        is_disabled_by_client: false,
        login_url: 'https://sophtron.com',
        name: 'Sophtron Bank TokenRead',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://sophtron.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'f002ed8d-f0ba-4edb-bedc-4e4d3e115611',
        guid: 'INS-a2187217-8e42-4bf5-9bec-976768363ae1',
        is_disabled_by_client: false,
        login_url: 'https://sophtron.com',
        name: 'Sophtron Bank SecurityQuestion Multiple',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://sophtron.com',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: '39deb8d1-dcfb-423b-8f6d-535753b2fc0a',
        guid: 'INS-41780430-3b52-4522-b0cd-ffa95580c81d',
        is_disabled_by_client: false,
        login_url: 'https://test.com',
        name: 'First Hawaiian Bank',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://www.fhb.com',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: '75188',
        guid: 'INS-9708e158-5e03-f884-842c-687edddeff34',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Wellsville Bank',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://cm.netteller.com/login2008/Authentication/Views/Login.aspx?fi=wellsvillebank&bn=bed33a577c5debe5&burlid=669854cef863fdbb',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: '242d3587-955f-4673-bf18-6db5a0960a49',
        guid: 'INS-44f4e93b-aada-4b27-84d7-8f68ddd8abea',
        is_disabled_by_client: false,
        login_url: 'https://mx.com',
        name: 'TriCentury Bank - Business',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://web15.secureinternetbank.com/EBC_EBC1151/login/101106942',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: '1ad5de02-ecb1-4365-a113-b05aa1b7b6c7',
        guid: 'INS-ab913d5a-35fe-4d7e-a369-5baad352117b',
        is_disabled_by_client: false,
        login_url: 'https://web15.secureinternetbank.com/PBI_PBI1151/login/101106942',
        name: 'TriCentury Bank - Personal',
        popularity: 0,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://web15.secureinternetbank.com/PBI_PBI1151/login/101106942',
      },
    ]

    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Load institution by GUID
   */
  async loadInstitutionByGuid(guid) {
    console.log('MockDataSource.loadInstitutionByGuid called with:', { guid })
    const institutionByGuidResponse = {
      institution: {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'gringotts',
        forgot_password_credential_recovery_url: 'https://mx.com/forgot_password',
        forgot_username_credential_recovery_url: 'https://www.mx.com/forgot_username',
        guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
        instructional_text:
          'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
        instructional_data: {
          title: null,
          description:
            'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
          steps: [
            'First the most important thing that you need to do is this thing that is right here in the link <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'The second most important thing is to do all the things <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'And you really should be doing this thing :) Thank you!!! <a href="https://google.com" id="instructional_text">My Test Link</a>',
          ],
        },
        is_disabled_by_client: false,
        login_url: null,
        name: 'Gringotts',
        popularity: 14574,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        trouble_signing_credential_recovery_url: 'https://mx.com/help_me_sign_in',
        url: 'https://gringotts.sand.internal.mx',
        credentials: [
          {
            credential: {
              display_order: 1,
              field_name: 'LOGIN',
              field_type: 3,
              guid: 'CRD-ec626db1-8bde-beb8-d749-5a8b579e48e5',
              label: 'Username',
              meta_data: null,
              optional: false,
              options: null,
            },
          },
          {
            credential: {
              display_order: 2,
              field_name: 'PASSWORD',
              field_type: 1,
              guid: 'CRD-bd540f58-03cf-df92-4fea-c7aa3ee4ead0',
              label: 'Password',
              meta_data: null,
              optional: false,
              options: null,
            },
          },
        ],
      },
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
    const institutionByGuidResponse = {
      institution: {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'gringotts',
        forgot_password_credential_recovery_url: 'https://mx.com/forgot_password',
        forgot_username_credential_recovery_url: 'https://www.mx.com/forgot_username',
        guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
        instructional_text:
          'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
        instructional_data: {
          title: null,
          description:
            'Please do all these things <a href="https://google.com" id="instructional_text">My Test Link</a>',
          steps: [
            'First the most important thing that you need to do is this thing that is right here in the link <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'The second most important thing is to do all the things <a href="https://google.com" id="instructional_text">My Test Link</a>',
            'And you really should be doing this thing :) Thank you!!! <a href="https://google.com" id="instructional_text">My Test Link</a>',
          ],
        },
        is_disabled_by_client: false,
        login_url: null,
        name: 'Gringotts',
        popularity: 14574,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        trouble_signing_credential_recovery_url: 'https://mx.com/help_me_sign_in',
        url: 'https://gringotts.sand.internal.mx',
        credentials: [
          {
            credential: {
              display_order: 1,
              field_name: 'LOGIN',
              field_type: 3,
              guid: 'CRD-ec626db1-8bde-beb8-d749-5a8b579e48e5',
              label: 'Username',
              meta_data: null,
              optional: false,
              options: null,
            },
          },
          {
            credential: {
              display_order: 2,
              field_name: 'PASSWORD',
              field_type: 1,
              guid: 'CRD-bd540f58-03cf-df92-4fea-c7aa3ee4ead0',
              label: 'Password',
              meta_data: null,
              optional: false,
              options: null,
            },
          },
        ],
      },
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
   * Load popular institutions
   */
  async loadPopularInstitutions(query) {
    console.log('MockDataSource.loadPopularInstitutions called with:', { query })
    const institutionsResponse = [
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'chase',
        guid: 'INS-b3055788-7117-4cd8-11aa-2682991488fe',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Chase QA7',
        popularity: 17,
        supports_oauth: true,
        tax_statement_is_enabled: false,
        url: 'https://www.chase.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'gringotts',
        guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Gringotts',
        popularity: 14574,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://gringotts.sand.internal.mx',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: true,
        code: '77277',
        guid: 'INS-22cac61a-22d8-29bd-9464-c08fe9ab8605',
        is_disabled_by_client: false,
        login_url: 'https://www.americanexpress.com/en-us/account/login/',
        name: 'American Express Credit Card',
        popularity: 20,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'www.americanexpress.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: '78015',
        guid: 'INS-f9e8d5f6-b953-da63-32e4-6e88fbe8b250',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Wells Fargo',
        popularity: 30,
        supports_oauth: true,
        tax_statement_is_enabled: false,
        url: 'https://www.wellsfargo.com/',
      },
      {
        account_verification_is_enabled: false,
        account_identification_is_enabled: false,
        code: '78033',
        guid: 'INS-b233fb01-8f8d-e571-aabf-832ee929810d',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Discover Credit Card',
        popularity: 1,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'http://www.discovercard.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: '1d303f53-a9c2-4819-9469-9320b561280b',
        guid: 'INS-61bc1dbc-3579-4fc6-81ee-abf39e6c2bd6',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Capital One',
        popularity: 9,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://www.capitalone.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'bc929528-ae71-48f5-9f94-8658825378d2',
        guid: 'INS-45243427-c34b-443c-b1e6-48cb4a2c350f',
        is_disabled_by_client: false,
        login_url: null,
        name: 'Gringotts - Internal - Test',
        popularity: 28,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://gringotts.sand.internal.mx/',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'db89d19e-f8ec-4720-8bae-2a0d413cae04',
        guid: 'INS-4aa33e67-610e-4198-8e89-06bfe89f75be',
        is_disabled_by_client: false,
        login_url: 'https://mx.com',
        name: 'My Fake Bank',
        popularity: 5016,
        supports_oauth: false,
        tax_statement_is_enabled: false,
        url: 'https://myfakebank.com',
      },
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'mxcu_oauth',
        guid: 'INS-57db361e-a9d1-45e0-87e4-b67a968a15a0',
        is_disabled_by_client: false,
        login_url: null,
        name: 'MXCU (OAuth)',
        popularity: 1000000000,
        supports_oauth: true,
        tax_statement_is_enabled: false,
        url: 'https://banksy.kube.sand.internal.mx/',
      },
    ]
    return this._mockApiCall(institutionsResponse)
  }

  /**
   * Load discovered institutions
   */
  async loadDiscoveredInstitutions(query) {
    console.log('MockDataSource.loadDiscoveredInstitutions called with:', { query })
    const institutionsResponse = [
      {
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        code: 'mxcu_oauth',
        guid: 'INS-57db361e-a9d1-45e0-87e4-b67a968a15a0',
        is_disabled_by_client: false,
        login_url: null,
        name: 'MXCU (OAuth)',
        popularity: 1000000000,
        supports_oauth: true,
        tax_statement_is_enabled: false,
        url: 'https://banksy.kube.sand.internal.mx/',
      },
    ]
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
    const credentialsResponse = {
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
