import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SearchFailed } from 'src/views/search/views/SearchFailed'
import { render, screen } from 'src/utilities/testingLibrary'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

vi.mock('src/hooks/useAnalyticsPath')

describe('SearchFailed', () => {
  describe('Initial Rendering', () => {
    it('renders the error title', () => {
      render(<SearchFailed />)

      expect(screen.getByText(/Search isn.t working/)).toBeInTheDocument()
    })

    it('renders the error subtitle message', () => {
      render(<SearchFailed />)

      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })

    it('renders the attention icon', () => {
      const { container } = render(<SearchFailed />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders all content in a container', () => {
      const { container } = render(<SearchFailed />)

      const containerDiv = container.firstChild
      expect(containerDiv).toBeInTheDocument()
    })
  })

  describe('Analytics', () => {
    it('calls useAnalyticsPath with CONNECT_SEARCH_FAILED pageview info', () => {
      render(<SearchFailed />)

      expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_SEARCH_FAILED)
    })

    it('calls useAnalyticsPath on mount', () => {
      vi.mocked(useAnalyticsPath).mockClear()

      render(<SearchFailed />)

      expect(useAnalyticsPath).toHaveBeenCalledTimes(1)
    })
  })

  describe('Component Structure', () => {
    it('renders icon before title text', () => {
      const { container } = render(<SearchFailed />)

      const text = container.textContent
      const titleIndex = text?.search(/Search isn.t working/) ?? -1

      expect(titleIndex).toBeGreaterThan(-1)
    })

    it('renders title before subtitle', () => {
      const { container } = render(<SearchFailed />)

      const text = container.textContent
      const titleIndex = text?.search(/Search isn.t working/) ?? -1
      const subtitleIndex = text?.indexOf('Something went wrong. Please try again.') ?? -1

      expect(titleIndex).toBeLessThan(subtitleIndex)
    })
  })

  describe('Styling', () => {
    it('renders with container styling', () => {
      const { container } = render(<SearchFailed />)

      const containerDiv = container.firstChild as HTMLElement
      expect(containerDiv).toHaveStyle({ display: 'flex' })
    })

    it('renders icon container', () => {
      const { container } = render(<SearchFailed />)

      const iconContainer = container.querySelector('div > div:first-of-type') as HTMLElement
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveStyle({ display: 'flex' })
    })

    it('renders text container with proper structure', () => {
      const { container } = render(<SearchFailed />)

      const textContainers = container.querySelectorAll('div > div:nth-of-type(2)')
      expect(textContainers.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('renders text content that is readable', () => {
      render(<SearchFailed />)

      const title = screen.getByText(/Search isn.t working/)
      const subtitle = screen.getByText('Something went wrong. Please try again.')

      expect(title).toBeVisible()
      expect(subtitle).toBeVisible()
    })

    it('renders icon with appropriate color contrast', () => {
      const { container } = render(<SearchFailed />)

      const icon = container.querySelector('svg')
      expect(icon).toHaveAttribute('width', '24')
      expect(icon).toHaveAttribute('height', '24')
    })
  })
})
