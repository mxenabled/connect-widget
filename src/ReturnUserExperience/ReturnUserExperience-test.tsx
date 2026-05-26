import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { ReturnUserExperience } from './ReturnUserExperience'

describe('ReturnUserExperience', () => {
  const mockAppName = 'Test Financial App'

  const preloadedState = {
    profiles: {
      client: {
        oauth_app_name: mockAppName,
      },
    },
  }

  describe('rendering', () => {
    it('should render the component without crashing', () => {
      render(<ReturnUserExperience />, { preloadedState })
      expect(screen.getByText('Connect your accounts')).toBeInTheDocument()
    })

    it('should render the development warning alert', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const alert = screen.getByText('This feature is currently in development.')
      expect(alert).toBeInTheDocument()
    })

    it('should render the main heading', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Connect your accounts')
    })

    it('should render the subtitle with app name interpolation', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const subtitle = screen.getByText(new RegExp(mockAppName))
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveTextContent(`${mockAppName} uses MX to connect your accounts.`)
    })

    it('should render the learn more link', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const link = screen.getByRole('link', { name: /learn more about mx/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://mx.com/learn-more')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render the MX sign in button', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const button = screen.getByRole('button', { name: /connect faster by signing into mx/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('MuiButton-contained')
    })

    it('should render the guest sign in button', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const button = screen.getByRole('button', { name: /continue as guest/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('MuiButton-outlined')
    })

    it('should render both buttons as full width', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        if (
          button.textContent?.includes('Connect faster') ||
          button.textContent?.includes('Continue as guest')
        ) {
          expect(button).toHaveClass('MuiButton-fullWidth')
        }
      })
    })
  })

  describe('Redux state integration', () => {
    it('should use the oauth_app_name from Redux state', () => {
      render(<ReturnUserExperience />, { preloadedState })
      expect(screen.getByText(new RegExp(mockAppName))).toBeInTheDocument()
    })

    it('should display default app name when oauth_app_name is not provided', () => {
      const emptyState = {
        profiles: {
          client: {},
        },
      }
      render(<ReturnUserExperience />, { preloadedState: emptyState })
      expect(screen.getByText(/This app uses MX to connect your accounts/)).toBeInTheDocument()
    })

    it('should display default app name when oauth_app_name is null', () => {
      const nullState = {
        profiles: {
          client: {
            oauth_app_name: null,
          },
        },
      }
      render(<ReturnUserExperience />, { preloadedState: nullState })
      expect(screen.getByText(/This app uses MX to connect your accounts/)).toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    it('should render the MX sign in button as clickable', async () => {
      const { user } = render(<ReturnUserExperience />, { preloadedState })
      const button = screen.getByRole('button', { name: /connect faster by signing into mx/i })
      expect(button).not.toBeDisabled()
      await user.click(button)
    })

    it('should render the guest continue button as clickable', async () => {
      const { user } = render(<ReturnUserExperience />, { preloadedState })
      const button = screen.getByRole('button', { name: /continue as guest/i })
      expect(button).not.toBeDisabled()
      await user.click(button)
    })
  })

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Connect your accounts')
    })

    it('should have accessible buttons', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName()
      })
    })

    it('should have an accessible learn more link', () => {
      render(<ReturnUserExperience />, { preloadedState })
      const link = screen.getByRole('link', { name: /learn more about mx/i })
      expect(link).toHaveAccessibleName()
    })
  })
})
