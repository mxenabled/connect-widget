import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'

describe('ConnectLogoHeader', () => {
  const clientGuid = 'CLT-123'
  const initialState = {
    profiles: {
      client: {
        default_institution_guid: 'HOMEACCOUNT',
        guid: clientGuid,
        name: 'Client Name',
        has_atrium_api: false,
      },
      clientColorScheme: {
        primary_100: '',
        primary_200: '',
        primary_300: '',
        primary_400: '',
        primary_500: '',
        color_scheme: 'light',
        widget_brand_color: '',
      },
      clientProfile: {
        account_verification_is_enabled: false,
        tax_statement_is_enabled: false,
      },
      user: {},
      userProfile: {},
      widgetProfile: {},
      loading: true,
    },
  }

  it('renders a ClientLogo', () => {
    render(<ConnectLogoHeader />, { preloadedState: initialState })
    const img = screen.getByAltText('Client logo')
    expect(img.getAttribute('src')).toEqual(
      `https://content.moneydesktop.com/storage/MD_Client/oauth_logos/${clientGuid}.png`,
    )
  })

  it('renders a custom logoUrl if an institutionGuid and institutionLogo was passed in props', () => {
    const logoUrl = 'testUrl'

    render(<ConnectLogoHeader institutionGuid="INS-123" institutionLogo={logoUrl} />, {
      preloadedState: initialState,
    })

    const img = screen.getByAltText('Institution logo')
    expect(img.getAttribute('src')).toEqual(logoUrl)
  })

  it('renders an InstitutionLogo if an institutionGuid was passed in props', () => {
    const institutionGuid = 'INS-123'
    render(<ConnectLogoHeader institutionGuid={institutionGuid} />, {
      preloadedState: initialState,
    })

    const img = screen.getByAltText('Institution logo')
    expect(img.getAttribute('src')).toEqual(
      `https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/${institutionGuid}_100x100.png`,
    )
  })

  it('renders two SVGImage if an institutionGuid is not passed in props', () => {
    render(<ConnectLogoHeader />, { preloadedState: initialState })
    expect(screen.queryAllByTestId('svg-image').length).toBe(2)
  })
})
