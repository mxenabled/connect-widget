import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { MFAForm } from 'src/views/mfa/MFAForm'
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
  const institution = institutionData.institution
  const memberGuidHash = sha256(member.member.guid)

  const createMember = (credentials: MFACredential[] = MFA_CREDENTIALS) => ({
    ...member.member,
    mfa: {
      credentials,
    },
  })

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

  let onAnalyticsEvent: ReturnType<typeof vi.fn>
  let onSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAnalyticsEvent = vi.fn()
    onSubmit = vi.fn()
  })

  const renderMFAForm = (currentMember = createMember()) =>
    render(
      <MFAForm
        currentMember={currentMember}
        institution={institution}
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
      { onAnalyticsEvent },
    )

  describe('Title', () => {
    it('renders the verify identity title for a standard MFA challenge', () => {
      renderMFAForm()

      expect(screen.getByText('Verify identity')).toBeInTheDocument()
    })

    it('renders the account selection title for a single account select challenge', () => {
      const sasCredentials: MFACredential[] = [
        { ...MFA_CREDENTIALS[0], external_id: 'single_account_select' },
      ]

      renderMFAForm(createMember(sasCredentials))

      expect(screen.getByText('Account selection')).toBeInTheDocument()
    })
  })

  describe('Submits the selected credentials', () => {
    it('submits the typed value and reports the input event', async () => {
      const { user } = renderMFAForm()

      await user.type(screen.getByRole('textbox'), 'test123')
      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(onSubmit).toHaveBeenCalledWith([{ guid: MFA_CREDENTIALS[0].guid, value: 'test123' }])
      expect(onAnalyticsEvent).toHaveBeenCalledWith(
        `connect_${AnalyticEvents.MFA_SUBMITTED_INPUT}`,
        expect.objectContaining({
          institution_guid: institution.guid,
          institution_name: institution.name,
          member_guid: memberGuidHash,
          widgetType: defaultEventMetadata.widgetType,
        }),
      )
    })

    it('submits the typed value when the user presses Enter in the field', async () => {
      const { user } = renderMFAForm()

      await user.type(screen.getByRole('textbox'), 'test123{Enter}')

      expect(onSubmit).toHaveBeenCalledWith([{ guid: MFA_CREDENTIALS[0].guid, value: 'test123' }])
    })

    it('submits the chosen option and reports the option event', async () => {
      const { user } = renderMFAForm(createMember(optionsCredentials))

      await user.click(screen.getByText('Option 1'))
      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(onSubmit).toHaveBeenCalledWith([{ guid: MFA_CREDENTIALS[0].guid, value: 'OPT-001' }])
      expect(onAnalyticsEvent).toHaveBeenCalledWith(
        `connect_${AnalyticEvents.MFA_SUBMITTED_OPTION}`,
        expect.objectContaining({
          institution_guid: institution.guid,
          institution_name: institution.name,
          member_guid: memberGuidHash,
          widgetType: defaultEventMetadata.widgetType,
        }),
      )
    })

    it('submits the chosen image and reports the image event', async () => {
      const { user } = renderMFAForm(createMember(imageCredentials))

      await user.click(screen.getAllByRole('img')[0])
      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(onSubmit).toHaveBeenCalledWith([{ guid: MFA_CREDENTIALS[0].guid, value: 'IMG-001' }])
      expect(onAnalyticsEvent).toHaveBeenCalledWith(
        `connect_${AnalyticEvents.MFA_SUBMITTED_IMAGE}`,
        expect.objectContaining({
          institution_guid: institution.guid,
          institution_name: institution.name,
          member_guid: memberGuidHash,
          widgetType: defaultEventMetadata.widgetType,
        }),
      )
    })
  })

  describe('Validation', () => {
    it('blocks submission with an error until an option is selected', async () => {
      const { user } = renderMFAForm(createMember(optionsCredentials))

      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(screen.getByText('Choose an option')).toBeInTheDocument()

      await user.click(screen.getByText('Option 1'))
      expect(screen.queryByText('Choose an option')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(onSubmit).toHaveBeenCalledWith([{ guid: MFA_CREDENTIALS[0].guid, value: 'OPT-001' }])
    })

    it('blocks submission with an error until an image is selected', async () => {
      const { user } = renderMFAForm(createMember(imageCredentials))

      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(screen.getByText('Choose an image')).toBeInTheDocument()

      await user.click(screen.getAllByRole('img')[0])
      expect(screen.queryByText('Choose an image')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(onSubmit).toHaveBeenCalledWith([{ guid: MFA_CREDENTIALS[0].guid, value: 'IMG-001' }])
    })

    it('blocks submission with an error until an account is selected', async () => {
      const sasCredentials: MFACredential[] = [
        { ...optionsCredentials[0], external_id: 'single_account_select' },
      ]
      const { user } = renderMFAForm(createMember(sasCredentials))

      expect(screen.getByText('Select an account to connect')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(screen.getByText('Account selection is required.')).toBeInTheDocument()

      await user.click(screen.getByText('Option 1'))
      expect(screen.queryByText('Account selection is required.')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(onSubmit).toHaveBeenCalledWith([{ guid: MFA_CREDENTIALS[0].guid, value: 'OPT-001' }])
    })
  })
})
