import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { Connect } from '../Connect'
import { render } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { masterData, institutionData } from 'src/services/mockedData'

describe('Connect - Demo Connect Guard', () => {
  const defaultProps = {
    clientConfig: { current_institution_guid: 'INS-123' } as ClientConfigType,
    onShowConnectSuccessSurvey: () => undefined,
    onSubmitConnectSuccessSurvey: () => {},
    profiles: { ...masterData, loading: false },
  }

  const nonDemoInstitution = { ...institutionData.institution, is_demo: false }
  const demoInstitution = { ...institutionData.institution, is_demo: true }
  const demoUser = { ...masterData.user, is_demo: true }
  const regularUser = { ...masterData.user, is_demo: false }

  it('blocks demo user from accessing non-demo institution', async () => {
    const mockApiValue = {
      ...apiValueMock,
      loadInstitutionByGuid: vi.fn().mockResolvedValue(nonDemoInstitution),
      loadMembers: vi.fn().mockResolvedValue([]),
    }

    render(
      <Connect {...defaultProps} profiles={{ ...masterData, user: demoUser, loading: false }} />,
      { apiValue: mockApiValue },
    )

    expect(await screen.findByText(/Demo mode active/i)).toBeInTheDocument()
  })

  it('allows demo user to access demo institution', async () => {
    const mockApiValue = {
      ...apiValueMock,
      loadInstitutionByGuid: vi.fn().mockResolvedValue(demoInstitution),
      loadMembers: vi.fn().mockResolvedValue([]),
    }

    render(
      <Connect {...defaultProps} profiles={{ ...masterData, user: demoUser, loading: false }} />,
      { apiValue: mockApiValue },
    )

    expect(await screen.findByText(/Log in at Test Bank/i)).toBeInTheDocument()
    expect(screen.queryByText(/Demo mode active/i)).not.toBeInTheDocument()
  })

  it('allows regular user to access non-demo institution', async () => {
    const mockApiValue = {
      ...apiValueMock,
      loadInstitutionByGuid: vi.fn().mockResolvedValue(nonDemoInstitution),
      loadMembers: vi.fn().mockResolvedValue([]),
    }

    render(
      <Connect {...defaultProps} profiles={{ ...masterData, user: regularUser, loading: false }} />,
      { apiValue: mockApiValue },
    )

    expect(await screen.findByText(/Log in at Test Bank/i)).toBeInTheDocument()
    expect(screen.queryByText(/Demo mode active/i)).not.toBeInTheDocument()
  })
})
