import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'

import { ConnectNavigationHeader } from 'src/components/ConnectNavigationHeader'

describe('ConnectNavigationHeader Component', () => {
  let props

  beforeEach(() => {
    props = {
      stepComponentRef: {},
      connectGoBack: vi.fn(),
    }
  })

  it('should show back button when showMobileBackButton is true', async () => {
    render(<ConnectNavigationHeader {...props} />, {
      preloadedState: { config: { show_back_button: true } },
    })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { options: { name: 'connect-navigation-back-button' } }),
      ).toBeInTheDocument()
    })
  })

  it('should not show back button when showMobileBackButton is false', async () => {
    render(<ConnectNavigationHeader {...props} />, {
      preloadedState: { config: { show_back_button: false } },
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { options: { name: 'connect-navigation-back-button' } }),
      ).not.toBeInTheDocument()
    })
  })
})
