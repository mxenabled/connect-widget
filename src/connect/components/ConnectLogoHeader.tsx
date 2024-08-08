import React from 'react'
import { useSelector, RootStateOrAny } from 'react-redux'
import { InstitutionLogo } from '@kyper/institutionlogo'
import { useTokens } from '@kyper/tokenprovider'

import { selectColorScheme } from 'reduxify/reducers/configSlice'

import { COLOR_SCHEME } from 'src/connect/const/Connect'

import { ClientLogo } from 'src/connect/components/ClientLogo'

import ConnectHeaderInstitutionLight from 'src/connect/images/header/ConnectHeaderInstitutionLight.svg'
import ConnectHeaderInstitutionDark from 'src/connect/images/header/ConnectHeaderInstitutionDark.svg'

import ConnectHeaderBackdropDark from 'src/connect/images/header/ConnectHeaderBackdropDark.svg'
import ConnectHeaderBackdropLight from 'src/connect/images/header/ConnectHeaderBackdropLight.svg'

interface ConnectLogoHeader {
  institutionGuid?: string
}

export const ConnectLogoHeader: React.FC<ConnectLogoHeader> = (props) => {
  const colorScheme = useSelector(selectColorScheme)
  const clientGuid = useSelector((state: RootStateOrAny) => state.profiles.client.guid)
  const tokens = useTokens()
  const styles = getStyles()
  const backdropImage =
    colorScheme === COLOR_SCHEME.LIGHT ? ConnectHeaderBackdropLight : ConnectHeaderBackdropDark
  const defaultInstitutionImage =
    colorScheme === COLOR_SCHEME.LIGHT
      ? ConnectHeaderInstitutionLight
      : ConnectHeaderInstitutionDark

  return (
    <div aria-hidden={true} style={styles.container}>
      <div data-test="mxLogo" style={styles.backdropImage}>
        <SVGImage image={backdropImage} />
      </div>
      <div style={styles.clientLogo}>
        <ClientLogo alt="Client logo" clientGuid={clientGuid} size={64} />
      </div>
      <div style={styles.institutionLogo}>
        {props.institutionGuid ? (
          <InstitutionLogo
            alt="Institution logo"
            institutionGuid={props.institutionGuid}
            size={64}
            style={{ borderRadius: tokens.BorderRadius.Large }}
          />
        ) : (
          <SVGImage
            image={defaultInstitutionImage}
            styles={{ borderRadius: tokens.BorderRadius.Large }}
          />
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
    backdropImage: {
      width: '88px',
      position: 'absolute',
      height: '80px',
      zIndex: 10,
    } as React.CSSProperties,
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

interface SVGImage {
  image: string
  styles?: object
}

export const SVGImage: React.FC<SVGImage> = (props) => {
  const styles = {
    zIndex: 20,
    ...props.styles,
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: props.image }} data-test="svg-image" style={styles} />
  )
}
