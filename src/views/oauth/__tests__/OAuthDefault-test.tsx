import React from 'react'
import { createTestReduxStore, render, screen } from 'src/utilities/testingLibrary'
import { OAuthDefault } from '../OAuthDefault'
import { expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { sha256 } from 'js-sha256'

describe('<OAuthDefault />', () => {
  it('sends an analytics event onClick and calls onSignInClick', async () => {
    const onSignInClick = vi.fn()

    const onAnalyticsEvent = vi.fn()

    const institution = { guid: 'testGuid', name: 'testName', testProp: 'testValue' }

    const store = createTestReduxStore({
      connect: {
        isOauthLoading: false,
        oauthURL: 'testUrl',
      },
    })

    render(
      <OAuthDefault
        currentMember={{ guid: 'testGuid' }}
        institution={institution}
        onSignInClick={onSignInClick}
        selectedInstructionalData={{}}
        setIsLeavingUrl={() => {}}
      />,
      {
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
        rawInstitution: institution,
        widgetType: defaultEventMetadata.widgetType,
      }),
    )
  })
})
