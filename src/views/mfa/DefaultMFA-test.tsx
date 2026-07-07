import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { DefaultMFA } from 'src/views/mfa/DefaultMFA'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { sha256 } from 'js-sha256'
import { institutionData, member, MFA_CREDENTIALS } from 'src/services/mockedData'

type MfaCredential = {
  guid: string
  label: string
  [key: string]: unknown
}

describe('<DefaultMFA />', () => {
  const currentMember = member.member
  const institution = institutionData.institution
  const [securityQuestion] = MFA_CREDENTIALS
  const pinCredential: MfaCredential = {
    guid: 'CRD-002',
    label: 'PIN',
    field_name: 'PIN',
    field_type: 0,
  }

  let onAnalyticsEvent: ReturnType<typeof vi.fn>
  let onSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAnalyticsEvent = vi.fn()
    onSubmit = vi.fn()
  })

  const renderDefaultMFA = (
    mfaCredentials: MfaCredential[] = MFA_CREDENTIALS,
    isSubmitting = false,
  ) =>
    render(
      <DefaultMFA
        currentMember={currentMember}
        institution={institution}
        isSubmitting={isSubmitting}
        mfaCredentials={mfaCredentials}
        onSubmit={onSubmit}
      />,
      { onAnalyticsEvent },
    )

  describe('Content Display', () => {
    it('renders the credential prompt, required note, and continue button', () => {
      renderDefaultMFA()

      expect(screen.getByText(securityQuestion.label, { exact: false })).toBeInTheDocument()
      expect(screen.getByText(/required/i)).toBeInTheDocument()
      expect(screen.getByTestId('continue-button')).toHaveTextContent('Continue')
    })

    it('renders an input for each MFA credential', () => {
      renderDefaultMFA([securityQuestion, pinCredential])

      expect(screen.getByText(securityQuestion.label, { exact: false })).toBeInTheDocument()
      expect(screen.getByText('PIN', { exact: false })).toBeInTheDocument()
      expect(screen.getAllByRole('textbox')).toHaveLength(2)
    })

    it.each(['meta_data', 'image_data'])('renders the challenge image provided via %s', (field) => {
      renderDefaultMFA([{ ...securityQuestion, [field]: 'data:image/png;base64,abc123' }])

      expect(screen.getByAltText('Challenge Image')).toHaveAttribute(
        'src',
        'data:image/png;base64,abc123',
      )
    })

    it('does not render a challenge image when none is provided', () => {
      renderDefaultMFA()

      expect(screen.queryByAltText('Challenge Image')).not.toBeInTheDocument()
    })
  })

  describe('Submitting State', () => {
    it('shows a checking label and disables the input while submitting', () => {
      renderDefaultMFA(MFA_CREDENTIALS, true)

      expect(screen.getByTestId('continue-button')).toHaveTextContent(/Checking/i)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('submits the entered credential value', async () => {
      const { user } = renderDefaultMFA()

      await user.type(screen.getByRole('textbox'), '123456')
      await user.click(screen.getByTestId('continue-button'))

      expect(onSubmit).toHaveBeenCalledWith([{ guid: securityQuestion.guid, value: '123456' }])
    })

    it('submits a value for every credential', async () => {
      const { user } = renderDefaultMFA([securityQuestion, pinCredential])

      const inputs = screen.getAllByRole('textbox')
      await user.type(inputs[0], '123456')
      await user.type(inputs[1], '9876')
      await user.click(screen.getByTestId('continue-button'))

      expect(onSubmit).toHaveBeenCalledWith([
        { guid: securityQuestion.guid, value: '123456' },
        { guid: pinCredential.guid, value: '9876' },
      ])
    })
  })

  describe('Form Validation', () => {
    it('does not submit and shows a required error when the field is empty', async () => {
      const { user } = renderDefaultMFA()

      await user.click(screen.getByTestId('continue-button'))

      const errors = await screen.findAllByText((content) =>
        content.includes(`${securityQuestion.label} is required`),
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Analytics', () => {
    it('sends the MFA entered-input event only on the first keystroke', async () => {
      const { user } = renderDefaultMFA()
      const input = screen.getByRole('textbox')

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
      expect(onAnalyticsEvent).toHaveBeenCalledTimes(1)

      await user.type(input, '23456')

      expect(onAnalyticsEvent).toHaveBeenCalledTimes(1)
    })
  })
})
