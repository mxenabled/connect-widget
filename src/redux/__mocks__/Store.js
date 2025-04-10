import { defaultState as DEFAULT_CONNECT_STATE } from 'src/redux/reducers/Connect'
import { defaultState as DEFAULT_APP_STATE } from 'src/redux/reducers/App'

const getState = () => ({
  analytics: {
    currentSession: {
      guid: 'abc',
    },
    featureVisit: {},
  },
  app: { ...DEFAULT_APP_STATE, loading: false },
  browser: {
    height: 956,
    width: 1828,
    size: 'large',
    isMobile: false,
    isTablet: false,
  },
  client: {
    default_institution_guid: 'HOMEACCOUNT',
    guid: 'CLT-123',
    name: 'Client Name',
  },
  clientColorScheme: {},
  clientProfile: { show_external_link_popup: false },
  connect: DEFAULT_CONNECT_STATE,
  connections: {
    accounts: [
      {
        guid: 'ACT-1',
        account_type: 0,
        balance: 50,
        member_guid: 'MBR-1',
        name: 'account one',
        hidden: false,
        interest_rate: 1,
      },
      {
        guid: 'ACT-2',
        account_type: 1,
        is_closed: true,
        balance: 0,
        member_guid: 'MBR-1',
        name: 'account two',
        interest_rate: 2,
        hidden: false,
      },
      {
        guid: 'ACT-3',
        account_type: 2,
        is_deleted: true,
        balance: 500,
        interest_rate: 3,
        name: 'account three',
        hidden: false,
      },
    ],
  },
  connectionsMembers: [],
  user: {
    details: {
      birthday: '793508760',
      first_name: 'Bob',
      last_name: 'Dole',
      guid: '123345',
      details: {
        email: 'foo@foo.com',
        phone: '8015555555',
      },
      email: 'foo@foo.com',
      phone: '8015555555',
    },
    healthScoreError: null,
  },
  userFeatures: {},
  userProfile: {
    has_completed_finstrong_onboarding: false,
    user_guid: '12345',
  },
  widgetProfile: {
    show_accounts_widget_in_master: true,
    show_transactions_widget_in_master: true,
    show_connections_widget_in_master: true,
    enable_support_requests: true,
    enable_manual_accounts: true,
    enable_add_account_in_zero_state: true,
  },
})

const __withUpdatedState = (newState) => Store({ ...getState(), ...newState })

export const Store = (state) => ({
  dispatch: vi.fn(),
  subscribe: vi.fn(),
  getState: () => state,
  __withUpdatedState,
})

export default Store(getState())
