import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { ImpededMemberError } from '../ImpededMemberError'
import { institutionData } from 'src/services/mockedData'
import * as globalUtils from 'src/utilities/global'
import * as institutionUtils from 'src/utilities/Institution'

describe('<ImpededMemberError />', () => {
  const defaultProps = {
    institution: institutionData.institution,
    message: 'Your account has been locked for security reasons.',
    onRefreshClick: vi.fn(),
    setIsLeaving: vi.fn(),
    showExternalLinkPopup: false,
    title: 'Account locked',
  }

  let goToUrlLinkSpy: ReturnType<typeof vi.spyOn>
  let getInstitutionLoginUrlSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    goToUrlLinkSpy = vi.spyOn(globalUtils, 'goToUrlLink').mockImplementation(() => {})
    getInstitutionLoginUrlSpy = vi
      .spyOn(institutionUtils, 'getInstitutionLoginUrl')
      .mockReturnValue('https://testbank.com/login')
  })

  afterEach(() => {
    goToUrlLinkSpy.mockRestore()
    getInstitutionLoginUrlSpy.mockRestore()
  })

  describe('Content Display', () => {
    it('renders the title', () => {
      render(<ImpededMemberError {...defaultProps} />)

      expect(screen.getByText('Account locked')).toBeInTheDocument()
    })

    it('renders the message', () => {
      render(<ImpededMemberError {...defaultProps} />)

      expect(
        screen.getByText('Your account has been locked for security reasons.'),
      ).toBeInTheDocument()
    })

    it('renders step 1 with institution name', () => {
      render(<ImpededMemberError {...defaultProps} />)

      expect(
        screen.getByText("Log in to Test Bank's website and resolve the issue."),
      ).toBeInTheDocument()
    })

    it('renders the "Visit website" link', () => {
      render(<ImpededMemberError {...defaultProps} />)

      expect(screen.getByText('Visit website')).toBeInTheDocument()
    })

    it('renders step 2 text', () => {
      render(<ImpededMemberError {...defaultProps} />)

      expect(
        screen.getByText('Come back here and try to connect your account again.'),
      ).toBeInTheDocument()
    })

    it('renders the "Try again" link', () => {
      render(<ImpededMemberError {...defaultProps} />)

      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    it('renders numbered icons for steps', () => {
      render(<ImpededMemberError {...defaultProps} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Visit Website Link', () => {
    it('opens institution URL externally when showExternalLinkPopup is false', async () => {
      const { user } = render(<ImpededMemberError {...defaultProps} />)

      await user.click(screen.getByText('Visit website'))

      expect(getInstitutionLoginUrlSpy).toHaveBeenCalledWith(institutionData.institution)
      expect(goToUrlLinkSpy).toHaveBeenCalledWith('https://testbank.com/login')
      expect(defaultProps.setIsLeaving).not.toHaveBeenCalled()
    })

    it('shows leaving notice when showExternalLinkPopup is true', async () => {
      const propsWithPopup = {
        ...defaultProps,
        showExternalLinkPopup: true,
      }

      const { user } = render(<ImpededMemberError {...propsWithPopup} />)

      await user.click(screen.getByText('Visit website'))

      expect(propsWithPopup.setIsLeaving).toHaveBeenCalled()
      expect(goToUrlLinkSpy).not.toHaveBeenCalled()
    })
  })

  describe('Try Again Link', () => {
    it('calls onRefreshClick when clicked', async () => {
      const { user } = render(<ImpededMemberError {...defaultProps} />)

      await user.click(screen.getByText('Try again'))

      expect(defaultProps.onRefreshClick).toHaveBeenCalledTimes(1)
    })

    it('does not call setIsLeaving when Try again is clicked', async () => {
      const { user } = render(<ImpededMemberError {...defaultProps} />)

      await user.click(screen.getByText('Try again'))

      expect(defaultProps.setIsLeaving).not.toHaveBeenCalled()
    })
  })

  describe('Integration', () => {
    it('renders both steps with all elements', () => {
      render(<ImpededMemberError {...defaultProps} />)

      // Title and message
      expect(screen.getByText('Account locked')).toBeInTheDocument()
      expect(
        screen.getByText('Your account has been locked for security reasons.'),
      ).toBeInTheDocument()

      // Step 1
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(
        screen.getByText("Log in to Test Bank's website and resolve the issue."),
      ).toBeInTheDocument()
      expect(screen.getByText('Visit website')).toBeInTheDocument()

      // Step 2
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(
        screen.getByText('Come back here and try to connect your account again.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    it('handles different institution names correctly', () => {
      const customProps = {
        ...defaultProps,
        institution: {
          ...institutionData.institution,
          name: 'Custom Credit Union',
        },
      }

      render(<ImpededMemberError {...customProps} />)

      expect(
        screen.getByText("Log in to Custom Credit Union's website and resolve the issue."),
      ).toBeInTheDocument()
    })

    it('handles different title and message correctly', () => {
      const customProps = {
        ...defaultProps,
        message: 'Too many failed login attempts.',
        title: 'Account temporarily suspended',
      }

      render(<ImpededMemberError {...customProps} />)

      expect(screen.getByText('Account temporarily suspended')).toBeInTheDocument()
      expect(screen.getByText('Too many failed login attempts.')).toBeInTheDocument()
    })
  })
})
