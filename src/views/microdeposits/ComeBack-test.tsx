import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Microdeposits as MicrodepositsComponent } from 'src/views/microdeposits/Microdeposits'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { STEPS } from 'src/const/Connect'

const Microdeposits = MicrodepositsComponent as unknown as React.ComponentType<
  Record<string, unknown>
>

describe('ComeBack', () => {
  const microdeposit = {
    guid: 'MD-123',
    account_name: 'My Checking Account',
    status: MicrodepositsStatuses.REQUESTED,
  }
  let loadMicrodepositByGuid: ReturnType<typeof vi.fn>

  beforeEach(() => {
    loadMicrodepositByGuid = vi
      .fn()
      .mockResolvedValueOnce({ ...microdeposit, status: MicrodepositsStatuses.PREINITIATED })
      .mockResolvedValue(microdeposit)
  })

  const renderComeBackStep = () =>
    render(<Microdeposits microdepositGuid={microdeposit.guid} stepToIAV={vi.fn()} />, {
      apiValue: {
        ...apiValueMock,
        loadMicrodepositByGuid,
        refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
      },
      preloadedState: {
        ...initialState,
        connect: { ...initialState.connect, location: [{ step: STEPS.MICRODEPOSITS }] },
      },
    })

  it('shows the come-back message once the microdeposit loads', async () => {
    renderComeBackStep()

    expect(await screen.findByText('Check back soon', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByTestId('thanks-paragraph')).toHaveTextContent('My Checking Account')
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('returns the user to institution search when Done is clicked', async () => {
    const { user, store } = renderComeBackStep()

    const doneButton = await screen.findByRole('button', { name: 'Done' }, { timeout: 4000 })
    await user.click(doneButton)

    await waitFor(() => {
      const { location } = store.getState().connect
      expect(location[location.length - 1].step).toBe(STEPS.SEARCH)
    })
  })
})
