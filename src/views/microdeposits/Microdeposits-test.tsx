import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Microdeposits as MicrodepositsComponent } from 'src/views/microdeposits/Microdeposits'
import { render, screen } from 'src/utilities/testingLibrary'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

const Microdeposits = MicrodepositsComponent as unknown as React.ComponentType<
  Record<string, unknown>
>

interface Microdeposit {
  guid?: string
  status?: number
  account_number?: string
  routing_number?: string
  account_type?: number
  first_name?: string
  last_name?: string
  email?: string
}

type ApiOverrides = Record<string, unknown>

describe('Microdeposits', () => {
  const microdeposit = (overrides: Partial<Microdeposit> = {}): Microdeposit => ({
    guid: 'MD-123',
    status: MicrodepositsStatuses.INITIATED,
    account_number: '1234567890',
    routing_number: '987654321',
    account_type: 0,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    ...overrides,
  })

  const renderWithoutGuid = (apiOverrides: ApiOverrides = {}) =>
    render(<Microdeposits microdepositGuid={null} stepToIAV={() => {}} />, {
      apiValue: { ...apiValueMock, ...apiOverrides } as unknown as typeof apiValueMock,
    })

  const renderWithGuid = (status: number, apiOverrides: ApiOverrides = {}) =>
    render(<Microdeposits microdepositGuid="MD-123" stepToIAV={() => {}} />, {
      apiValue: {
        ...apiValueMock,
        loadMicrodepositByGuid: vi
          .fn()
          .mockResolvedValueOnce(microdeposit({ status: MicrodepositsStatuses.PREINITIATED }))
          .mockResolvedValue(microdeposit({ status })),
        refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
        ...apiOverrides,
      } as unknown as typeof apiValueMock,
    })

  describe('Without a microdeposit guid', () => {
    it('starts the user on the routing number step', async () => {
      renderWithoutGuid()

      expect(await screen.findByText('Enter routing number')).toBeInTheDocument()
      expect(screen.getByText('Private and secure')).toBeInTheDocument()
    })
  })

  describe('Resuming an existing microdeposit by guid', () => {
    it('resumes on the come-back step for an initiated microdeposit', async () => {
      renderWithGuid(MicrodepositsStatuses.INITIATED)

      expect(await screen.findByText('Check back soon', {}, { timeout: 4000 })).toBeInTheDocument()
    })

    it('resumes on the verify-deposits step once deposits have landed', async () => {
      renderWithGuid(MicrodepositsStatuses.DEPOSITED)

      expect(
        await screen.findByText('Enter deposit amounts', {}, { timeout: 4000 }),
      ).toBeInTheDocument()
    })

    it('resumes on the verified step for a verified microdeposit', async () => {
      renderWithGuid(MicrodepositsStatuses.VERIFIED)

      expect(
        await screen.findByText('Deposits verified', {}, { timeout: 4000 }),
      ).toBeInTheDocument()
    })

    it('resumes on the error step for an errored microdeposit', async () => {
      renderWithGuid(MicrodepositsStatuses.ERRORED)

      expect(
        await screen.findByText('Something went wrong', {}, { timeout: 4000 }),
      ).toBeInTheDocument()
    })
  })
})
