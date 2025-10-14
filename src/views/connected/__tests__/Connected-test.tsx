import React from 'react'

import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { Connected } from 'src/views/connected/Connected'
import { institutionData, member, initialState } from 'src/services/mockedData'

// Mock react-confetti to avoid Canvas issues in JSDOM
vi.mock('react-confetti', () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="confetti">{children}</div>
  ),
}))

const onContinueClick = vi.fn()
const onSuccessfulAggregation = vi.fn()

const mockCurrentMember = {
  ...member.member,
  is_oauth: false,
}

const mockOAuthMember = {
  ...member.member,
  is_oauth: true,
}

const mockInstitution = {
  guid: institutionData.institution.guid,
  name: institutionData.institution.name,
  logo_url: 'https://example.com/logo.png',
  aggregatorDisplayName: 'Test Aggregator',
}

const connectedProps = {
  currentMember: mockCurrentMember,
  institution: mockInstitution,
  onContinueClick,
  onSuccessfulAggregation,
}

const initialStateCopy = {
  ...initialState,
  connect: {
    ...initialState.connect,
    selectedInstitution: institutionData.institution,
  },
}

describe('Connected', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly and calls onSuccessfulAggregation on mount', async () => {
    render(<Connected {...connectedProps} />, {
      preloadedState: initialStateCopy,
    })

    expect(await screen.findByText('Success!')).toBeInTheDocument()
    expect(await screen.findByTestId('done-button')).toBeInTheDocument()
    expect(await screen.findByText('Done')).toBeInTheDocument()
    expect(onSuccessfulAggregation).toHaveBeenCalledWith(mockCurrentMember)
  })

  it('handles done button click correctly', async () => {
    const { user } = render(<Connected {...connectedProps} />, {
      preloadedState: initialStateCopy,
    })

    const doneButton = await screen.findByTestId('done-button')
    await user.click(doneButton)

    await waitFor(() => {
      expect(onContinueClick).toHaveBeenCalled()
    })
  })

  it('renders progress bar with client and institution logos', async () => {
    render(<Connected {...connectedProps} />, {
      preloadedState: initialStateCopy,
    })

    expect(await screen.findByAltText('Client logo')).toBeInTheDocument()
    expect(await screen.findByAltText('Institution logo')).toBeInTheDocument()
  })

  it('renders accessibility and footer elements', () => {
    render(<Connected {...connectedProps} />, {
      preloadedState: initialStateCopy,
    })

    const ariaLiveElement = document.querySelector('[aria-live="assertive"]')
    expect(ariaLiveElement).toBeInTheDocument()
    expect(ariaLiveElement).toHaveStyle('position: absolute')

    expect(screen.getByText('powered by')).toBeInTheDocument()
    expect(screen.getByText('Test Aggregator')).toBeInTheDocument()
  })

  it('renders correctly with both OAuth and non-OAuth members', () => {
    // Test with OAuth member
    const { unmount } = render(<Connected {...connectedProps} currentMember={mockOAuthMember} />, {
      preloadedState: initialStateCopy,
    })
    expect(screen.getByText('Success!')).toBeInTheDocument()

    unmount()

    // Test with non-OAuth member
    render(<Connected {...connectedProps} />, {
      preloadedState: initialStateCopy,
    })
    expect(screen.getByText('Success!')).toBeInTheDocument()
  })

  it('exposes correct imperative handle methods', () => {
    const ref = React.createRef<{ handleBackButton: () => void; showBackButton: () => boolean }>()
    render(<Connected {...connectedProps} ref={ref} />, {
      preloadedState: initialStateCopy,
    })

    expect(ref.current).toBeDefined()
    expect(typeof ref.current?.handleBackButton).toBe('function')
    expect(typeof ref.current?.showBackButton).toBe('function')
  })

  it('handles edge cases gracefully', () => {
    // Test institution without logo_url
    const institutionWithoutLogo = {
      ...mockInstitution,
      logo_url: undefined,
    }

    render(<Connected {...connectedProps} institution={institutionWithoutLogo} />, {
      preloadedState: initialStateCopy,
    })

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByAltText('Institution logo')).toBeInTheDocument()
  })
})
