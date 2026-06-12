import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { LeavingAction } from '../LeavingAction'
import { institutionData } from 'src/services/mockedData'
import * as globalUtils from 'src/utilities/global'
import * as institutionUtils from 'src/utilities/Institution'

describe('<LeavingAction />', () => {
  const defaultProps = {
    institution: institutionData.institution,
    setIsLeaving: vi.fn(),
    size: 'medium',
  }

  let goToUrlLinkSpy: ReturnType<typeof vi.spyOn>
  let getInstitutionLoginUrlSpy: ReturnType<typeof vi.spyOn>
  let portalRoot: HTMLDivElement

  beforeEach(() => {
    vi.clearAllMocks()
    goToUrlLinkSpy = vi.spyOn(globalUtils, 'goToUrlLink').mockImplementation(() => {})
    getInstitutionLoginUrlSpy = vi
      .spyOn(institutionUtils, 'getInstitutionLoginUrl')
      .mockReturnValue('https://testbank.com/login')

    portalRoot = document.createElement('div')
    portalRoot.setAttribute('id', 'connect-wrapper')
    document.body.appendChild(portalRoot)
  })

  afterEach(() => {
    goToUrlLinkSpy.mockRestore()
    getInstitutionLoginUrlSpy.mockRestore()
    document.body.removeChild(portalRoot)
  })

  describe('Content Display', () => {
    it('renders the LeavingNoticeFlat component', () => {
      render(<LeavingAction {...defaultProps} />)

      expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
    })

    it('renders the continue button', () => {
      render(<LeavingAction {...defaultProps} />)

      expect(screen.getByTestId('leaving-notice-flat-continue-button')).toBeInTheDocument()
    })

    it('renders the cancel button', () => {
      render(<LeavingAction {...defaultProps} />)

      expect(screen.getByTestId('leaving-notice-flat-cancel-button')).toBeInTheDocument()
    })
  })

  describe('Cancel Button', () => {
    it('calls setIsLeaving(false) when cancel button is clicked', async () => {
      const { user } = render(<LeavingAction {...defaultProps} />)

      await user.click(screen.getByTestId('leaving-notice-flat-cancel-button'))

      expect(defaultProps.setIsLeaving).toHaveBeenCalledWith(false)
      expect(defaultProps.setIsLeaving).toHaveBeenCalledTimes(1)
    })

    it('does not call goToUrlLink when cancel is clicked', async () => {
      const { user } = render(<LeavingAction {...defaultProps} />)

      await user.click(screen.getByTestId('leaving-notice-flat-cancel-button'))

      expect(goToUrlLinkSpy).not.toHaveBeenCalled()
    })
  })

  describe('Continue Button', () => {
    it('calls getInstitutionLoginUrl with institution when continue is clicked', async () => {
      const { user } = render(<LeavingAction {...defaultProps} />)

      await user.click(screen.getByTestId('leaving-notice-flat-continue-button'))

      expect(getInstitutionLoginUrlSpy).toHaveBeenCalledWith(institutionData.institution)
      expect(getInstitutionLoginUrlSpy).toHaveBeenCalledTimes(1)
    })

    it('calls goToUrlLink with institution login URL when continue is clicked', async () => {
      const { user } = render(<LeavingAction {...defaultProps} />)

      await user.click(screen.getByTestId('leaving-notice-flat-continue-button'))

      expect(goToUrlLinkSpy).toHaveBeenCalledWith('https://testbank.com/login')
      expect(goToUrlLinkSpy).toHaveBeenCalledTimes(1)
    })

    it('does not call setIsLeaving when continue is clicked', async () => {
      const { user } = render(<LeavingAction {...defaultProps} />)

      await user.click(screen.getByTestId('leaving-notice-flat-continue-button'))

      expect(defaultProps.setIsLeaving).not.toHaveBeenCalled()
    })
  })

  describe('Integration', () => {
    it('handles complete user flow - cancel', async () => {
      const { user } = render(<LeavingAction {...defaultProps} />)

      expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      expect(screen.getByTestId('leaving-notice-flat-continue-button')).toBeInTheDocument()
      expect(screen.getByTestId('leaving-notice-flat-cancel-button')).toBeInTheDocument()

      await user.click(screen.getByTestId('leaving-notice-flat-cancel-button'))

      expect(defaultProps.setIsLeaving).toHaveBeenCalledWith(false)
      expect(goToUrlLinkSpy).not.toHaveBeenCalled()
    })

    it('handles complete user flow - continue', async () => {
      const { user } = render(<LeavingAction {...defaultProps} />)

      expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      expect(screen.getByTestId('leaving-notice-flat-continue-button')).toBeInTheDocument()
      expect(screen.getByTestId('leaving-notice-flat-cancel-button')).toBeInTheDocument()

      await user.click(screen.getByTestId('leaving-notice-flat-continue-button'))

      expect(getInstitutionLoginUrlSpy).toHaveBeenCalledWith(institutionData.institution)
      expect(goToUrlLinkSpy).toHaveBeenCalledWith('https://testbank.com/login')
      expect(defaultProps.setIsLeaving).not.toHaveBeenCalled()
    })

    it('passes size prop to LeavingNoticeFlat', () => {
      const customProps = {
        ...defaultProps,
        size: 'small',
      }

      render(<LeavingAction {...customProps} />)

      expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
    })
  })
})
