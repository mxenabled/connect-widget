import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import React from 'react'

import VerifyExistingMember from 'src/views/verification/VerifyExistingMember'
import { ReadableStatuses } from 'src/const/Statuses'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

describe('VerifyExistingMember Test', () => {
  const onAddNewMock = vi.fn()
  beforeEach(() => {
    render(<VerifyExistingMember members={mockMembers} onAddNew={onAddNewMock} />)
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render a list of members, only those that support IAV and are managed by the user', () => {
    expect(screen.getByText('Member 1')).toBeInTheDocument()
    expect(screen.queryByText('Member 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Member 3')).not.toBeInTheDocument()
  })

  it('should render a title and paragraph', () => {
    expect(screen.getByText('Select your institution')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Choose an institution that’s already connected and select accounts to share, or search for a different one.',
      ),
    ).toBeInTheDocument()
  })

  it('should render a count of connected institutions', () => {
    expect(screen.getByText('1 Connected institution')).toBeInTheDocument()
  })

  it('should render a button to search for more institutions', () => {
    const button = screen.getByText('Search more institutions')
    expect(button).toBeInTheDocument()

    button.click()
    expect(onAddNewMock).toHaveBeenCalled()
  })

  describe('product(s) support', () => {
    const mockMembers = [
      {
        guid: 'MBR-123',
        name: 'Member 1',
        institution_guid: 'INS-123',
        verification_is_enabled: true,
        is_managed_by_user: true,
        aggregation_status: 1,
        connection_status: ReadableStatuses.CONNECTED,
        institution_url: 'https://example.com',
        is_being_aggregated: false,
        is_manual: false,
        is_oauth: true,
        user_guid: 'USR-123',
      },
      {
        guid: 'MBR-456',
        name: 'Member 2',
        institution_guid: 'INS-456',
        verification_is_enabled: true,
        is_managed_by_user: true,
        aggregation_status: 6,
        connection_status: ReadableStatuses.CONNECTED,
        institution_url: 'https://example.com',
        is_being_aggregated: false,
        is_manual: false,
        is_oauth: true,
        user_guid: 'USR-456',
      },
      {
        guid: 'MBR-789',
        name: 'Member 3',
        institution_guid: 'INS-789',
        verification_is_enabled: true,
        is_managed_by_user: true,
        aggregation_status: 6,
        connection_status: ReadableStatuses.CONNECTED,
        institution_url: 'https://example.com',
        is_being_aggregated: false,
        is_manual: false,
        is_oauth: true,
        user_guid: 'USR-789',
      },
    ]

    const mockInstitutions = new Map([
      [
        'INS-123',
        {
          guid: 'INS-123',
          name: 'Institution 1',
          account_verification_is_enabled: true,
          account_identification_is_enabled: false,
        },
      ],
      [
        'INS-456',
        {
          guid: 'INS-456',
          name: 'Institution 2',
          account_verification_is_enabled: true,
          account_identification_is_enabled: true,
        },
      ],
      [
        'INS-789',
        {
          guid: 'INS-789',
          name: 'Institution 3',
          account_identification_is_enabled: true,
          account_verification_is_enabled: false,
        },
      ],
    ])

    beforeEach(() => {
      vi.resetAllMocks()
    })

    const loadInstitutionByGuidMock = vi.fn().mockImplementation((guid) => {
      return Promise.resolve(mockInstitutions.get(guid))
    })

    it('should display members that support verification', async () => {
      render(
        <ApiProvider
          apiValue={{
            ...apiValue,
            loadInstitutionByGuid: loadInstitutionByGuidMock,
          }}
        >
          <VerifyExistingMember members={mockMembers} onAddNew={vi.fn()} />,
        </ApiProvider>,
        {
          preloadedState: {
            config: {
              ...initialState.config,
              data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER] },
            },
          },
        },
      )

      await waitFor(() => expect(screen.getByText('Member 1')).toBeInTheDocument())

      expect(screen.queryByText('Member 1')).toBeInTheDocument()
      expect(screen.queryByText('Member 2')).toBeInTheDocument()
      expect(screen.queryByText('Member 3')).not.toBeInTheDocument()
    })

    it('should display members that support identification', async () => {
      render(
        <ApiProvider apiValue={{ ...apiValue, loadInstitutionByGuid: loadInstitutionByGuidMock }}>
          <VerifyExistingMember members={mockMembers} onAddNew={onAddNewMock} />
        </ApiProvider>,
        {
          preloadedState: {
            config: {
              ...initialState.config,
              include_identity: true,
            },
          },
        },
      )

      await waitFor(() => expect(screen.getByText('Member 2')).toBeInTheDocument())

      expect(screen.queryByText('Member 2')).toBeInTheDocument()

      expect(screen.queryByText('Member 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Member 3')).toBeInTheDocument()
    })

    // it('should display members that support both verification and identification', async () => {
    //   render(
    //     <ApiProvider
    //       apiValue={{
    //         ...apiValue,
    //         loadInstitutionByGuid: vi.fn().mockImplementation((guid) => {
    //           return Promise.resolve(mockInstitutions.get(guid))
    //         }),
    //       }}
    //     >
    //       <VerifyExistingMember members={mockMembers} onAddNew={vi.fn()} />,
    //     </ApiProvider>,
    //     {
    //       preloadedState: {
    //         config: {
    //           ...initialState.config,
    //           data_request: {
    //             products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER, COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER],
    //           },
    //         },
    //       },
    //     },
    //   )

    //   await waitFor(() => expect(screen.getByText('Member 3')).toBeInTheDocument())

    //   expect(screen.queryByText('Member 3')).toBeInTheDocument()

    //   expect(screen.queryByText('Member 1')).not.toBeInTheDocument()
    //   expect(screen.queryByText('Member 2')).not.toBeInTheDocument()
    // })
  })
})

const mockMembers = [
  {
    guid: 'MBR-123',
    name: 'Member 1',
    verification_is_enabled: true,
    is_managed_by_user: true,
    aggregation_status: 1,
    connection_status: ReadableStatuses.CONNECTED,
    institution_guid: 'INS-123',
    institution_url: 'https://example.com',
    is_being_aggregated: false,
    is_manual: false,
    is_oauth: true,
    user_guid: 'USR-123',
  },
  {
    guid: 'MBR-456',
    name: 'Member 2',
    verification_is_enabled: true,
    is_managed_by_user: false,
    aggregation_status: 6,
    connection_status: ReadableStatuses.CONNECTED,
    institution_guid: 'INS-456',
    institution_url: 'https://example.com',
    is_being_aggregated: false,
    is_manual: false,
    is_oauth: true,
    user_guid: 'USR-456',
  },
  {
    guid: 'MBR-789',
    name: 'Member 3',
    verification_is_enabled: false,
    is_managed_by_user: true,
    aggregation_status: 6,
    connection_status: ReadableStatuses.CONNECTED,
    institution_guid: 'INS-789',
    institution_url: 'https://example.com',
    is_being_aggregated: false,
    is_manual: false,
    is_oauth: true,
    user_guid: 'USR-789',
  },
]
