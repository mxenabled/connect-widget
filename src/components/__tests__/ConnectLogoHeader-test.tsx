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
      clientProfile: {},
      user: {},
      userProfile: {},
      widgetProfile: {},
    },
  }

  it('renders a ClientLogo', () => {
    render(<ConnectLogoHeader />, { preloadedState: initialState })
    const img = screen.getByAltText('Client logo')
    expect(img.getAttribute('src')).toEqual(
      `https://content.moneydesktop.com/storage/MD_Client/oauth_logos/${clientGuid}.png`,
    )
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
