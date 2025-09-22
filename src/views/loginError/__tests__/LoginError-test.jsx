import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { LoginError } from 'src/views/loginError/LoginError'
import { PageviewInfo } from 'src/const/Analytics'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { initialState as defaultState } from 'src/services/mockedData'
import { ConnectionStatusMap, ReadableStatuses } from 'src/const/Statuses'

const institutionMock = {
  name: 'Institution',
  guid: 'INS-123',
}
const memberMock = {
  guid: 'MEM-123',
  error: {},
  name: 'Member',
  connection_status: ReadableStatuses.EXPIRED,
}

vitest.mock('src/hooks/useAnalyticsPath', { spy: true })

describe('LoginError', () => {
  const initialState = {
    ...defaultState,
    connect: {
      ...defaultState.connect,
      selectedInstitution: institutionMock,
      currentMemberGuid: memberMock.guid,
      members: [memberMock],
      location: [{ step: 'LOGIN_ERROR' }],
    },
  }
  const defaultProps = {
    institution: institutionMock,
    isDeleteInstitutionOptionEnabled: true,
    member: memberMock,
    onDeleteConnectionClick: vitest.fn(),
    onRefreshClick: vitest.fn(),
    onUpdateCredentialsClick: vitest.fn(),
    showExternalLinkPopup: false,
    showSupport: true,
    size: 'medium',
  }

  beforeEach(() => {
    vitest.clearAllMocks()
  })

  it('should fire a pageview event with correct parameters', () => {
    render(<LoginError {...defaultProps} />, {
      preloadedState: initialState,
    })
    expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_LOGIN_ERROR, {
      connection_status: memberMock.connection_status,
      readable_status: ConnectionStatusMap[memberMock.connection_status],
    })
  })

  it('should render an institution logo without a badge', () => {
    render(<LoginError {...defaultProps} />, {
      preloadedState: initialState,
    })
    const institutionLogo = screen.getByRole('img')
    expect(institutionLogo).toBeInTheDocument()
    expect(institutionLogo).toHaveAttribute('alt', `${institutionMock.name} logo`)

    const badge = screen.queryByText('!')
    expect(badge).not.toBeInTheDocument()
  })
})
