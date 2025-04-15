import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import React from 'react'

import VerifyExistingMember from 'src/views/verification/VerifyExistingMember'
import { ReadableStatuses } from 'src/const/Statuses'
import { ApiProvider } from 'src/context/ApiContext'
import { initialState } from 'src/services/mockedData'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

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
    verification_is_enabled: false,
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

describe('VerifyExistingMember Component', () => {
  beforeEach(() => {
    vi.resetAllMocks() // Clear mocks before each test
  })

  const loadInstitutionByGuidMock = (guid) => {
    return Promise.resolve(mockInstitutions.get(guid))
  }

  const onAddNewMock = vi.fn()

  // Helper function to render the component with consistent setup
  const renderComponent = (config = {}) => {
    return render(
      <ApiProvider apiValue={{ loadInstitutionByGuid: loadInstitutionByGuidMock }}>
        <VerifyExistingMember members={mockMembers} onAddNew={onAddNewMock} />
      </ApiProvider>,
      {
        preloadedState: {
          config: {
            ...initialState.config,
            ...config,
          },
        },
      },
    )
  }

  it('should render a list of members, only those that support IAV and are managed by the user', async () => {
    renderComponent({
      data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER] },
    })

    await waitFor(() => screen.getByText('Member 1'))

    expect(screen.getByText('Member 1')).toBeInTheDocument()
    expect(screen.queryByText('Member 2')).toBeInTheDocument()
    expect(screen.queryByText('Member 3')).not.toBeInTheDocument()
  })

  it('should render a list of members, only those that support ACCOUNT_OWNER and are managed by the user', async () => {
    renderComponent({
      data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER] },
    })

    await waitFor(() => screen.getByText('Member 2'))

    expect(screen.getByText('Member 2')).toBeInTheDocument()
    expect(screen.queryByText('Member 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Member 3')).not.toBeInTheDocument()
  })

  it('should render a title and paragraph', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Select your institution/i })).toBeInTheDocument()
      expect(
        screen.getByText(
          'Choose an institution that’s already connected and select accounts to share, or search for a different one.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('should render a count of connected institutions', async () => {
    renderComponent({
      data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER] },
    })

    await waitFor(() => screen.getByText('1 Connected institution'))
    expect(screen.getByText('1 Connected institution')).toBeInTheDocument()
  })

  it('should call onAddNew when the search more institutions button is clicked', async () => {
    const { user } = renderComponent()

    await waitFor(async () => {
      const button = screen.getByRole('button', { name: /Search more institutions/i })
      await user.click(button)

      expect(onAddNewMock).toHaveBeenCalledTimes(1)
    })
  })
})
