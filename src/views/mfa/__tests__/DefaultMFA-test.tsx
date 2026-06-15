import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { DefaultMFA } from '../DefaultMFA'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { sha256 } from 'js-sha256'
import { member, institutionData, MFA_CREDENTIALS } from 'src/services/mockedData'

describe('<DefaultMFA />', () => {
  let onAnalyticsEvent: ReturnType<typeof vi.fn>
  const mockOnSubmit = vi.fn()

  const currentMember = member.member
  const institution = institutionData.institution
  const mfaCredentials = MFA_CREDENTIALS

  const defaultProps = {
    currentMember,
    institution,
    isSubmitting: false,
    mfaCredentials,
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    onAnalyticsEvent = vi.fn()
  })

  describe('Content Display', () => {
    it('renders the MFA credential label', () => {
      render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      expect(screen.getByText(new RegExp(MFA_CREDENTIALS[0].label))).toBeInTheDocument()
    })

    it('renders multiple MFA credential fields', () => {
      const multiCredentialProps = {
        ...defaultProps,
        mfaCredentials: [
          ...MFA_CREDENTIALS,
          {
            guid: 'CRD-002',
            label: 'PIN',
            field_name: 'PIN',
            field_type: 0,
          },
        ],
      }

      render(<DefaultMFA {...multiCredentialProps} />, { onAnalyticsEvent })

      expect(screen.getByText(new RegExp(MFA_CREDENTIALS[0].label))).toBeInTheDocument()
      expect(screen.getByText(/PIN/)).toBeInTheDocument()
    })

    it('renders required asterisk for each field', () => {
      render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const labels = screen.getAllByText('*')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('renders required field note', () => {
      render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })

    it('renders continue button', () => {
      render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      expect(screen.getByTestId('continue-button')).toHaveTextContent('Continue')
    })

    it('renders image when meta_data is present', () => {
      const propsWithImage = {
        ...defaultProps,
        mfaCredentials: [
          {
            ...MFA_CREDENTIALS[0],
            meta_data: 'data:image/png;base64,abc123',
          },
        ],
      }

      render(<DefaultMFA {...propsWithImage} />, { onAnalyticsEvent })

      const image = screen.getByAltText(/Challenge Image/i)
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'data:image/png;base64,abc123')
    })

    it('renders image when image_data is present', () => {
      const propsWithImage = {
        ...defaultProps,
        mfaCredentials: [
          {
            ...MFA_CREDENTIALS[0],
            image_data: 'data:image/png;base64,xyz789',
          },
        ],
      }

      render(<DefaultMFA {...propsWithImage} />, { onAnalyticsEvent })

      const image = screen.getByAltText(/Challenge Image/i)
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'data:image/png;base64,xyz789')
    })

    it('does not render image when no meta_data or image_data', () => {
      render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      expect(screen.queryByAltText(/Challenge Image/i)).not.toBeInTheDocument()
    })
  })

  describe('Submitting State', () => {
    it('shows "Checking..." text when isSubmitting is true', () => {
      const submittingProps = { ...defaultProps, isSubmitting: true }
      render(<DefaultMFA {...submittingProps} />, { onAnalyticsEvent })

      expect(screen.getByTestId('continue-button')).toHaveTextContent(/Checking/i)
    })

    it('disables input fields when isSubmitting is true', () => {
      const submittingProps = { ...defaultProps, isSubmitting: true }
      render(<DefaultMFA {...submittingProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      expect(input).toBeDisabled()
    })

    it('shows "Continue" text when isSubmitting is false', () => {
      render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      expect(screen.getByTestId('continue-button')).toHaveTextContent('Continue')
    })
  })

  describe('User Interactions', () => {
    it('can enter MFA code', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, '123456')

      expect(input).toHaveValue('123456')
    })

    it('can enter multiple MFA codes', async () => {
      const multiCredentialProps = {
        ...defaultProps,
        mfaCredentials: [
          ...MFA_CREDENTIALS,
          {
            guid: 'CRD-002',
            label: 'PIN',
            field_name: 'PIN',
            field_type: 0,
          },
        ],
      }

      const { user } = render(<DefaultMFA {...multiCredentialProps} />, { onAnalyticsEvent })

      const inputs = screen.getAllByRole('textbox')
      const securityCodeInput = inputs[0]
      const pinInput = inputs[1]

      await user.type(securityCodeInput, '123456')
      await user.type(pinInput, '9876')

      expect(securityCodeInput).toHaveValue('123456')
      expect(pinInput).toHaveValue('9876')
    })

    it('submits the form with correct payload when continue is clicked', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, '123456')

      const continueButton = screen.getByTestId('continue-button')
      await user.click(continueButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith([
          {
            guid: MFA_CREDENTIALS[0].guid,
            value: '123456',
          },
        ])
      })
    })

    it('submits multiple credentials with correct payload', async () => {
      const multiCredentialProps = {
        ...defaultProps,
        mfaCredentials: [
          ...MFA_CREDENTIALS,
          {
            guid: 'CRD-002',
            label: 'PIN',
            field_name: 'PIN',
            field_type: 0,
          },
        ],
      }

      const { user } = render(<DefaultMFA {...multiCredentialProps} />, { onAnalyticsEvent })

      const inputs = screen.getAllByRole('textbox')
      await user.type(inputs[0], '123456')
      await user.type(inputs[1], '9876')

      const continueButton = screen.getByTestId('continue-button')
      await user.click(continueButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith([
          {
            guid: MFA_CREDENTIALS[0].guid,
            value: '123456',
          },
          {
            guid: 'CRD-002',
            value: '9876',
          },
        ])
      })
    })
  })

  describe('Form Validation', () => {
    it('shows validation error when required field is empty', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const continueButton = screen.getByTestId('continue-button')
      await user.click(continueButton)

      await waitFor(() => {
        const errors = screen.getAllByText((content) => {
          return content.includes(`${MFA_CREDENTIALS[0].label} is required`)
        })
        expect(errors.length).toBeGreaterThan(0)
      })
    })

    it('does not call onSubmit when validation fails', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const continueButton = screen.getByTestId('continue-button')
      await user.click(continueButton)

      await waitFor(() => {
        const errors = screen.getAllByText((content) => {
          return content.includes(`${MFA_CREDENTIALS[0].label} is required`)
        })
        expect(errors.length).toBeGreaterThan(0)
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('validates all required fields', async () => {
      const multiCredentialProps = {
        ...defaultProps,
        mfaCredentials: [
          ...MFA_CREDENTIALS,
          {
            guid: 'CRD-002',
            label: 'PIN',
            field_name: 'PIN',
            field_type: 0,
          },
        ],
      }

      const { user } = render(<DefaultMFA {...multiCredentialProps} />, { onAnalyticsEvent })

      const continueButton = screen.getByTestId('continue-button')
      await user.click(continueButton)

      await waitFor(() => {
        const mfaErrors = screen.getAllByText((content) => {
          return content.includes(`${MFA_CREDENTIALS[0].label} is required`)
        })
        const pinErrors = screen.getAllByText(/PIN is required/i)
        expect(mfaErrors.length).toBeGreaterThan(0)
        expect(pinErrors.length).toBeGreaterThan(0)
      })
    })

    it('submits successfully when all required fields are filled', async () => {
      const multiCredentialProps = {
        ...defaultProps,
        mfaCredentials: [
          ...MFA_CREDENTIALS,
          {
            guid: 'CRD-002',
            label: 'PIN',
            field_name: 'PIN',
            field_type: 0,
          },
        ],
      }

      const { user } = render(<DefaultMFA {...multiCredentialProps} />, { onAnalyticsEvent })

      // First, try to submit without filling fields
      const continueButton = screen.getByTestId('continue-button')
      await user.click(continueButton)

      await waitFor(() => {
        const errors = screen.getAllByText((content) => {
          return content.includes(`${MFA_CREDENTIALS[0].label} is required`)
        })
        expect(errors.length).toBeGreaterThan(0)
      })

      // Fill in the fields
      const inputs = screen.getAllByRole('textbox')
      await user.type(inputs[0], '123456')
      await user.type(inputs[1], '9876')

      // Submit again
      await user.click(continueButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith([
          { guid: MFA_CREDENTIALS[0].guid, value: '123456' },
          { guid: 'CRD-002', value: '9876' },
        ])
      })
    })
  })

  describe('Analytics', () => {
    it('sends MFA_ENTERED_INPUT event on first input', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, '1')

      expect(onAnalyticsEvent).toHaveBeenCalledWith(
        `connect_${AnalyticEvents.MFA_ENTERED_INPUT}`,
        expect.objectContaining({
          institution_guid: institution.guid,
          institution_name: institution.name,
          member_guid: sha256(currentMember.guid),
          widgetType: defaultEventMetadata.widgetType,
        }),
      )
    })

    it('sends MFA_ENTERED_INPUT event only once per mount', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, '123456')

      expect(onAnalyticsEvent).toHaveBeenCalledTimes(1)
    })

    it('does not send analytics event on subsequent inputs', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, '1')

      expect(onAnalyticsEvent).toHaveBeenCalledTimes(1)

      onAnalyticsEvent.mockClear()

      await user.type(input, '23456')

      expect(onAnalyticsEvent).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('announces validation errors via AriaLive', async () => {
      const { user } = render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const continueButton = screen.getByTestId('continue-button')
      await user.click(continueButton)

      await waitFor(() => {
        const ariaLive = document.querySelector('[aria-live="assertive"]')
        expect(ariaLive).toBeInTheDocument()
        expect(ariaLive?.textContent).toContain(`${MFA_CREDENTIALS[0].label} is required`)
      })
    })

    it('has proper aria-labelledby on input fields', () => {
      render(<DefaultMFA {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      expect(input).toHaveAttribute('aria-labelledby', 'label-for-mfa-text-field')
    })
  })
})
