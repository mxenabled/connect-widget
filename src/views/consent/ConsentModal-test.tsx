import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { ConsentModal } from 'src/views/consent/ConsentModal'
import * as globalUtils from 'src/utilities/global'

vi.mock('src/utilities/global', () => ({
  goToUrlLink: vi.fn(),
}))

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
    it('should toggle dialogIsOpen when the Close button is clicked', async () => {
      const { user } = render(<ConsentModal {...defaultProps} />)

      await user.click(screen.getByText('Close'))

      expect(mockSetDialogIsOpen).toHaveBeenCalledWith(expect.any(Function))

      // The updater flips the previous open state.
      const toggle = mockSetDialogIsOpen.mock.calls[0][0]
      expect(toggle(true)).toBe(false)
      expect(toggle(false)).toBe(true)
    })

    it('should toggle dialogIsOpen when the dialog is dismissed with Escape', async () => {
      const { user } = render(<ConsentModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      expect(mockSetDialogIsOpen).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should open the MX company page when Learn more is clicked', async () => {
      const { user } = render(<ConsentModal {...defaultProps} />)

      await user.click(screen.getByText('Learn more'))

      expect(globalUtils.goToUrlLink).toHaveBeenCalledWith('https://www.mx.com/company/')
    })
  })
})
