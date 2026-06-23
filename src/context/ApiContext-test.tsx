import React from 'react'
import { render as rtlRender, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiProvider, useApi, defaultApiValue, type ApiContextTypes } from 'src/context/ApiContext'

const TestComponent: React.FC = () => {
  const { api } = useApi()
  return (
    <div>
      <button onClick={() => api.loadMembers()}>Load Members</button>
      <button onClick={() => api.loadInstitutionByGuid('INS-123')}>Load Institution</button>
      <div data-test="api-available">API Available</div>
    </div>
  )
}

describe('ApiContext', () => {
  describe('ApiProvider', () => {
    it('should render children', () => {
      rtlRender(
        <ApiProvider apiValue={{} as unknown as ApiContextTypes}>
          <div>Test Child</div>
        </ApiProvider>,
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide default API values', () => {
      rtlRender(
        <ApiProvider apiValue={{} as ApiContextTypes}>
          <TestComponent />
        </ApiProvider>,
      )

      expect(screen.getByTestId('api-available')).toBeInTheDocument()
    })

    it('should merge custom API values with defaults', async () => {
      const user = userEvent.setup()
      const customLoadMembers = vi.fn(() => Promise.resolve([]))
      const customApiValue = {
        loadMembers: customLoadMembers,
      }

      const { getByText } = rtlRender(
        <ApiProvider apiValue={customApiValue as unknown as ApiContextTypes}>
          <TestComponent />
        </ApiProvider>,
      )

      await user.click(getByText('Load Members'))

      expect(customLoadMembers).toHaveBeenCalled()
    })

    it('should allow custom API values to override defaults', async () => {
      const user = userEvent.setup()
      const customLoadInstitution = vi.fn(() =>
        Promise.resolve({ guid: 'INS-123', name: 'Test Bank' } as InstitutionResponseType),
      )

      const { getByText } = rtlRender(
        <ApiProvider
          apiValue={{ loadInstitutionByGuid: customLoadInstitution } as unknown as ApiContextTypes}
        >
          <TestComponent />
        </ApiProvider>,
      )

      await user.click(getByText('Load Institution'))

      expect(customLoadInstitution).toHaveBeenCalledWith('INS-123')
    })
  })

  describe('useApi hook', () => {
    it('should return api object when used within ApiProvider', () => {
      const TestComponentCheckApi = () => {
        const { api } = useApi()
        return <div data-test="has-api">{api ? 'Has API' : 'No API'}</div>
      }

      rtlRender(
        <ApiProvider apiValue={{} as ApiContextTypes}>
          <TestComponentCheckApi />
        </ApiProvider>,
      )

      expect(screen.getByTestId('has-api')).toHaveTextContent('Has API')
    })

    it('should return default API values even when used outside provider', () => {
      const TestComponentCheckApi = () => {
        const { api } = useApi()
        return <div data-test="has-api">{api ? 'Has API' : 'No API'}</div>
      }

      rtlRender(<TestComponentCheckApi />)

      expect(screen.getByTestId('has-api')).toHaveTextContent('Has API')
    })

    it('should have all default API methods available', () => {
      const TestComponentCheckMethods = () => {
        const { api } = useApi()
        return (
          <div>
            <div data-test="has-addMember">
              {typeof api.addMember === 'function' ? 'yes' : 'no'}
            </div>
            <div data-test="has-loadMembers">
              {typeof api.loadMembers === 'function' ? 'yes' : 'no'}
            </div>
            <div data-test="has-loadInstitutions">
              {typeof api.loadInstitutions === 'function' ? 'yes' : 'no'}
            </div>
          </div>
        )
      }

      rtlRender(
        <ApiProvider apiValue={{} as ApiContextTypes}>
          <TestComponentCheckMethods />
        </ApiProvider>,
      )

      expect(screen.getByTestId('has-addMember')).toHaveTextContent('yes')
      expect(screen.getByTestId('has-loadMembers')).toHaveTextContent('yes')
      expect(screen.getByTestId('has-loadInstitutions')).toHaveTextContent('yes')
    })
  })

  describe('defaultApiValue', () => {
    it('should have createAccount function', async () => {
      expect(defaultApiValue.createAccount).toBeDefined()
      const result = await defaultApiValue.createAccount!({} as AccountCreateType)
      expect(result).toBeDefined()
    })

    it('should have addMember function', async () => {
      expect(defaultApiValue.addMember).toBeDefined()
      const result = await defaultApiValue.addMember({}, {} as ClientConfigType, true)
      expect(result).toBeDefined()
    })

    it('should have deleteMember function', async () => {
      expect(defaultApiValue.deleteMember).toBeDefined()
      await expect(defaultApiValue.deleteMember({} as MemberDeleteType)).resolves.toBeUndefined()
    })

    it('should have getMemberCredentials function', async () => {
      expect(defaultApiValue.getMemberCredentials).toBeDefined()
      const result = await defaultApiValue.getMemberCredentials('MEM-123')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have loadMemberByGuid function', async () => {
      expect(defaultApiValue.loadMemberByGuid).toBeDefined()
      const result = await defaultApiValue.loadMemberByGuid!('MEM-123')
      expect(result).toBeDefined()
    })

    it('should have loadMembers function', async () => {
      expect(defaultApiValue.loadMembers).toBeDefined()
      const result = await defaultApiValue.loadMembers()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have updateMember function', async () => {
      expect(defaultApiValue.updateMember).toBeDefined()
      const result = await defaultApiValue.updateMember({}, {} as ClientConfigType, true)
      expect(result).toBeDefined()
    })

    it('should have getInstitutionCredentials function', async () => {
      expect(defaultApiValue.getInstitutionCredentials).toBeDefined()
      const result = await defaultApiValue.getInstitutionCredentials('INS-123')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have loadDiscoveredInstitutions function', async () => {
      expect(defaultApiValue.loadDiscoveredInstitutions).toBeDefined()
      const result = await defaultApiValue.loadDiscoveredInstitutions!({
        iso_country_code: 'US',
      })
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have loadInstitutionByCode function', async () => {
      expect(defaultApiValue.loadInstitutionByCode).toBeDefined()
      const result = await defaultApiValue.loadInstitutionByCode!('mxbank')
      expect(result).toBeDefined()
    })

    it('should have loadInstitutions function', async () => {
      expect(defaultApiValue.loadInstitutions).toBeDefined()
      const result = await defaultApiValue.loadInstitutions({
        routing_number: '123456789',
        account_verification_is_enabled: true,
        account_identification_is_enabled: false,
      })
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have loadInstitutionByGuid function', async () => {
      expect(defaultApiValue.loadInstitutionByGuid).toBeDefined()
      const result = await defaultApiValue.loadInstitutionByGuid('INS-123')
      expect(result).toBeDefined()
    })

    it('should have loadPopularInstitutions function', async () => {
      expect(defaultApiValue.loadPopularInstitutions).toBeDefined()
      const result = await defaultApiValue.loadPopularInstitutions({})
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have createMicrodeposit function', async () => {
      expect(defaultApiValue.createMicrodeposit).toBeDefined()
      const result = await defaultApiValue.createMicrodeposit!({} as MicrodepositCreateType)
      expect(result).toBeDefined()
    })

    it('should have loadMicrodepositByGuid function', async () => {
      expect(defaultApiValue.loadMicrodepositByGuid).toBeDefined()
      const result = await defaultApiValue.loadMicrodepositByGuid!('MICRO-123')
      expect(result).toBeDefined()
    })

    it('should have refreshMicrodepositStatus function', async () => {
      expect(defaultApiValue.refreshMicrodepositStatus).toBeDefined()
      await expect(defaultApiValue.refreshMicrodepositStatus!('MICRO-123')).resolves.toBeUndefined()
    })

    it('should have updateMicrodeposit function', async () => {
      expect(defaultApiValue.updateMicrodeposit).toBeDefined()
      const result = await defaultApiValue.updateMicrodeposit!(
        'MICRO-123',
        {} as MicrodepositUpdateType,
      )
      expect(result).toBeDefined()
    })

    it('should have verifyMicrodeposit function', async () => {
      expect(defaultApiValue.verifyMicrodeposit).toBeDefined()
      const result = await defaultApiValue.verifyMicrodeposit!(
        'MICRO-123',
        {} as MicroDepositVerifyType,
      )
      expect(result).toBeDefined()
    })

    it('should have verifyRoutingNumber function', async () => {
      expect(defaultApiValue.verifyRoutingNumber).toBeDefined()
      const result = await defaultApiValue.verifyRoutingNumber!('123456789', true)
      expect(result).toBeDefined()
    })

    it('should have updateMFA function', async () => {
      expect(defaultApiValue.updateMFA).toBeDefined()
      const result = await defaultApiValue.updateMFA({}, {} as ClientConfigType, true)
      expect(result).toBeDefined()
    })

    it('should have loadOAuthState function', async () => {
      expect(defaultApiValue.loadOAuthState).toBeDefined()
      const result = await defaultApiValue.loadOAuthState('OAUTH-123')
      expect(result).toBeDefined()
    })

    it('should have loadOAuthStates function', async () => {
      expect(defaultApiValue.loadOAuthStates).toBeDefined()
      const result = await defaultApiValue.loadOAuthStates({
        outbound_member_guid: 'MEM-123',
        auth_status: 'pending',
      })
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have oAuthStart function', async () => {
      expect(defaultApiValue.oAuthStart).toBeDefined()
      await expect(defaultApiValue.oAuthStart!({ member: {} })).resolves.toBeUndefined()
    })

    it('should have createSupportTicket function', async () => {
      expect(defaultApiValue.createSupportTicket).toBeDefined()
      await expect(
        defaultApiValue.createSupportTicket!({} as SupportTicketType),
      ).resolves.toBeUndefined()
    })

    it('should have loadJob function', async () => {
      expect(defaultApiValue.loadJob).toBeDefined()
      const result = await defaultApiValue.loadJob('JOB-123')
      expect(result).toBeDefined()
    })

    it('should have runJob function', async () => {
      expect(defaultApiValue.runJob).toBeDefined()
      const result = await defaultApiValue.runJob(
        'aggregate',
        'MEM-123',
        {} as ClientConfigType,
        true,
      )
      expect(result).toBeDefined()
    })

    it('should have updateUserProfile function', async () => {
      expect(defaultApiValue.updateUserProfile).toBeDefined()
      const result = await defaultApiValue.updateUserProfile!({
        userProfile: {},
        too_small_modal_dismissed_at: '2024-01-01',
      })
      expect(result).toBeDefined()
    })
  })

  describe('Integration tests', () => {
    it('should allow calling API methods from components', async () => {
      const user = userEvent.setup()
      const mockLoadMembers = vi.fn(() =>
        Promise.resolve([
          { guid: 'MEM-1', name: 'Member 1' },
          { guid: 'MEM-2', name: 'Member 2' },
        ] as MemberResponseType[]),
      )

      const TestComponentWithApi = () => {
        const { api } = useApi()
        const [members, setMembers] = React.useState<MemberResponseType[]>([])

        const handleLoad = async () => {
          const result = await api.loadMembers()
          setMembers(result)
        }

        return (
          <div>
            <button onClick={handleLoad}>Load</button>
            <div data-test="member-count">{members.length}</div>
          </div>
        )
      }

      const { getByText, getByTestId } = rtlRender(
        <ApiProvider apiValue={{ loadMembers: mockLoadMembers } as unknown as ApiContextTypes}>
          <TestComponentWithApi />
        </ApiProvider>,
      )

      expect(getByTestId('member-count')).toHaveTextContent('0')

      await user.click(getByText('Load'))

      expect(mockLoadMembers).toHaveBeenCalled()
      expect(getByTestId('member-count')).toHaveTextContent('2')
    })

    it('should allow multiple components to access the same API context', () => {
      const Component1 = () => {
        const { api } = useApi()
        return <div data-test="comp1">{api ? 'Has API' : 'No API'}</div>
      }

      const Component2 = () => {
        const { api } = useApi()
        return <div data-test="comp2">{api ? 'Has API' : 'No API'}</div>
      }

      rtlRender(
        <ApiProvider apiValue={{} as ApiContextTypes}>
          <Component1 />
          <Component2 />
        </ApiProvider>,
      )

      expect(screen.getByTestId('comp1')).toHaveTextContent('Has API')
      expect(screen.getByTestId('comp2')).toHaveTextContent('Has API')
    })
  })
})
