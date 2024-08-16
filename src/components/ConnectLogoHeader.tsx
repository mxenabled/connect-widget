import React from 'react'
import { useSelector } from 'react-redux'
import { InstitutionLogo } from '@kyper/institutionlogo'
import { useTokens } from '@kyper/tokenprovider'

import { selectColorScheme } from 'src/redux/reducers/configSlice'

import { COLOR_SCHEME } from 'src/const/Connect'

import { ClientLogo } from 'src/components/ClientLogo'

import ConnectHeaderInstitutionLight from 'src/images/header/ConnectHeaderInstitutionLight.svg'
import ConnectHeaderInstitutionDark from 'src/images/header/ConnectHeaderInstitutionDark.svg'

import ConnectHeaderBackdropDark from 'src/images/header/ConnectHeaderBackdropDark.svg'
import ConnectHeaderBackdropLight from 'src/images/header/ConnectHeaderBackdropLight.svg'

interface ConnectLogoHeaderProps {
  institutionGuid?: string
}

export const ConnectLogoHeader: React.FC<ConnectLogoHeaderProps> = (props) => {
  const colorScheme = useSelector(selectColorScheme)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientGuid = useSelector((state: any) => state.profiles.client.guid)
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

interface SVGImageProps {
  image: string
  styles?: object
}

export const SVGImage: React.FC<SVGImageProps> = (props) => {
  const styles = {
    zIndex: 20,
    ...props.styles,
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: props.image }} data-test="svg-image" style={styles} />
  )
}
