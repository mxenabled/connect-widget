import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { DeleteMemberSurvey } from 'src/components/DeleteMemberSurvey'
import { initialState, CONNECTED_MEMBER, NON_CONNECTED_MEMBER } from 'src/services/mockedData'
import userEvent from '@testing-library/user-event'

describe('DeleteMemberSurvey', () => {
  const preloadedState = initialState

  const mockOnCancel = vi.fn()
  const mockOnDeleteSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the disconnect institution dialog', () => {
      const { container } = render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).toBeInTheDocument()
    })

    it('renders the disconnect institution heading', () => {
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(screen.getByText('Disconnect institution')).toBeInTheDocument()
    })

    it('renders the disclaimer with member name', () => {
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      const disclaimer = screen.getByTestId('disconnect-disclaimer')
      expect(disclaimer).toBeInTheDocument()
      expect(disclaimer.textContent).toContain('Chase Bank')
    })

    it('renders disconnect and cancel buttons', () => {
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(screen.getByTestId('disconnect-button')).toBeInTheDocument()
      expect(screen.getByTestId('disconnect-cancel-button')).toBeInTheDocument()
    })

    it('renders required field indicator', () => {
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  describe('connected member reasons', () => {
    it('renders correct reasons for connected member', () => {
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(screen.getByText("I no longer use this account or it's not mine")).toBeInTheDocument()
      expect(screen.getByText("I don't want to share my data")).toBeInTheDocument()
      expect(screen.getByText("I don't want to use this app")).toBeInTheDocument()
      expect(screen.getByText('Other')).toBeInTheDocument()
    })

    it('does not render non-connected reasons for connected member', () => {
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(screen.queryByText('I am unable to connect this account here')).not.toBeInTheDocument()
      expect(
        screen.queryByText('The account information is old or inaccurate'),
      ).not.toBeInTheDocument()
      expect(screen.queryByText("I don't want this account connected here")).not.toBeInTheDocument()
    })
  })

  describe('non-connected member reasons', () => {
    it('renders correct reasons for non-connected member', () => {
      render(
        <DeleteMemberSurvey
          member={NON_CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(screen.getByText('I am unable to connect this account here')).toBeInTheDocument()
      expect(screen.getByText('The account information is old or inaccurate')).toBeInTheDocument()
      expect(screen.getByText("I don't want this account connected here")).toBeInTheDocument()
      expect(screen.getByText('Other')).toBeInTheDocument()
    })

    it('does not render connected-only reasons for non-connected member', () => {
      render(
        <DeleteMemberSurvey
          member={NON_CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(
        screen.queryByText("I no longer use this account or it's not mine"),
      ).not.toBeInTheDocument()
      expect(screen.queryByText("I don't want to share my data")).not.toBeInTheDocument()
      expect(screen.queryByText("I don't want to use this app")).not.toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      await user.click(screen.getByTestId('disconnect-cancel-button'))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('allows selecting a reason', async () => {
      const user = userEvent.setup()
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      const options = screen.getAllByRole('radio')
      await user.click(options[0])

      expect(options[0]).toBeChecked()
    })

    it('allows changing selected reason', async () => {
      const user = userEvent.setup()
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      const options = screen.getAllByRole('radio')
      await user.click(options[0])
      expect(options[0]).toBeChecked()

      await user.click(options[1])
      expect(options[1]).toBeChecked()
      expect(options[0]).not.toBeChecked()
    })
  })

  describe('form validation', () => {
    it('shows validation error when disconnect clicked without selecting reason', async () => {
      const user = userEvent.setup()
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      await user.click(screen.getByTestId('disconnect-button'))

      await waitFor(() => {
        expect(screen.getByText('Choose a reason for deleting')).toBeInTheDocument()
      })
    })

    it('does not show validation error before first submit attempt', () => {
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(screen.queryByText('Choose a reason for deleting')).not.toBeInTheDocument()
    })

    it('validation error disappears after selecting a reason', async () => {
      const user = userEvent.setup()
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )
      await user.click(screen.getByTestId('disconnect-button'))

      await waitFor(() => {
        expect(screen.getByText('Choose a reason for deleting')).toBeInTheDocument()
      })
      const options = screen.getAllByRole('radio')
      await user.click(options[0])

      await waitFor(() => {
        expect(screen.queryByText('Choose a reason for deleting')).not.toBeInTheDocument()
      })
    })
  })

  describe('delete member flow', () => {
    it('initiates delete when disconnect clicked with valid selection', async () => {
      const user = userEvent.setup()
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      const options = screen.getAllByRole('radio')
      await user.click(options[0])

      await user.click(screen.getByTestId('disconnect-button'))

      expect(screen.queryByText('Choose a reason for deleting')).not.toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('renders complete structure for connected member', () => {
      const { container } = render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument()
      expect(screen.getByText('Disconnect institution')).toBeInTheDocument()
      expect(screen.getByTestId('disconnect-disclaimer')).toBeInTheDocument()
      expect(screen.getAllByRole('radio').length).toBeGreaterThan(0)
      expect(screen.getByTestId('disconnect-button')).toBeInTheDocument()
      expect(screen.getByTestId('disconnect-cancel-button')).toBeInTheDocument()
    })

    it('renders complete structure for non-connected member', () => {
      const { container } = render(
        <DeleteMemberSurvey
          member={NON_CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument()
      expect(screen.getByText('Disconnect institution')).toBeInTheDocument()
      expect(screen.getByTestId('disconnect-disclaimer').textContent).toContain('Wells Fargo')
      expect(screen.getAllByRole('radio').length).toBeGreaterThan(0)
    })

    it('handles complete user flow from selection to cancel', async () => {
      const user = userEvent.setup()
      render(
        <DeleteMemberSurvey
          member={CONNECTED_MEMBER}
          onCancel={mockOnCancel}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
        { preloadedState },
      )

      const options = screen.getAllByRole('radio')
      await user.click(options[0])
      expect(options[0]).toBeChecked()

      await user.click(screen.getByTestId('disconnect-cancel-button'))
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })
})
