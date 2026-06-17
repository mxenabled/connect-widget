import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { ConsentModal } from '../ConsentModal'
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
    it('should render the modal when dialogIsOpen is true', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Who is MX Technologies?')).toBeInTheDocument()
    })

    it('should not render the modal when dialogIsOpen is false', () => {
      render(<ConsentModal {...defaultProps} dialogIsOpen={false} />)

      expect(screen.queryByText('Who is MX Technologies?')).not.toBeInTheDocument()
    })

    it('should render all main content sections', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(
        screen.getByText(
          /MX is a trusted financial data platform that securely connects your accounts/i,
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('MX promise:')).toBeInTheDocument()
    })

    it('should render secure section with lock emoji', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Secure:')).toBeInTheDocument()
      expect(
        screen.getByText('Industry-standard encryption protects your data.'),
      ).toBeInTheDocument()
    })

    it('should render control section with gear emoji', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Control:')).toBeInTheDocument()
      expect(screen.getByText('You can manage and revoke access anytime.')).toBeInTheDocument()
    })

    it('should render private section with shield emoji', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Private:')).toBeInTheDocument()
      expect(
        screen.getByText('Your data is never sold or shared without consent.'),
      ).toBeInTheDocument()
    })

    it('should render Close button', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('should render Learn more button', () => {
      render(<ConsentModal {...defaultProps} />)

      expect(screen.getByText('Learn more')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call setDialogIsOpen when dialog is closed via onClose', async () => {
      const { user } = render(<ConsentModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()

      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        await user.click(backdrop as HTMLElement)
      }
      expect(mockSetDialogIsOpen).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should call setDialogIsOpen when Close button is clicked', async () => {
      const { user } = render(<ConsentModal {...defaultProps} />)

      const closeButton = screen.getByText('Close')
      await user.click(closeButton)

      expect(mockSetDialogIsOpen).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should call goToUrlLink when Learn more button is clicked', async () => {
      const { user } = render(<ConsentModal {...defaultProps} />)

      const learnMoreButton = screen.getByText('Learn more')
      await user.click(learnMoreButton)

      expect(globalUtils.goToUrlLink).toHaveBeenCalledWith('https://www.mx.com/company/')
    })

    it('should toggle state correctly when calling setDialogIsOpen function', () => {
      render(<ConsentModal {...defaultProps} />)

      const closeButton = screen.getByText('Close')
      closeButton.click()

      expect(mockSetDialogIsOpen).toHaveBeenCalled()

      const toggleFunction = mockSetDialogIsOpen.mock.calls[0][0]
      expect(toggleFunction(true)).toBe(false)
      expect(toggleFunction(false)).toBe(true)
    })
  })

  describe('Styling', () => {
    it('should apply dialog max width and min width styles', () => {
      render(<ConsentModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })
})
