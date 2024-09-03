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
      </div>
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
      zIndex: 10,
    },
    device: {
      height: maxHeight,
      width: maxHeight,
      marginLeft: '20px',
    },
    institutionLogo: {
      height: maxHeight,
      width: maxHeight,
      marginLeft: '72px',
      zIndex: 20,
    },
  }
}

const SVGImagePropTypes = {
  image: PropTypes.string.isRequired,
  styles: PropTypes.object,
}

const SVGImage = (props) => {
  const styles = {
    zIndex: 20,
    ...props.styles,
  }

  return <div dangerouslySetInnerHTML={{ __html: props.image }} style={styles} />
}

SVGImage.propTypes = SVGImagePropTypes
ConnectInstitutionHeader.propTypes = propTypes
