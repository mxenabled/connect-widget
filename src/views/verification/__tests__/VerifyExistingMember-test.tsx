import { render, screen } from 'src/utilities/testingLibrary'
import React from 'react'

import VerifyExistingMember from 'src/views/verification/VerifyExistingMember'
import { ReadableStatuses } from 'src/const/Statuses'

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
