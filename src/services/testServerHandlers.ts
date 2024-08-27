import { http, HttpResponse } from 'msw'
import { ApiEndpoints } from 'src/services/FireflyDataSource'
import {
  institutionData,
  institutionCredentialsData,
  masterData,
  MFA_MEMBER,
  OAUTH_STATE,
  NEW_MEMBER,
  memberCredentialsData,
  MICRODEPOSIT,
  JOB_DATA,
  ACCOUNT_DATA,
  ANALYTICS_SESSION,
} from 'src/services/mockedData'

type MemberRequestBodyType = {
  background_aggregation_is_disabled?: boolean
  client_redirect_url?: string
  enable_app2app?: boolean
}
type FeedbackRequestBodyType = {
  rating: string
  comments: string
  source: string
}
type MicrodepositRequestBodyType = {
  account_name: string
  account_number: string
  account_type: string
  routing_number: string
  user_guid: string
}

export const testServerHandlers = [
  http.get(ApiEndpoints.ACCOUNTS, () => {
    return HttpResponse.json({
      accounts: [ACCOUNT_DATA],
    })
  }),
  http.post(ApiEndpoints.ACCOUNTS, () => {
    return HttpResponse.json({
      account: ACCOUNT_DATA,
    })
  }),
  http.put(ApiEndpoints.ACCOUNTS + '/merge', () => {
    return HttpResponse.json({ account: ACCOUNT_DATA })
  }),
  http.put(ApiEndpoints.ACCOUNTS + '/:id', () => {
    return HttpResponse.json({ account: ACCOUNT_DATA })
  }),

  http.post(ApiEndpoints.ANALYTICS_EVENTS, () => {
    return HttpResponse.json(null)
  }),
  http.post(ApiEndpoints.ANALYTICS_PAGEVIEW, () => {
    return HttpResponse.json(null)
  }),
  http.post(ApiEndpoints.ANALYTICS_SESSION, () => {
    return HttpResponse.json({
      analytics_session: ANALYTICS_SESSION,
    })
  }),
  http.put(ApiEndpoints.ANALYTICS_SESSION + '/:id', () => {
    return HttpResponse.json({
      analytics_session: ANALYTICS_SESSION,
    })
  }),
  http.get(`${ApiEndpoints.BLOCKED_ROUTING_NUMBERS}/:routingNumber`, () => {
    return HttpResponse.json({
      blocked_routing_number: {
        guid: null,
        reason: 3,
        reason_name: 'IAV_PREFERRED',
      },
    })
  }),
  http.post<object, FeedbackRequestBodyType>(ApiEndpoints.CONNECT_FEEDBACK, async (args) => {
    const req: FeedbackRequestBodyType = await args.request.json()

    return HttpResponse.json({
      connect_feedback: {
        client_guid: 'CLT-9e20ea82-0beb-43ac-ac34-eb3756a41509',
        comments: req.comments,
        guid: 'CFB-123',
        rating: req.rating,
        source: req.source,
        user_guid: 'USR-123',
      },
    })
  }),
  http.post(ApiEndpoints.FEATURE_VISITS, () => {
    return HttpResponse.json({
      feature_visit: {
        guid: 'FTV-123',
        analytics_session_guid: 'ANS-123',
        feature_name: 'Connect',
        is_first_visit: false,
        started_at: 1691098018,
        ended_at: 0,
      },
    })
  }),
  http.put(ApiEndpoints.FEATURE_VISITS + '/:id', () => {
    return HttpResponse.json({
      feature_visit: {
        guid: 'FTV-123',
        analytics_session_guid: 'ANS-123',
        feature_name: 'Connect',
        is_first_visit: false,
        started_at: 1691091247,
      },
    })
  }),
  http.get('/raja/data', () => {
    return HttpResponse.json(masterData)
  }),
  http.post(ApiEndpoints.INSTRUMENTATION, () => {
    return HttpResponse.json(null)
  }),
  http.post(ApiEndpoints.SUPPORT_TICKETS, () => {
    return HttpResponse.json(null)
  }),
  http.put(ApiEndpoints.USER_PROFILES + '/:id', () => {
    return HttpResponse.json({
      user_profile: {
        guid: 'USP-123',
        too_small_modal_dismissed_at: '2023-08-10T22:47:00+00:00',
        user_guid: 'USR-123',
      },
    })
  }),
  http.get(ApiEndpoints.MEMBERS, () => {
    return HttpResponse.json({
      members: [],
    })
  }),
  http.get(ApiEndpoints.INSTITUTIONS, () => {
    return HttpResponse.json([institutionData])
  }),
  http.get(`${ApiEndpoints.INSTITUTIONS}/favorite`, () => {
    return HttpResponse.json([])
  }),
  http.get(`${ApiEndpoints.INSTITUTIONS}/discovered`, () => {
    return HttpResponse.json([])
  }),
  http.get(`${ApiEndpoints.INSTITUTIONS}/:id`, () => {
    return HttpResponse.json(institutionData)
  }),
  http.get(`${ApiEndpoints.INSTITUTIONS}/:id/credentials`, () => {
    return HttpResponse.json(institutionCredentialsData)
  }),
  http.get(`${ApiEndpoints.JOBS}/:id`, () => {
    return HttpResponse.json({
      job: JOB_DATA,
    })
  }),
  http.delete(`${ApiEndpoints.MEMBERS}/:id`, () => {
    return HttpResponse.json(null)
  }),
  http.get(ApiEndpoints.MEMBERS, () => {
    return HttpResponse.json({
      members: [],
    })
  }),
  http.get(`${ApiEndpoints.MEMBERS}/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      member: {
        ...MFA_MEMBER,
        guid: id,
      },
    })
  }),
  http.get(`${ApiEndpoints.MEMBERS}/:id/credentials`, () => {
    return HttpResponse.json(memberCredentialsData)
  }),
  http.post<object, MemberRequestBodyType>(ApiEndpoints.MEMBERS, async (args) => {
    const req: MemberRequestBodyType = await args.request.json()

    return HttpResponse.json({
      member: {
        ...NEW_MEMBER,
        background_aggregation_is_disabled: req.background_aggregation_is_disabled,
        enable_app2app: req.enable_app2app,
        oauth_window_uri: encodeURIComponent(
          NEW_MEMBER.oauth_window_uri + req?.client_redirect_url,
        ),
      },
    })
  }),
  http.post(`${ApiEndpoints.MEMBERS}/:id/fetch_rewards`, () => {
    return HttpResponse.json({
      member: MFA_MEMBER,
    })
  }),
  http.post(`${ApiEndpoints.MEMBERS}/:id/identify`, () => {
    return HttpResponse.json({
      member: MFA_MEMBER,
    })
  }),
  http.get(`${ApiEndpoints.MEMBERS}/:id/oauth_window_uri`, () => {
    return HttpResponse.json({
      member: { ...NEW_MEMBER, oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri) },
    })
  }),
  http.post(`${ApiEndpoints.MEMBERS}/:id/tax`, () => {
    return HttpResponse.json({
      member: MFA_MEMBER,
    })
  }),
  http.post(`${ApiEndpoints.MEMBERS}/:id/unthrottled_aggregate`, () => {
    return HttpResponse.json({
      member: MFA_MEMBER,
    })
  }),
  http.post(`${ApiEndpoints.MEMBERS}/:id/verify`, () => {
    return HttpResponse.json({
      member: MFA_MEMBER,
    })
  }),
  http.put<object, MemberRequestBodyType>(`${ApiEndpoints.MEMBERS}/:id`, async (args) => {
    const req: MemberRequestBodyType = await args.request.json()

    return HttpResponse.json({
      member: {
        ...NEW_MEMBER,
        ...req,
        oauth_window_uri: generateEncodedUrl(NEW_MEMBER.oauth_window_uri, req?.client_redirect_url),
      },
    })
  }),
  http.post(ApiEndpoints.MICRODEPOSITS, () => {
    return HttpResponse.json(MICRODEPOSIT)
  }),
  http.get(`${ApiEndpoints.MICRODEPOSITS}/:id`, () => {
    return HttpResponse.json({
      micro_deposit: MICRODEPOSIT,
    })
  }),
  http.get(`${ApiEndpoints.MICRODEPOSITS}/:id/status`, () => {
    return HttpResponse.json({
      micro_deposit: MICRODEPOSIT,
    })
  }),
  http.put(`${ApiEndpoints.MICRODEPOSITS}/:id/verify`, () => {
    return HttpResponse.json({
      micro_deposit: MICRODEPOSIT,
    })
  }),
  http.put<object, MicrodepositRequestBodyType>(
    `${ApiEndpoints.MICRODEPOSITS}/:id`,
    async (args) => {
      const req: MicrodepositRequestBodyType = await args.request.json()

      return HttpResponse.json({
        micro_deposit: {
          ...MICRODEPOSIT,
          ...req,
        },
      })
    },
  ),
  http.get(ApiEndpoints.OAUTH_STATES, () => {
    return HttpResponse.json({
      oauth_states: [
        {
          guid: 'OAS-123',
          auth_status: 1,
          error_reason: null,
          first_retrieved_at: null,
          inbound_member_guid: null,
          outbound_member_guid: 'MBR-123',
          user_guid: 'USR-123',
        },
      ],
    })
  }),
  http.get(`${ApiEndpoints.OAUTH_STATES}/:id`, () => {
    return HttpResponse.json(OAUTH_STATE)
  }),
  http.get(`${ApiEndpoints.ROOT}/extend_session`, () => {
    return HttpResponse.json(null)
  }),
  http.get(ApiEndpoints.LOGOUT, () => {
    return HttpResponse.json(null)
  }),
]

export const generateEncodedUrl = (url: string, redirect_uri: string | null = null) =>
  encodeURIComponent(url + redirect_uri)
