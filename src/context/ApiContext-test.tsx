import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { initialState } from 'src/services/mockedData'
import { ApiProvider, useApi } from 'src/context/ApiContext'
import { CreateMemberForm } from 'src/views/credentials/CreateMemberForm'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

describe('ApiContext', () => {
  const preloadedState = {
    ...initialState,
    connect: {
      ...initialState.connect,
      current_institution_guid: 'INS-123',
      selectedInstitution: {
        guid: 'INS-123',
        code: 'mxbank',
        name: 'MX Bank',
      },
      institutions: [
        {
          guid: 'INS-123',
          code: 'mxbank',
          name: 'MX Bank',
        },
      ],
    },
  }

  const defaultProps = {
    onError: () => {},
    onSuccess: () => {},
  }

  it('provides API to child components', async () => {
    const mockGetInstitutionCredentials = vi.fn().mockResolvedValue([
      {
        guid: 'CRD-1',
        label: 'Username',
        field_name: 'username',
        field_type: 'TEXT',
      },
    ])

    render(
      <ApiProvider
        apiValue={{ ...apiValueMock, getInstitutionCredentials: mockGetInstitutionCredentials }}
      >
        <CreateMemberForm {...defaultProps} />
      </ApiProvider>,
      { preloadedState },
    )

    await waitFor(() => {
      expect(mockGetInstitutionCredentials).toHaveBeenCalledWith('INS-123')
    })

    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('allows custom API values to be provided', async () => {
    const customGetInstitutionCredentials = vi.fn().mockResolvedValue([
      {
        guid: 'CRD-2',
        label: 'Password',
        field_name: 'password',
        field_type: 'PASSWORD',
      },
    ])

    render(
      <ApiProvider
        apiValue={{
          ...apiValueMock,
          getInstitutionCredentials: customGetInstitutionCredentials,
        }}
      >
        <CreateMemberForm {...defaultProps} />
      </ApiProvider>,
      { preloadedState },
    )

    await waitFor(() => {
      expect(customGetInstitutionCredentials).toHaveBeenCalledWith('INS-123')
    })

    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('provides default API values when used outside provider', () => {
    const TestComponent = () => {
      const { api } = useApi()
      return (
        <div>
          <div data-test="has-api">{typeof api.loadMembers === 'function' ? 'yes' : 'no'}</div>
        </div>
      )
    }

    render(<TestComponent />, { preloadedState })

    expect(screen.getByTestId('has-api')).toHaveTextContent('yes')
  })
})
