import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { ConsentModal } from 'src/views/consent/ConsentModal'
import { initialState } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'

const mockInstitution = {
  guid: 'INS-123',
  name: 'Test Bank',
  logo_url: 'https://example.com/logo.png',
}

const renderConsentStep = () =>
  render(
    <RenderConnectStep
      availableAccountTypes={[]}
      handleConsentGoBack={() => {}}
      handleCredentialsGoBack={() => {}}
      navigationRef={React.createRef()}
      onManualAccountAdded={() => {}}
      onUpsertMember={() => {}}
      setConnectLocalState={() => {}}
    />,
    {
      preloadedState: {
        ...initialState,
        connect: {
          ...initialState.connect,
          location: [{ step: STEPS.CONSENT }],
          selectedInstitution: mockInstitution,
        },
      },
    },
  )

describe('ConsentModal', () => {
  const mockSetDialogIsOpen = vi.fn()
  const defaultProps = {
    dialogIsOpen: true,
    setDialogIsOpen: mockSetDialogIsOpen,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the modal with its content when dialogIsOpen is true', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Who is MX Technologies?')).toBeInTheDocument()
      expect(
        screen.getByText(
          /MX is a trusted financial data platform that securely connects your accounts/i,
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('MX promise:')).toBeInTheDocument()
    })

    it('should render the secure, control, and private promise sections', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Secure:')).toBeInTheDocument()
      expect(
        screen.getByText('Industry-standard encryption protects your data.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Control:')).toBeInTheDocument()
      expect(screen.getByText('You can manage and revoke access anytime.')).toBeInTheDocument()
      expect(screen.getByText('Private:')).toBeInTheDocument()
      expect(
        screen.getByText('Your data is never sold or shared without consent.'),
      ).toBeInTheDocument()
    })

    it('should not render the modal when dialogIsOpen is false', () => {
      render(<ConsentModal {...defaultProps} dialogIsOpen={false} />)

      expect(screen.queryByText('Who is MX Technologies?')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should close the modal when the Close button is clicked', async () => {
      const { user } = renderConsentStep()

      await user.click(screen.getByTestId('info-button'))
      expect(screen.getByText('Who is MX Technologies?')).toBeInTheDocument()

      await user.click(screen.getByText('Close'))

      expect(screen.queryByText('Who is MX Technologies?')).not.toBeInTheDocument()
    })

    it('should close the modal when dismissed with Escape', async () => {
      const { user } = renderConsentStep()

      await user.click(screen.getByTestId('info-button'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should open the MX company page when Learn more is clicked', async () => {
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
      const { user } = render(<ConsentModal {...defaultProps} />)

      await user.click(screen.getByText('Learn more'))

      expect(openSpy).toHaveBeenCalledWith('https://www.mx.com/company/', '_blank')

      openSpy.mockRestore()
    })
  })
})
