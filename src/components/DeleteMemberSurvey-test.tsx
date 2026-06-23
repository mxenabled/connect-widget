import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { DeleteMemberSurvey, DELETE_REASONS } from 'src/components/DeleteMemberSurvey'
import { initialState, CONNECTED_MEMBER } from 'src/services/mockedData'
import userEvent from '@testing-library/user-event'
import { apiValue as mockApiValue } from 'src/const/apiProviderMock'
import { ReadableStatuses } from 'src/const/Statuses'

describe('DeleteMemberSurvey', () => {
  const preloadedState = initialState

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DeleteMemberSurvey
        isOpen={false}
        member={CONNECTED_MEMBER}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders when isOpen is true', () => {
    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    expect(screen.getByText('Disconnect institution')).toBeInTheDocument()
    expect(screen.getByTestId('disconnect-disclaimer').textContent).toContain('Chase Bank')
  })

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={onClose}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    await user.click(screen.getByTestId('disconnect-cancel-button'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows connected member reasons', () => {
    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    expect(screen.getByText(DELETE_REASONS.NO_LONGER_USE_ACCOUNT)).toBeInTheDocument()
    expect(screen.getByText(DELETE_REASONS.DONT_WANT_SHARE_DATA)).toBeInTheDocument()
    expect(screen.queryByText(DELETE_REASONS.UNABLE_CONNECT_ACCOUNT)).not.toBeInTheDocument()
  })

  it('shows non-connected member reasons', () => {
    const nonConnectedMember = {
      ...CONNECTED_MEMBER,
      connection_status: ReadableStatuses.PREVENTED,
    }
    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={nonConnectedMember}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    expect(screen.getByText(DELETE_REASONS.UNABLE_CONNECT_ACCOUNT)).toBeInTheDocument()
    expect(screen.getByText(DELETE_REASONS.ACCOUNT_INFORMATION_OLD)).toBeInTheDocument()
    expect(screen.queryByText(DELETE_REASONS.NO_LONGER_USE_ACCOUNT)).not.toBeInTheDocument()
  })

  it('shows validation error when no reason selected', async () => {
    const user = userEvent.setup()
    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    await user.click(screen.getByTestId('disconnect-button'))

    await waitFor(() => {
      expect(screen.getByText('Choose a reason for deleting')).toBeInTheDocument()
    })
  })

  it('allows selecting a reason', async () => {
    const user = userEvent.setup()
    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    const firstReason = screen.getAllByRole('radio')[0]
    await user.click(firstReason)

    expect(firstReason).toBeChecked()
  })

  it('clears validation error after selecting a reason', async () => {
    const user = userEvent.setup()
    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { preloadedState },
    )

    await user.click(screen.getByTestId('disconnect-button'))

    await waitFor(() => {
      expect(screen.getByText('Choose a reason for deleting')).toBeInTheDocument()
    })

    const firstReason = screen.getAllByRole('radio')[0]
    await user.click(firstReason)

    expect(screen.queryByText('Choose a reason for deleting')).not.toBeInTheDocument()
  })

  it('successfully deletes member when reason selected', async () => {
    const user = userEvent.setup()
    const deleteMemberSpy = vi.fn(() => Promise.resolve())
    const onClose = vi.fn()
    const onMemberDeleted = vi.fn()
    const apiValue = {
      ...mockApiValue,
      deleteMember: deleteMemberSpy,
    }

    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={onClose}
        onMemberDeleted={onMemberDeleted}
      />,
      { apiValue, preloadedState },
    )

    const firstReason = screen.getAllByRole('radio')[0]
    await user.click(firstReason)
    await user.click(screen.getByTestId('disconnect-button'))

    await waitFor(() => {
      expect(deleteMemberSpy).toHaveBeenCalledWith(CONNECTED_MEMBER)
    })

    await waitFor(() => {
      expect(onMemberDeleted).toHaveBeenCalledWith(CONNECTED_MEMBER.guid)
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error message when delete fails', async () => {
    const user = userEvent.setup()
    const apiValue = {
      ...mockApiValue,
      deleteMember: vi.fn(() => Promise.reject(new Error('Delete failed'))),
    }

    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={() => {}}
        onMemberDeleted={() => {}}
      />,
      { apiValue, preloadedState },
    )

    const firstReason = screen.getAllByRole('radio')[0]
    await user.click(firstReason)
    await user.click(screen.getByTestId('disconnect-button'))

    await waitFor(() => {
      expect(screen.getByTestId('disconnect-error-header')).toBeInTheDocument()
    })

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByTestId('disconnect-error-message')).toBeInTheDocument()
  })

  it('dismisses error dialog when ok clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const apiValue = {
      ...mockApiValue,
      deleteMember: vi.fn(() => Promise.reject(new Error('Delete failed'))),
    }

    render(
      <DeleteMemberSurvey
        isOpen={true}
        member={CONNECTED_MEMBER}
        onClose={onClose}
        onMemberDeleted={() => {}}
      />,
      { apiValue, preloadedState },
    )

    const firstReason = screen.getAllByRole('radio')[0]
    await user.click(firstReason)
    await user.click(screen.getByTestId('disconnect-button'))

    await waitFor(() => {
      expect(screen.getByTestId('disconnect-error-header')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('disconnect-ok-button'))

    expect(onClose).toHaveBeenCalled()
  })
})
