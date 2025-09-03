import React from 'react'
import { createTestReduxStore, render, screen } from 'src/utilities/testingLibrary'
import { OAuthDefault } from '../OAuthDefault'
import { expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { sha256 } from 'js-sha256'
import { ApiContextTypes } from 'src/context/ApiContext'

describe('<OAuthDefault />', () => {
  it('sends an analytics event onClick, calls oAuthStart, and calls onSignInClick', async () => {
    const onSignInClick = vi.fn()

    const onAnalyticsEvent = vi.fn()

    const institution = { guid: 'testGuid', name: 'testName', testProp: 'testValue' }
    const member = { guid: 'testGuid' }

    const store = createTestReduxStore({
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
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

    expect(onSignInClick).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText('Go to log in'))

    expect(onSignInClick).toHaveBeenCalled()
    expect(onAnalyticsEvent).toHaveBeenCalledWith(
      `connect_${AnalyticEvents.OAUTH_DEFAULT_GO_TO_INSTITUTION}`,
      expect.objectContaining({
        institution_guid: institution.guid,
        institution_name: institution.name,
        member_guid: sha256(institution.guid),
        widgetType: defaultEventMetadata.widgetType,
      }),
    )
    expect(apiValue.oAuthStart).toHaveBeenCalledWith({
      member,
    })
  })
})
