import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { InstitutionLogo } from '@kyper/institutionlogo'
import { useTokens } from '@kyper/tokenprovider'

import { selectColorScheme } from 'src/redux/reducers/configSlice'
import { COLOR_SCHEME } from 'src/const/Connect'
import HeaderDevice from 'src/images/header/HeaderDevice.svg'
import HeaderDefaultInstitution from 'src/images/header/HeaderDefaultInstitution.svg'
import HeaderBackdropDark from 'src/images/header/HeaderBackdropDark.svg'
import HeaderBackdropLight from 'src/images/header/HeaderBackdropLight.svg'

const propTypes = {
  institutionGuid: PropTypes.string,
}

export const ConnectInstitutionHeader = (props) => {
  const colorScheme = useSelector(selectColorScheme)
  const tokens = useTokens()
  const styles = getStyles(colorScheme, tokens)

  return (
    <div data-test="disclosure-svg-header" style={styles.container}>
      <div style={styles.backdropImage}>
        {colorScheme === COLOR_SCHEME.LIGHT ? <HeaderBackdropLight /> : <HeaderBackdropDark />}
        <div style={styles.device}>
          <HeaderDevice />
        </div>
        <div style={styles.institutionLogo}>
          {props.institutionGuid ? (
            <InstitutionLogo alt="" institutionGuid={props.institutionGuid} size={64} />
          ) : (
            <HeaderDefaultInstitution />
          )}
        </div>
      </div>
    </div>
  )
}

function getStyles() {
  const maxHeight = '64px'
  const maxWidth = '240px'

  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      margin: '0 auto',
      height: maxHeight,
      width: maxWidth,
    },
    backdropImage: {
      width: maxWidth,
      position: 'absolute',
      height: '40px',
    },
    device: {
      height: maxHeight,
      width: maxHeight,
      position: 'absolute',
      top: '-12px',
      left: '20px',
    },
    institutionLogo: {
      height: maxHeight,
      width: maxHeight,
      position: 'absolute',
      top: '-12px',
      right: '20px',
    },
  }
}

ConnectInstitutionHeader.propTypes = propTypes
