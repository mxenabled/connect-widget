import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'

import { ConnectNavigationHeader } from 'src/components/ConnectNavigationHeader'
import { STEPS } from 'src/const/Connect'

describe('ConnectNavigationHeader Component', () => {
  let props

  beforeEach(() => {
    props = {
      stepComponentRef: {},
      connectGoBack: vi.fn(),
    }
  })

  it('should show back button when showMobileBackButton is true and we are on first valid step', async () => {
    render(<ConnectNavigationHeader {...props} />, {
      preloadedState: { config: { show_back_button: true }, location: [STEPS.SEARCH] },
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

  it('should not show back button when we are not on first valid step', async () => {
    render(<ConnectNavigationHeader {...props} />, {
      preloadedState: { config: { show_back_button: false }, location: [STEPS.ENTER_CREDENTIALS] },
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { options: { name: 'connect-navigation-back-button' } }),
      ).not.toBeInTheDocument()
    })

    render(<ConnectNavigationHeader {...props} />, {
      preloadedState: {
        config: { show_back_button: false },
        location: [STEPS.VERIFY_EXISTING_MEMBER, STEPS.SEARCH],
      },
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { options: { name: 'connect-navigation-back-button' } }),
      ).not.toBeInTheDocument()
    })
  })
})
