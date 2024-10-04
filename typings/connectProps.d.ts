// Connect Widget Props
interface ConnectWidgetPropTypes extends ConnectProps {
  language?: LanguageTypes
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
  oauth_referral_source: string
  update_credentials: boolean
  wait_for_full_aggregation: boolean
  data_request?: { products?: [string] | null } | null
}
interface ProfilesTypes {
  loading: boolean
  client: {
    default_institution_guid?: string
    guid?: string
    name?: string
    has_atrium_api?: boolean
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
  clientProfile: {
    account_verification_is_enabled?: boolean
    tax_statement_is_enabled?: boolean
  }
  user: object
  userProfile: object
  widgetProfile: object
}
type LanguageTypes = {
  locale: 'en' | 'es' | 'fr-ca'
  custom_copy_namespace: string
}
