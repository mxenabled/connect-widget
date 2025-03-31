/* eslint-disable @typescript-eslint/no-explicit-any */
// Connect Widget Props
interface ConnectWidgetPropTypes extends ConnectProps {
  language?: LanguageType
  onPostMessage: (event: string, data?: object) => void
  showTooSmallDialog: boolean
}
interface ConnectProps {
  availableAccountTypes?: []
  clientConfig: ClientConfigType
  onAnalyticEvent?: (eventName: string, metadata: object) => void
  onAnalyticPageview?: (path: string, metadata: object) => void
  onManualAccountAdded?: () => void
  onMemberDeleted?: (memberGuid: string) => void
  onSuccessfulAggregation?: () => void
  onUpsertMember?: () => void
  profiles: ProfilesTypes
  userFeatures?: object
}
interface ClientConfigType {
  is_mobile_webview: boolean
  target_origin_referrer: string | null
  ui_message_protocol: string
  ui_message_version: number
  ui_message_webview_url_scheme: string
  color_scheme: string
  mode: string
  current_institution_code: string | null
  current_institution_guid: string | null
  current_member_guid: string | null
  current_microdeposit_guid: string | null
  enable_app2app: boolean
  disable_background_agg: boolean | null
  disable_institution_search: boolean
  include_identity: boolean | null
  include_transactions: boolean | null
  iso_country_code: string | null
  oauth_referral_source: string
  update_credentials: boolean
  wait_for_full_aggregation: boolean
  data_request?: { products?: string[] | null } | null
  use_cases?: [string] | null
}
interface ProfilesTypes {
  loading: boolean
  client:
    | any
    | {
        guid: string
        has_atrium_api?: boolean
        has_limited_institutions?: boolean
        oauth_app_name: string
      }
  clientColorScheme: {
    primary_100: string
    primary_200: string
    primary_300: string
    primary_400: string
    primary_500: string
    color_scheme?: string
    widget_brand_color: string | null
  }
  clientProfile:
    | {
        account_verification_is_enabled?: boolean
        custom_copy_namespace?: string
        is_microdeposits_enabled?: boolean
        locale: string
        show_external_link_popup?: boolean
        tax_statement_is_enabled?: boolean
        use_cases_is_enabled?: boolean
        uses_custom_popular_institution_list?: boolean
        uses_oauth?: boolean
      }
    | any
  user:
    | {
        guid: string
        email?: string
      }
    | object
  userProfile: {
    too_small_modal_dismissed_at?: string
  }
  widgetProfile: {
    display_disclosure_in_connect?: boolean
    enable_manual_accounts?: boolean
    enable_support_requests?: boolean
    show_microdeposits_in_connect?: boolean
    show_mx_branding?: boolean
  }
}
type LanguageType = {
  locale: 'en' | 'es' | 'fr-ca'
  custom_copy_namespace: string
}
interface AnalyticContextType {
  onAnalyticEvent?: (eventName: string, metadata: object) => void
  onAnalyticPageview?: (path: string, metadata: object) => void
  onShowConnectSuccessSurvey?: () => void | null
  onSubmitConnectSuccessSurvey?: (answers: object) => void
}
interface PostMessageContextType {
  onPostMessage: (event: string, data?: object) => void
}
interface UserFeatureType {
  guid: string
  feature_name: string
  is_enabled: boolean
}
