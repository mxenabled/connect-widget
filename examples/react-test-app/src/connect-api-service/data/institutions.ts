interface Institution {
  account_verification_is_enabled: boolean
  account_identification_is_enabled: boolean
  code: string
  forgot_password_credential_recovery_url: string | null
  forgot_username_credential_recovery_url: string | null
  guid: string
  instructional_text: string | null
  instructional_data: {
    title: string | null
    description: string | null
    steps: string[]
  }
  is_disabled_by_client: boolean
  login_url: string | null
  name: string
  popularity: number
  supports_oauth: boolean
  tax_statement_is_enabled: boolean
  trouble_signing_credential_recovery_url: string | null
  url: string
  credentials: {
    credential: {
      display_order: number
      field_name: string
      field_type: number
      guid: string
      label: string
      meta_data: object | null
      optional: boolean | null
      options: object | null
    }
  }[]
}

export const credentialBank: Institution = {
  account_verification_is_enabled: true,
  account_identification_is_enabled: true,
  code: 'mxbank',
  forgot_password_credential_recovery_url: null,
  forgot_username_credential_recovery_url: null,
  guid: 'INS-1572a04c-912b-59bf-5841-332c7dfafaef',
  instructional_text: null,
  instructional_data: {
    title: null,
    description: null,
    steps: [],
  },
  is_disabled_by_client: false,
  login_url: null,
  name: 'MX Bank',
  popularity: 543636,
  supports_oauth: false,
  tax_statement_is_enabled: false,
  trouble_signing_credential_recovery_url: null,
  url: 'https://www.mx.com',
  credentials: [
    {
      credential: {
        display_order: 1,
        field_name: 'LOGIN',
        field_type: 3,
        guid: 'CRD-111',
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
        guid: 'CRD-222',
        label: 'Password',
        meta_data: null,
        optional: false,
        options: null,
      },
    },
  ],
}

export const oauthBank: Institution = {
  account_verification_is_enabled: true,
  account_identification_is_enabled: true,
  code: 'mx_bank_oauth',
  forgot_password_credential_recovery_url: null,
  forgot_username_credential_recovery_url: null,
  guid: 'INS-68e96dd6-eabd-42d3-9f05-416897f0746c',
  instructional_text: null,
  instructional_data: {
    title: null,
    description: null,
    steps: [],
  },
  is_disabled_by_client: false,
  login_url: null,
  name: 'MX Bank (OAuth)',
  popularity: 165602,
  supports_oauth: true,
  tax_statement_is_enabled: false,
  trouble_signing_credential_recovery_url: null,
  url: 'www.mx.com',
  credentials: [
    {
      credential: {
        display_order: 1,
        field_name: 'LOGIN',
        field_type: 3,
        guid: 'CRD-333',
        label: 'Username',
        meta_data: null,
        optional: null,
        options: null,
      },
    },
    {
      credential: {
        display_order: 2,
        field_name: 'PASSWORD',
        field_type: 1,
        guid: 'CRD-444',
        label: 'Password',
        meta_data: null,
        optional: null,
        options: null,
      },
    },
  ],
}

export const discoveredBank: Institution = {
  account_verification_is_enabled: true,
  account_identification_is_enabled: true,
  code: 'discovered',
  forgot_password_credential_recovery_url: null,
  forgot_username_credential_recovery_url: null,
  guid: 'INS-111',
  instructional_text: null,
  instructional_data: {
    title: null,
    description: null,
    steps: [],
  },
  is_disabled_by_client: false,
  login_url: null,
  name: 'MX Bank (discovered)',
  popularity: 165602,
  supports_oauth: true,
  tax_statement_is_enabled: false,
  trouble_signing_credential_recovery_url: null,
  url: 'www.mx.com',
  credentials: [
    {
      credential: {
        display_order: 1,
        field_name: 'LOGIN',
        field_type: 3,
        guid: 'CRD-555',
        label: 'Username',
        meta_data: null,
        optional: null,
        options: null,
      },
    },
    {
      credential: {
        display_order: 2,
        field_name: 'PASSWORD',
        field_type: 1,
        guid: 'CRD-666',
        label: 'Password',
        meta_data: null,
        optional: null,
        options: null,
      },
    },
  ],
}

export const manualInstitution: Institution = {
  account_verification_is_enabled: false,
  account_identification_is_enabled: false,
  code: '3af3685e-05d9-7060-359f-008d0755e993',
  forgot_password_credential_recovery_url: null,
  forgot_username_credential_recovery_url: null,
  guid: 'INS-MANUAL-111',
  instructional_text: null,
  instructional_data: {
    title: null,
    description: null,
    steps: [],
  },
  is_disabled_by_client: false,
  login_url: 'https://mx.com',
  name: 'Manual Institution',
  popularity: 598,
  supports_oauth: false,
  tax_statement_is_enabled: false,
  trouble_signing_credential_recovery_url: null,
  url: 'none',
  credentials: [
    {
      credential: {
        display_order: 0,
        field_name: 'username',
        field_type: 3,
        guid: 'CRD-2dbbd566-916f-47dd-879c-a9887ee215d8',
        label: "User's name",
        meta_data: null,
        optional: null,
        options: null,
      },
    },
    {
      credential: {
        display_order: 1,
        field_name: 'password',
        field_type: 1,
        guid: 'CRD-9004eceb-a60a-44b4-8041-ee506cbe961b',
        label: 'Passcode',
        meta_data: null,
        optional: null,
        options: null,
      },
    },
  ],
}

export const banks = [credentialBank, oauthBank, discoveredBank]
