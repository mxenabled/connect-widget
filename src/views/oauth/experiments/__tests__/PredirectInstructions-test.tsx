import React from 'react'
import { expect, vi } from 'vitest'
import { createTestReduxStore, render, screen } from 'src/utilities/testingLibrary'
import { OAuthDefault } from 'src/views/oauth/OAuthDefault'
import { ApiContextTypes } from 'src/context/ApiContext'
import { DEFAULT_HEADER_HEX_COLOR } from 'src/views/oauth/experiments/PredirectInstructions'
import { OAUTH_PREDIRECT_INSTRUCTION } from 'src/views/oauth/experiments/predirectInstructionsUtils'

describe('<OAuthDefault /> PredirectInstructions test', () => {
  it('wells fargo can show the instructions for verification/identity', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()

    const institution = {
      guid: 'INS-f9e8d5f6-b953-da63-32e4-6e88fbe8b250',
      name: 'Wells Fargo',
      testProp: 'testValue',
      oauth_predirect_instructions: [
        OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION,
        OAUTH_PREDIRECT_INSTRUCTION.PROFILE_INFORMATION_INSTRUCTION,
      ],
    }
    const member = { guid: 'testGuid' }

    const store = createTestReduxStore({
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
        selectedInstitution: {
          name: 'Wells Fargo',
        },
      },
    })

    const apiValue = {
      oAuthStart: vi.fn(),
    } as unknown as ApiContextTypes

    render(
      <OAuthDefault
        currentMember={member}
        institution={institution}
        onSignInClick={onSignInClick}
        selectedInstructionalData={{}}
        setIsLeavingUrl={() => {}}
      />,
      {
        apiValue,
        onAnalyticsEvent,
        store,
      },
    )

    // See PredirectInstructions.tsx for the text we are verifying here
    expect(screen.getByText('Wells Fargo')).toBeInTheDocument()
    expect(screen.getByText('Log in at Wells Fargo', { selector: 'h2' })).toBeInTheDocument()

    expect(
      screen.getByText((content, element) => {
        if (!element) return false
        return (
          element.classList.contains('predirect-instruction-text') &&
          content.startsWith('To complete your connection, please') &&
          element.textContent ===
            'To complete your connection, please share the following after signing in:'
        )
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Checking or savings account')).toBeInTheDocument()
    expect(screen.getByText('Profile information')).toBeInTheDocument()
  })

  it('wells fargo can show instructions for aggregation-only', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()

    const institution = {
      guid: 'INS-f9e8d5f6-b953-da63-32e4-6e88fbe8b250',
      name: 'Wells Fargo',
      testProp: 'testValue',
      oauth_predirect_instructions: [
        OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION,
      ],
    }
    const member = { guid: 'testGuid' }

    const store = createTestReduxStore({
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
        selectedInstitution: {
          name: 'Wells Fargo',
        },
      },
    })

    const apiValue = {
      oAuthStart: vi.fn(),
    } as unknown as ApiContextTypes

    render(
      <OAuthDefault
        currentMember={member}
        institution={institution}
        onSignInClick={onSignInClick}
        selectedInstructionalData={{}}
        setIsLeavingUrl={() => {}}
      />,
      {
        apiValue,
        onAnalyticsEvent,
        store,
      },
    )

    // See PredirectInstructions.tsx for the text we are verifying here
    expect(screen.getByText('Wells Fargo')).toBeInTheDocument()
    expect(screen.getByText('Log in at Wells Fargo', { selector: 'h2' })).toBeInTheDocument()

    expect(
      screen.getByText((content, element) => {
        if (!element) return false
        return (
          element.classList.contains('predirect-instruction-text') &&
          content.startsWith('To complete your connection, please') &&
          element.textContent ===
            'To complete your connection, please share the following after signing in:'
        )
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Checking or savings account')).toBeInTheDocument()
  })

  it('an institution with predirect instructions can show the default header color', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()

    const institution = {
      guid: 'INS-test',
      name: 'Test Bank',
      oauth_predirect_instructions: [
        OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION,
        OAUTH_PREDIRECT_INSTRUCTION.PROFILE_INFORMATION_INSTRUCTION,
      ],
      testProp: 'testValue',
    }
    const member = { guid: 'testGuid' }

    const store = createTestReduxStore({
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
        selectedInstitution: {
          name: 'Test Bank',
        },
      },
    })

    const apiValue = {
      oAuthStart: vi.fn(),
    } as unknown as ApiContextTypes

    render(
      <OAuthDefault
        currentMember={member}
        institution={institution}
        onSignInClick={onSignInClick}
        selectedInstructionalData={{}}
        setIsLeavingUrl={() => {}}
      />,
      {
        apiValue,
        onAnalyticsEvent,
        store,
      },
    )

    // See PredirectInstructions.tsx for the text we are verifying here
    const exampleWindowHeader = screen.getByText('Test Bank').closest('.institution-panel-header')
    expect(exampleWindowHeader).toBeInTheDocument()
    expect(exampleWindowHeader).toHaveStyle({ backgroundColor: DEFAULT_HEADER_HEX_COLOR })
    expect(screen.getByText('Log in at Test Bank', { selector: 'h2' })).toBeInTheDocument()

    expect(
      screen.getByText((content, element) => {
        if (!element) return false
        return (
          element.classList.contains('predirect-instruction-text') &&
          content.startsWith('To complete your connection, please') &&
          element.textContent ===
            'To complete your connection, please share the following after signing in:'
        )
      }),
    ).toBeInTheDocument()
  })

  it('an institution with predirect instructions can show the custom header color when it is provided from the API', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()
    const customColor = '#ff0000'

    const institution = {
      guid: 'INS-test',
      name: 'Test Bank',
      oauth_predirect_instructions: [
        OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION,
        OAUTH_PREDIRECT_INSTRUCTION.PROFILE_INFORMATION_INSTRUCTION,
      ],
      testProp: 'testValue',
      brand_color_hex_code: customColor, // Custom red color for testing
    }
    const member = { guid: 'testGuid' }

    const store = createTestReduxStore({
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
        selectedInstitution: {
          name: 'Test Bank',
        },
      },
    })

    const apiValue = {
      oAuthStart: vi.fn(),
    } as unknown as ApiContextTypes

    render(
      <OAuthDefault
        currentMember={member}
        institution={institution}
        onSignInClick={onSignInClick}
        selectedInstructionalData={{}}
        setIsLeavingUrl={() => {}}
      />,
      {
        apiValue,
        onAnalyticsEvent,
        store,
      },
    )

    // See PredirectInstructions.tsx for the text we are verifying here
    const exampleWindowHeader = screen.getByText('Test Bank').closest('.institution-panel-header')
    expect(exampleWindowHeader).toBeInTheDocument()
    expect(exampleWindowHeader).toHaveStyle({ backgroundColor: customColor })
    expect(screen.getByText('Log in at Test Bank', { selector: 'h2' })).toBeInTheDocument()

    expect(
      screen.getByText((content, element) => {
        if (!element) return false
        return (
          element.classList.contains('predirect-instruction-text') &&
          content.startsWith('To complete your connection, please') &&
          element.textContent ===
            'To complete your connection, please share the following after signing in:'
        )
      }),
    ).toBeInTheDocument()
  })

  it('an institution that is configured with all bad values can show instructions for aggregation-only by default', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()

    const institution = {
      guid: 'INS-test',
      name: 'Test Bank',
      testProp: 'testValue',
      oauth_predirect_instructions: [998, 999], // Invalid instruction value
    }
    const member = { guid: 'testGuid' }

    const store = createTestReduxStore({
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
        selectedInstitution: {
          name: 'Test Bank',
        },
      },
    })

    const apiValue = {
      oAuthStart: vi.fn(),
    } as unknown as ApiContextTypes

    render(
      <OAuthDefault
        currentMember={member}
        institution={institution}
        onSignInClick={onSignInClick}
        selectedInstructionalData={{}}
        setIsLeavingUrl={() => {}}
      />,
      {
        apiValue,
        onAnalyticsEvent,
        store,
      },
    )

    // See PredirectInstructions.tsx for the text we are verifying here
    expect(screen.getByText('Test Bank')).toBeInTheDocument()
    expect(screen.getByText('Log in at Test Bank', { selector: 'h2' })).toBeInTheDocument()

    expect(
      screen.getByText((content, element) => {
        if (!element) return false
        return (
          element.classList.contains('predirect-instruction-text') &&
          content.startsWith('To complete your connection, please') &&
          element.textContent ===
            'To complete your connection, please share the following after signing in:'
        )
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Checking or savings account')).toBeInTheDocument()
  })
})
