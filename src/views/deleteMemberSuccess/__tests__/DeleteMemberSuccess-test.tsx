import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { DeleteMemberSuccess } from '../DeleteMemberSuccess'
import { initialState, institutionData } from 'src/services/mockedData'

const defaultProps = {
  institution: institutionData.institution,
  onContinueClick: vi.fn(),
}

const preloadedState = {
  ...initialState,
}

const renderWithContext = (props = defaultProps, state = preloadedState) => {
  return render(<DeleteMemberSuccess {...props} />, {
    preloadedState: state,
  })
}

describe('<DeleteMemberSuccess />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content Display', () => {
    it('renders the disconnected primary text', () => {
      renderWithContext()

      expect(screen.getByTestId('disconnected-primary-text')).toHaveTextContent('Disconnected')
    })

    it('renders the disconnected secondary text with institution name', () => {
      renderWithContext()

      expect(screen.getByTestId('disconnected-secondary-text')).toHaveTextContent(
        `You have successfully disconnected ${institutionData.institution.name}.`,
      )
    })

    it('renders the Done button', () => {
      renderWithContext()

      expect(screen.getByTestId('done-button')).toHaveTextContent('Done')
    })

    it('renders the PrivateAndSecure component', () => {
      renderWithContext()

      expect(screen.getByText('Private and secure')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onContinueClick when Done button is clicked', async () => {
      const onContinueClick = vi.fn()
      const { user } = renderWithContext({ ...defaultProps, onContinueClick })

      await user.click(screen.getByTestId('done-button'))

      expect(onContinueClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Props', () => {
    it('displays custom institution name', () => {
      const customInstitution = {
        ...institutionData.institution,
        name: 'Custom Bank',
      }

      renderWithContext({ ...defaultProps, institution: customInstitution })

      expect(screen.getByTestId('disconnected-secondary-text')).toHaveTextContent(
        'You have successfully disconnected Custom Bank.',
      )
    })
  })

  describe('Integration', () => {
    it('renders all sections together', () => {
      renderWithContext()

      expect(screen.getByTestId('disconnected-primary-text')).toBeInTheDocument()
      expect(screen.getByTestId('disconnected-secondary-text')).toBeInTheDocument()
      expect(screen.getByTestId('done-button')).toBeInTheDocument()
      expect(screen.getByText('Private and secure')).toBeInTheDocument()
    })
  })
})
