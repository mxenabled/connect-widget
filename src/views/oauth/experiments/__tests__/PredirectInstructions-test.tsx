import React from 'react'
import { expect, vi } from 'vitest'
import { createTestReduxStore, render, screen } from 'src/utilities/testingLibrary'
import { OAuthDefault } from 'src/views/oauth/OAuthDefault'
import { ApiContextTypes } from 'src/context/ApiContext'
import { DEFAULT_HEADER_HEX_COLOR } from 'src/views/oauth/experiments/PredirectInstructions'

describe('<OAuthDefault /> PredirectInstructions test', () => {
  it('wells fargo can show the instructions for verification/identity', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()

    // This set of instructions only shows for the Wells Fargo institution (at the moment)
    const institution = {
      guid: 'INS-f9e8d5f6-b953-da63-32e4-6e88fbe8b250',
      name: 'Wells Fargo',
      testProp: 'testValue',
    }
    const member = { guid: 'testGuid' }

    const store = createTestReduxStore({
      config: {
        _initialValues: '',
        is_mobile_webview: false,
        target_origin_referrer: null,
        ui_message_version: 4,
        ui_message_protocol: 'post_message',
        ui_message_webview_url_scheme: '',
        color_scheme: 'light',
        current_institution_code: null,
        current_institution_guid: null,
        current_member_guid: null,
        current_microdeposit_guid: null,
        enable_app2app: false,
        disable_background_agg: false,
        disable_institution_search: false,
        include_identity: false,
        include_transactions: false,
        iso_country_code: null,
        oauth_referral_source: '',
        update_credentials: false,
        wait_for_full_aggregation: false,
        mode: 'verification',
        data_request: { products: ['account_verification'] },
      },
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
        selectedInstitution: {
          name: 'Wells Fargo',
        },
      },
      userFeatures: {
        items: [
          // This item indicates that the feature flag is enabled for the Wells Fargo instructions
          {
            is_enabled: 'test',
            feature_name: 'WELLS_FARGO_INSTRUCTIONS',
          },
        ],
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
          content.startsWith('After logging in, share at least one account and') &&
          element.textContent ===
            'After logging in, share at least one account and profile information.'
        )
      }),
    ).toBeInTheDocument()
  })

  it('wells fargo can show instructions for aggregation-only', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()

    // This set of instructions only shows for the Wells Fargo institution (at the moment)
    const institution = {
      guid: 'INS-f9e8d5f6-b953-da63-32e4-6e88fbe8b250',
      name: 'Wells Fargo',
      testProp: 'testValue',
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
      userFeatures: {
        items: [
          // This item indicates that the feature flag is enabled for the Wells Fargo instructions
          {
            is_enabled: 'test',
            feature_name: 'WELLS_FARGO_INSTRUCTIONS',
          },
        ],
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
    expect(screen.getByText('After logging in, share at least one account.')).toBeInTheDocument()
  })

  it('an institution with predirect instructions can show the default header color', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()

    // This set of instructions only shows for the Test Bank institution (at the moment)
    const institution = {
      guid: 'INS-test',
      name: 'Test Bank',
      oauth_predirect_instructions: ['VALUE1', 'VALUE2'],
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
      userFeatures: {
        items: [
          // This item indicates that the feature flag is enabled for the Test Bank instructions
          {
            is_enabled: 'test',
            feature_name: 'WELLS_FARGO_INSTRUCTIONS',
          },
        ],
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
    expect(screen.getByText('After logging in, share at least one account.')).toBeInTheDocument()
  })

  it('an institution with predirect instructions can show the custom header color when it is provided from the API', async () => {
    const onSignInClick = vi.fn()
    const onAnalyticsEvent = vi.fn()
    const customColor = '#ff0000' // Red

    // This set of instructions only shows for the Test Bank institution (at the moment)
    const institution = {
      guid: 'INS-test',
      name: 'Test Bank',
      oauth_predirect_instructions: ['VALUE1', 'VALUE2'],
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
      userFeatures: {
        items: [
          // This item indicates that the feature flag is enabled for the Test Bank instructions
          {
            is_enabled: 'test',
            feature_name: 'WELLS_FARGO_INSTRUCTIONS',
          },
        ],
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
    expect(screen.getByText('After logging in, share at least one account.')).toBeInTheDocument()
  })
})
