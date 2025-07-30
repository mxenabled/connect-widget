/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { InstitutionLogo } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'

import { selectColorScheme } from 'src/redux/reducers/configSlice'

import { COLOR_SCHEME } from 'src/const/Connect'

import { ClientLogo } from 'src/components/ClientLogo'

import ConnectHeaderInstitutionLight from 'src/images/header/ConnectHeaderInstitutionLight.svg'
import ConnectHeaderInstitutionDark from 'src/images/header/ConnectHeaderInstitutionDark.svg'

import ConnectHeaderBackdropDark from 'src/images/header/ConnectHeaderBackdropDark.svg'
import ConnectHeaderBackdropLight from 'src/images/header/ConnectHeaderBackdropLight.svg'
import { ConnectOverridesContext } from 'src/ConnectWidget'

interface ConnectLogoHeaderProps {
  institutionGuid?: string
  institutionLogo?: string
}

export const ConnectLogoHeader: React.FC<ConnectLogoHeaderProps> = (props) => {
  const { aggregatorHeaderOverride } = useContext(ConnectOverridesContext)

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

  const aggregatorLogo = () =>
    colorScheme === COLOR_SCHEME.LIGHT ? (
      <ConnectHeaderBackdropLight />
    ) : (
      <ConnectHeaderBackdropDark />
    )

  return (
    <div aria-hidden={true} style={styles.container}>
      <div data-test="mxLogo" style={styles.backdropImage}>
        {aggregatorHeaderOverride ? (
          <img alt="aggregator logo" src={aggregatorHeaderOverride} style={styles.aggregatorLogo} />
        ) : (
          aggregatorLogo()
        )}
      </div>
      <div style={styles.clientLogo}>
        <ClientLogo alt="Client logo" clientGuid={clientGuid} size={64} />
      </div>
      <div style={styles.institutionLogo}>
        {props.institutionGuid ? (
          <InstitutionLogo
            alt="Institution logo"
            institutionGuid={props.institutionGuid}
            logoUrl={props.institutionLogo}
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
    aggregatorLogo: {
      width: '88px',
      height: '80px',
      zIndex: 10,
    },
  }
}
