import { http, HttpResponse } from 'msw'
import { server } from 'src/services/testServer'
import { ApiEndpoints, buildQueryParameter, buildQueryString } from 'src/services/FireflyDataSource'
import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'
import { JOB_TYPES } from 'src/const/consts'
import connectAPI from 'src/services/api'
import {
  ACCOUNT_DATA,
  ANALYTICS_SESSION,
  JOB_DATA,
  MFA_MEMBER,
  MICRODEPOSIT,
  NEW_MEMBER,
  OAUTH_STATE,
  institutionCredentialsData,
  institutionData,
  masterData,
  memberCredentialsData,
} from 'src/services/mockedData'
import { generateEncodedUrl } from 'src/services/testServerHandlers'

describe('FireflyDataSource.loadMaster', () => {
  it('should call the correct URL', async () => {
    expect(await connectAPI.loadMaster()).toEqual(masterData)
  })
})

describe('FireflyDataSource.extendSession', () => {
  it('should call the correct URL with the request', async () => {
    expect(await connectAPI.extendSession()).toEqual(null)
  })
})

describe('FireflyDataSource.logout', () => {
  it('should call the correct URL with the request', async () => {
    expect(await connectAPI.logout()).toEqual(null)
  })
})

describe('FireflyDataSource.instrumentation', () => {
  const configOptions = {
    message: 'sdk-info',
    instrumentation: {
      sdk: 'web',
      version: 'v1.0.0',
    },
  }
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.instrumentation(configOptions)).toEqual(null)
  })
})

describe('FireflyDataSource.addMember', () => {
  const request = { foo: 'bar', is_oauth: true }

  it('should call the correct URL with the request', async () => {
    expect(await connectAPI.addMember({})).toEqual({
      member: { ...NEW_MEMBER, oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri) },
    })
  })

  it('should take client_redirect_url into account', async () => {
    const connectConfig = { client_redirect_url: 'https://test.com/test/path' }

    expect(await connectAPI.addMember({}, connectConfig)).toEqual({
      member: {
        ...NEW_MEMBER,
        oauth_window_uri: generateEncodedUrl(
          NEW_MEMBER.oauth_window_uri,
          connectConfig.client_redirect_url,
        ),
      },
    })
  })

  it('should take enable_app2app into account', async () => {
    const connectConfig = { enable_app2app: true }

    expect(await connectAPI.addMember(request, connectConfig)).toEqual({
      member: {
        ...NEW_MEMBER,
        enable_app2app: true,
        oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
      },
    })
  })

  describe('.addMember Background Aggregation', () => {
    it('enables background aggregation by default, when NOT in VERIFY MODE', async () => {
      const connectConfig = {}

      expect(await connectAPI.addMember(request, connectConfig)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
        },
      })
    })

    it('disables background aggregation by default in VERIFY_MODE', async () => {
      // Providing VERIFY_MODE, and not specifying a value for `disable_background_agg`
      // will have background agg disabled by default
      const connectConfig = { mode: VERIFY_MODE }

      expect(await connectAPI.addMember(request, connectConfig)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
          background_aggregation_is_disabled: true,
        },
      })
    })

    it('should take disable_background_agg boolean of true into account', async () => {
      const connectConfig = { disable_background_agg: true }

      expect(await connectAPI.addMember(request, connectConfig)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
          background_aggregation_is_disabled: true,
        },
      })
    })

    it('should take disable_background_agg boolean false into account', async () => {
      const connectConfig = { disable_background_agg: false }

      expect(await connectAPI.addMember(request, connectConfig)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
          background_aggregation_is_disabled: false,
        },
      })
    })

    // A little more edge case... if something like a string is passed in
    it('should take a "truthy" disable_background_agg value into account', async () => {
      const connectConfig = { disable_background_agg: 'false' }

      expect(await connectAPI.addMember(request, connectConfig)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
          background_aggregation_is_disabled: true,
        },
      })
    })

    it('should take a "falsy" disable_background_agg value into account', async () => {
      const connectConfig = { disable_background_agg: '' }

      expect(await connectAPI.addMember(request, connectConfig)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
          background_aggregation_is_disabled: false,
        },
      })
    })

    it('if null is provided for disable_background_agg value, the mode will determine the value', async () => {
      // Aggregation Mode defaults to enabled background aggregation
      const connectConfig = { disable_background_agg: null, mode: AGG_MODE }

      expect(await connectAPI.addMember(request, connectConfig)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
          background_aggregation_is_disabled: false,
        },
      })

      // Verification Mode defaults to disabled background aggregation
      const config = { disable_background_agg: null, mode: VERIFY_MODE }

      expect(await connectAPI.addMember(request, config)).toEqual({
        member: {
          ...NEW_MEMBER,
          oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
          background_aggregation_is_disabled: true,
        },
      })
    })
  })
})

describe('.updateMember', () => {
  it('should call the correct URL with proper arguments', async () => {
    const updatedMember = { ...NEW_MEMBER, guid: '123' }

    expect(await connectAPI.updateMember(updatedMember, {})).toEqual({
      ...updatedMember,
      oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
      include_transactions: null,
      skip_aggregation: true,
    })
  })
})

describe('.deleteMember', () => {
  it('should call the correct URL', async () => {
    expect(await connectAPI.deleteMember({ guid: 'MBR123' })).toEqual(null)
  })
})

describe('FireflyDataSource.loadMembers', () => {
  beforeEach(() => {
    server.use(
      http.get(ApiEndpoints.MEMBERS, () => {
        return HttpResponse.json({ members: [NEW_MEMBER] })
      }),
    )
  })
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadMembers()).toEqual([NEW_MEMBER])
  })
})

describe('FireflyDataSource.loadMemberByGuid', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadMemberByGuid('MBR-123')).toEqual(MFA_MEMBER)
  })
})

describe('FireflyDataSource.loadOAuthStates', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadOAuthStates()).toEqual([
      {
        guid: 'OAS-123',
        auth_status: 1,
        error_reason: null,
        first_retrieved_at: null,
        inbound_member_guid: null,
        outbound_member_guid: 'MBR-123',
        user_guid: 'USR-123',
      },
    ])
  })

  it('should call the correct URL with proper arguments with query', async () => {
    expect(
      await connectAPI.loadOAuthStates({ outbound_member_guid: 'MBR-1', auth_status: 1 }),
    ).toEqual([
      {
        auth_status: 1,
        error_reason: null,
        first_retrieved_at: null,
        guid: 'OAS-123',
        inbound_member_guid: null,
        outbound_member_guid: 'MBR-123',
        user_guid: 'USR-123',
      },
    ])
  })
})

describe('FireflyDataSource.loadOauthState', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadOAuthState('OAS-123')).toEqual(OAUTH_STATE.oauth_state)
  })
})

describe('FireflyDataSource.submitConnectFeedback', () => {
  const feedback = { rating: '4', comments: 'test comments', source: '6' }

  it('should call the correct URL with the feedback', async () => {
    expect(await connectAPI.submitConnectFeedback(feedback)).toEqual({
      connect_feedback: {
        ...feedback,
        client_guid: 'CLT-9e20ea82-0beb-43ac-ac34-eb3756a41509',
        guid: 'CFB-123',
        user_guid: 'USR-123',
      },
    })
  })
})

describe('FireflyDataSource.createSupportTicket', () => {
  const ticket = { email: 'first.last@mx.com', message: 'test message', title: 'test title' }

  it('should call the correct URL with the ticket', async () => {
    expect(await connectAPI.createSupportTicket(ticket)).toEqual(null)
  })
})

describe('FireflyDataSource.getInstitutionCredentials', () => {
  it('creates get URL with institution guid', async () => {
    expect(await connectAPI.getInstitutionCredentials('INS-1234')).toEqual(
      institutionCredentialsData.credentials,
    )
  })
})

describe('FireflyDataSource.getMemberCredentials', () => {
  it('creates get URL with member guid', async () => {
    expect(await connectAPI.getMemberCredentials('MBR-1234')).toEqual(
      memberCredentialsData.credentials,
    )
  })
})

describe('Create Microdeposit', () => {
  it('should call the correct URL with proper arguments', async () => {
    const microdeposit = {
      accountDetails: {
        account_number: '****1234',
        account_type: 'CHECKING',
        routing_number: '123456789',
      },
      user_guid: 'USR-123',
    }

    expect(await connectAPI.createMicrodeposit(microdeposit)).toEqual(MICRODEPOSIT)
  })
})

describe('Update Microdeposit', () => {
  const microdepositGuid = 'MIC-123'
  const updatedData = {
    account_name: 'test-account',
    account_number: '1234567890',
    account_type: 'SAVINGS',
    routing_number: '999999999',
    user_guid: 'USR-123',
  }
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.updateMicrodeposit(microdepositGuid, updatedData)).toEqual({
      micro_deposit: {
        ...MICRODEPOSIT,
        ...updatedData,
      },
    })
  })
})

describe('loadMicrodepositByGuid', () => {
  const microdepositGuid = 'MIC-123'

  it('should create a get URL with microdepsitGuid', async () => {
    expect(await connectAPI.loadMicrodepositByGuid(microdepositGuid)).toEqual(MICRODEPOSIT)
  })
})

describe('refreshMicrodepositStatus', () => {
  const microdepositGuid = 'MIC-123'

  it('should create a get URL with microdepositGuid', async () => {
    expect(await connectAPI.refreshMicrodepositStatus(microdepositGuid)).toEqual({
      micro_deposit: MICRODEPOSIT,
    })
  })
})

describe('verifyMicrodeposit', () => {
  const microdepositGuid = 'MIC-123'
  const amountData = { deposit_amount_1: '0.01', deposit_amount_2: '0.05' }

  it('should create a URL with microdeposit guid and amount data', async () => {
    expect(await connectAPI.verifyMicrodeposit(microdepositGuid, amountData)).toEqual({
      micro_deposit: MICRODEPOSIT,
    })
  })
})

describe('verifyRoutingNumber', () => {
  const routingNumber = '123456789'

  it('should create a get URL with routing number', async () => {
    expect(await connectAPI.verifyRoutingNumber(routingNumber, false)).toEqual({
      blocked_routing_number: {
        guid: null,
        reason: 3,
        reason_name: 'IAV_PREFERRED',
      },
    })
  })
})

describe('FireflyDataSource.aggregate', () => {
  it('should call the correct URL', async () => {
    expect(await connectAPI.aggregate('MBR-123')).toEqual({ member: MFA_MEMBER })
  })

  it('should call aggregate', async () => {
    const connectConfig = { include_transactions: true }

    expect(await connectAPI.aggregate('MBR123', connectConfig, null)).toEqual({
      member: MFA_MEMBER,
    })
  })
})

describe('FireflyDataSource.loadJob', () => {
  const jobGuid = 'JOB-123'

  it('should call the correct URL', async () => {
    expect(await connectAPI.loadJob(jobGuid)).toEqual(JOB_DATA)
  })
})

describe('FireflyDataSource.runJob', () => {
  it('should run aggregation job when jobtype is aggregation', async () => {
    const memberGuid = 'MBR-123'

    expect(await connectAPI.runJob(JOB_TYPES.AGGREGATION, memberGuid)).toEqual({
      member: MFA_MEMBER,
    })
  })

  it('should run verification job when jobtype is verification', async () => {
    const memberGuid = 'MBR-123'

    expect(await connectAPI.runJob(JOB_TYPES.VERIFICATION, memberGuid)).toEqual({
      member: MFA_MEMBER,
    })
  })

  it('should run reward  job when jobtype is reward', async () => {
    const memberGuid = 'MBR123'

    expect(await connectAPI.runJob(JOB_TYPES.REWARD, memberGuid)).toEqual({ member: MFA_MEMBER })
  })

  it('should run tax  job when jobtype is tax', async () => {
    const memberGuid = 'MBR123'

    expect(await connectAPI.runJob(JOB_TYPES.TAX, memberGuid)).toEqual({ member: MFA_MEMBER })
  })

  it('should run identification  job when jobtype is identification', async () => {
    const memberGuid = 'MBR123'

    expect(await connectAPI.runJob(JOB_TYPES.IDENTIFICATION, memberGuid)).toEqual({
      member: MFA_MEMBER,
    })
  })
})

describe('getOAuthWindowURI', () => {
  it('should generate an oauth-window_uri', async () => {
    expect(
      await connectAPI.getOAuthWindowURI(
        'MBR-123',
        {
          is_mobile_webview: true,
        },
        {
          mode: 'aggregation',
        },
      ),
    ).toEqual({
      member: {
        ...NEW_MEMBER,
        oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri),
      },
    })
  })
})

describe('buildQueryString', () => {
  it('should handle primative values', () => {
    const queryString = buildQueryString({
      search_name: 'wells fargo',
      filter_baddies: true,
    })

    expect(queryString).toEqual('?search_name=wells%20fargo&filter_baddies=true')
  })

  it('should handle primatives and arrays mixed', () => {
    const queryString = buildQueryString({
      search_name: 'wells fargo',
      names: ['sam', 'tommy'],
    })

    expect(queryString).toEqual('?search_name=wells%20fargo&names[]=sam&names[]=tommy')
  })
})

describe('createAnalyticsSession', () => {
  it('should call the correct URL with proper arguments', async () => {
    const options = { foo: 'bar' }

    expect(await connectAPI.createAnalyticsSession(options)).toEqual({
      analytics_session: ANALYTICS_SESSION,
    })
  })
})

describe('closeAnalyticsSession', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(
      await connectAPI.closeAnalyticsSession({ analytics_session: { guid: 'ANS-123' } }),
    ).toEqual({ analytics_session: ANALYTICS_SESSION })
  })
})

describe('buildQueryParameter', () => {
  it('should build a string from the key and primative value', () => {
    const queryParams = buildQueryParameter('search_name', 'wells fargo')

    expect(queryParams).toEqual('search_name=wells%20fargo')
  })

  it('should handle arrays of primatives', () => {
    const queryParams = buildQueryParameter('names', ['sam', 'tommy'])

    expect(queryParams).toEqual('names[]=sam&names[]=tommy')
  })
})

describe('loadInstitutions', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadInstitutions()).toEqual([institutionData])
  })

  it('should call the correct URL with the proper arguments', async () => {
    const name = 'epic'

    expect(await connectAPI.loadInstitutions({ search_name: name })).toEqual([institutionData])
  })
})

describe('loadInstitutionByGuid', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadInstitutionByGuid('INS-123')).toEqual({
      ...institutionData.institution,
      credentials: institutionData.institution.credentials.map(
        (credential) => credential.credential,
      ),
    })
  })
})

describe('loadInstitutionByCode', () => {
  beforeAll(() => {
    global.app = { options: { session_token: '3456' } }
  })
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadInstitutionByCode('3456')).toEqual({
      ...institutionData.institution,
      credentials: institutionData.institution.credentials.map(
        (credential) => credential.credential,
      ),
    })
  })
})

describe('loadPopularInstitutions', () => {
  beforeAll(() => {
    server.use(
      http.get(`${ApiEndpoints.INSTITUTIONS}/favorite`, () =>
        HttpResponse.json({ institutions: [institutionData] }),
      ),
    )
  })

  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.loadPopularInstitutions()).toEqual({
      institutions: [institutionData],
    })
  })
})

describe('loadDiscoveredInstitutions', () => {
  beforeAll(() => {
    server.use(
      http.get(`${ApiEndpoints.INSTITUTIONS}/discovered`, () =>
        HttpResponse.json({ institutions: [institutionData] }),
      ),
    )
  })

  it('should call the correct URL', async () => {
    expect(await connectAPI.loadDiscoveredInstitutions()).toEqual({
      institutions: [institutionData],
    })
  })
})

describe('createAccount', () => {
  beforeAll(() => {
    server.use(
      http.post(ApiEndpoints.ACCOUNTS, () => {
        return HttpResponse.json({ account: ACCOUNT_DATA })
      }),
    )
  })

  it('should POST url with the correct endpoint and account details', async () => {
    expect(
      await connectAPI.createAccount({ name: 'Test Account', account_type: 'CHECKING' }),
    ).toEqual(ACCOUNT_DATA)
  })
})

describe('loadAccounts', () => {
  it('should POST url with the correct endpoint to accounts and members', async () => {
    expect(await connectAPI.loadAccounts()).toEqual([ACCOUNT_DATA])
  })
})

describe('loadAccountsAndMembers', () => {
  beforeAll(() => {
    server.use(http.get(ApiEndpoints.MEMBERS, () => HttpResponse.json({ members: [NEW_MEMBER] })))
  })
  it('should POST url with the correct endpoint to accounts and members', async () => {
    expect(await connectAPI.loadAccountsAndMembers()).toEqual({
      accounts: [ACCOUNT_DATA],
      members: [NEW_MEMBER],
    })
  })
})

describe('loadAccountsByMember', () => {
  it('should GET url with the proper arguments', async () => {
    expect(await connectAPI.loadAccountsByMember('MBR-123')).toEqual([ACCOUNT_DATA])
  })
})

describe('mergeAccounts', () => {
  it('should call the correct URL with proper arguments', async () => {
    const request = await connectAPI.mergeAccounts(['ACT-123, ACT-456'])

    expect(request.data).toEqual({ account: ACCOUNT_DATA })
  })
})

describe('saveAccount', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.saveAccount({ guid: 'ACT-123', foo: 'bar' })).toEqual(ACCOUNT_DATA)
  })
})

describe('updateUserProfile', () => {
  it('should call the correct URL with proper arguments', async () => {
    expect(await connectAPI.updateUserProfile({ guid: 'USR-123' })).toEqual({
      user_profile: {
        guid: 'USP-123',
        too_small_modal_dismissed_at: '2023-08-10T22:47:00+00:00',
        user_guid: 'USR-123',
      },
    })
  })
})
