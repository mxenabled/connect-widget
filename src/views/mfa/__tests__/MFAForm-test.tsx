import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { MFAForm } from '../MFAForm'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { sha256 } from 'js-sha256'
import { member, institutionData, MFA_CREDENTIALS } from 'src/services/mockedData'
import { CredentialTypes } from 'src/const/Credential'

type MFAOption = {
  guid: string
  credential_guid: string
  label: string
  value: string
  data_uri?: string
}

type MFACredential = Omit<(typeof MFA_CREDENTIALS)[0], 'options'> & {
  options?: MFAOption[]
}

describe('<MFAForm />', () => {
  let onAnalyticsEvent: ReturnType<typeof vi.fn>
  const mockOnSubmit = vi.fn()

  const institution = institutionData.institution

  const createMember = (credentials: MFACredential[] = MFA_CREDENTIALS) => ({
    ...member.member,
    mfa: {
      credentials,
    },
  })

  const defaultProps = {
    currentMember: createMember(),
    institution,
    isSubmitting: false,
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    onAnalyticsEvent = vi.fn()
  })

  describe('Title Display', () => {
    it('renders "Verify identity" title for regular MFA', () => {
      render(<MFAForm {...defaultProps} />, { onAnalyticsEvent })

      expect(screen.getByText('Verify identity')).toBeInTheDocument()
    })

    it('renders "Account selection" title for single account select', () => {
      const sasCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          external_id: 'single_account_select',
        },
      ]

      const sasProps = {
        ...defaultProps,
        currentMember: createMember(sasCredentials),
      }

      render(<MFAForm {...sasProps} />, { onAnalyticsEvent })

      expect(screen.getByText('Account selection')).toBeInTheDocument()
    })
  })

  describe('Form Type Selection', () => {
    it('renders DefaultMFA for TEXT field type', () => {
      const textCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.TEXT,
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(textCredentials),
      }

      render(<MFAForm {...props} />, { onAnalyticsEvent })

      expect(screen.getByText(new RegExp(MFA_CREDENTIALS[0].label))).toBeInTheDocument()
      expect(screen.getByTestId('continue-button')).toBeInTheDocument()
    })

    it('renders MFAOptions for OPTIONS field type', () => {
      const optionsCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.OPTIONS,
          options: [
            {
              guid: 'OPT-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 1',
              value: '1',
            },
            {
              guid: 'OPT-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 2',
              value: '2',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(optionsCredentials),
      }

      render(<MFAForm {...props} />, { onAnalyticsEvent })

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('renders MFAImages for IMAGE_OPTIONS field type', () => {
      const imageCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.IMAGE_OPTIONS,
          options: [
            {
              guid: 'IMG-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 1',
              value: '1',
              data_uri: 'data:image/png;base64,abc',
            },
            {
              guid: 'IMG-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 2',
              value: '2',
              data_uri: 'data:image/png;base64,def',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(imageCredentials),
      }

      render(<MFAForm {...props} />, { onAnalyticsEvent })

      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit with credentials from DefaultMFA', async () => {
      const { user } = render(<MFAForm {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, 'test123')

      const submitButton = screen.getByTestId('continue-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith([
          {
            guid: MFA_CREDENTIALS[0].guid,
            value: 'test123',
          },
        ])
      })
    })

    it('calls onSubmit with credentials from MFAOptions', async () => {
      const optionsCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.OPTIONS,
          options: [
            {
              guid: 'OPT-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 1',
              value: 'option1',
            },
            {
              guid: 'OPT-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 2',
              value: 'option2',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(optionsCredentials),
      }

      const { user } = render(<MFAForm {...props} />, { onAnalyticsEvent })

      const option1 = screen.getByText('Option 1')
      await user.click(option1)

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith([
          {
            guid: MFA_CREDENTIALS[0].guid,
            value: 'OPT-001',
          },
        ])
      })
    })

    it('calls onSubmit with credentials from MFAImages', async () => {
      const imageCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.IMAGE_OPTIONS,
          options: [
            {
              guid: 'IMG-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 1',
              value: 'image1',
              data_uri: 'data:image/png;base64,abc',
            },
            {
              guid: 'IMG-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 2',
              value: 'image2',
              data_uri: 'data:image/png;base64,def',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(imageCredentials),
      }

      const { user } = render(<MFAForm {...props} />, { onAnalyticsEvent })

      const images = screen.getAllByRole('img')
      await user.click(images[0])

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith([
          {
            guid: MFA_CREDENTIALS[0].guid,
            value: 'IMG-001',
          },
        ])
      })
    })
  })

  describe('Analytics', () => {
    it('sends MFA_SUBMITTED_INPUT event for default form submission', async () => {
      const { user } = render(<MFAForm {...defaultProps} />, { onAnalyticsEvent })

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, 'test123')

      const submitButton = screen.getByTestId('continue-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onAnalyticsEvent).toHaveBeenCalledWith(
          `connect_${AnalyticEvents.MFA_SUBMITTED_INPUT}`,
          expect.objectContaining({
            institution_guid: institution.guid,
            institution_name: institution.name,
            member_guid: sha256(defaultProps.currentMember.guid),
            widgetType: defaultEventMetadata.widgetType,
          }),
        )
      })
    })

    it('sends MFA_SUBMITTED_OPTION event for options form submission', async () => {
      const optionsCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.OPTIONS,
          options: [
            {
              guid: 'OPT-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 1',
              value: 'option1',
            },
            {
              guid: 'OPT-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 2',
              value: 'option2',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(optionsCredentials),
      }

      const { user } = render(<MFAForm {...props} />, { onAnalyticsEvent })

      const option1 = screen.getByText('Option 1')
      await user.click(option1)

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onAnalyticsEvent).toHaveBeenCalledWith(
          `connect_${AnalyticEvents.MFA_SUBMITTED_OPTION}`,
          expect.objectContaining({
            institution_guid: institution.guid,
            institution_name: institution.name,
            member_guid: sha256(props.currentMember.guid),
            widgetType: defaultEventMetadata.widgetType,
          }),
        )
      })
    })

    it('sends MFA_SUBMITTED_IMAGE event for images form submission', async () => {
      const imageCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.IMAGE_OPTIONS,
          options: [
            {
              guid: 'IMG-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 1',
              value: 'image1',
              data_uri: 'data:image/png;base64,abc',
            },
            {
              guid: 'IMG-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 2',
              value: 'image2',
              data_uri: 'data:image/png;base64,def',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(imageCredentials),
      }

      const { user } = render(<MFAForm {...props} />, { onAnalyticsEvent })

      const images = screen.getAllByRole('img')
      await user.click(images[0])

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onAnalyticsEvent).toHaveBeenCalledWith(
          `connect_${AnalyticEvents.MFA_SUBMITTED_IMAGE}`,
          expect.objectContaining({
            institution_guid: institution.guid,
            institution_name: institution.name,
            member_guid: sha256(props.currentMember.guid),
            widgetType: defaultEventMetadata.widgetType,
          }),
        )
      })
    })
  })

  describe('Props Passing', () => {
    it('passes isSubmitting prop to DefaultMFA', () => {
      const props = {
        ...defaultProps,
        isSubmitting: true,
      }

      render(<MFAForm {...props} />, { onAnalyticsEvent })

      expect(screen.getByTestId('continue-button')).toHaveTextContent(/Checking/i)
    })

    it('passes isSubmitting prop to MFAOptions', () => {
      const optionsCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.OPTIONS,
          options: [
            {
              guid: 'OPT-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 1',
              value: '1',
            },
            {
              guid: 'OPT-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Option 2',
              value: '2',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(optionsCredentials),
        isSubmitting: true,
      }

      render(<MFAForm {...props} />, { onAnalyticsEvent })

      expect(screen.getByRole('button', { name: /checking/i })).toBeInTheDocument()
    })

    it('passes isSubmitting prop to MFAImages', () => {
      const imageCredentials: MFACredential[] = [
        {
          ...MFA_CREDENTIALS[0],
          field_type: CredentialTypes.IMAGE_OPTIONS,
          options: [
            {
              guid: 'IMG-001',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 1',
              value: '1',
              data_uri: 'data:image/png;base64,abc',
            },
            {
              guid: 'IMG-002',
              credential_guid: MFA_CREDENTIALS[0].guid,
              label: 'Image 2',
              value: '2',
              data_uri: 'data:image/png;base64,def',
            },
          ],
        },
      ]

      const props = {
        ...defaultProps,
        currentMember: createMember(imageCredentials),
        isSubmitting: true,
      }

      render(<MFAForm {...props} />, { onAnalyticsEvent })

      expect(screen.getByRole('button', { name: /checking/i })).toBeInTheDocument()
    })
  })
})
