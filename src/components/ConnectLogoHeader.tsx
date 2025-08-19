/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useSelector } from 'react-redux'
import { InstitutionLogo } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'

import { selectColorScheme } from 'src/redux/reducers/configSlice'

import { COLOR_SCHEME } from 'src/const/Connect'

import { ClientLogo } from 'src/components/ClientLogo'

import ConnectHeaderInstitutionLight from 'src/images/header/ConnectHeaderInstitutionLight.svg'
import ConnectHeaderInstitutionDark from 'src/images/header/ConnectHeaderInstitutionDark.svg'

interface ConnectLogoHeaderProps {
  institution?: {
    guid?: string
    logo_url?: string
  }
}

export const ConnectLogoHeader: React.FC<ConnectLogoHeaderProps> = (props) => {
  const colorScheme = useSelector(selectColorScheme)
  const clientGuid = useSelector((state: any) => state.profiles.client.guid)
  const tokens = useTokens()
  const styles = getStyles()
  const defaultInstitutionImage = () =>
    colorScheme === COLOR_SCHEME.LIGHT ? (
      <div style={{ borderRadius: tokens.BorderRadius.Large }}>
        <ConnectHeaderInstitutionLight />
      </div>
    ) : (
      <div style={{ borderRadius: tokens.BorderRadius.Large }}>
        <ConnectHeaderInstitutionDark />
      </div>
    )

  // TODO: This looks like it's used in multiple places. I probably need to leave this component how it was, and just change it for the connecting screen

  return (
    <div aria-hidden={true} style={styles.container}>
      <div style={styles.clientLogo}>
        <ClientLogo alt="Client logo" clientGuid={clientGuid} size={64} />
      </div>
      <div style={styles.institutionLogo}>
        {props?.institution?.guid ? (
          <InstitutionLogo
            alt="Institution logo"
            institutionGuid={props.institution.guid}
            logoUrl={props.institution.logo_url}
            size={64}
            style={{ borderRadius: tokens.BorderRadius.Large }}
          />
        ) : (
          defaultInstitutionImage()
        )}
      </div>
    </div>
  )
}

const getStyles = () => {
  const maxHeight = '64px'
  const maxWidth = '240px'

  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      height: maxHeight,
      width: maxWidth,
    },
    device: {
      height: maxHeight,
      width: maxHeight,
      marginLeft: '20px',
    },
    clientLogo: {
      height: maxHeight,
      width: maxHeight,
      zIndex: 20,
    },
    institutionLogo: {
      height: maxHeight,
      width: maxHeight,
      marginLeft: '80px',
      zIndex: 20,
    },
  }
}
