import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { css } from '@mxenabled/cssinjs'

import { useTokens } from '@kyper/tokenprovider'

import { selectColorScheme } from 'src/redux/reducers/configSlice'
import { COLOR_SCHEME } from 'src/const/Connect'
import ConnectHeaderRecipientLight from 'src/images/header/ConnectHeaderRecipientLight.png'
import ConnectHeaderRecipientDark from 'src/images/header/ConnectHeaderRecipientDark.png'

export const ClientLogo = ({
  alt = 'Client logo',
  className,
  clientGuid,
  size = 32,
  style = {},
}) => {
  const colorScheme = useSelector(selectColorScheme)
  const tokens = useTokens()
  const backUpSrc =
    colorScheme === COLOR_SCHEME.LIGHT ? ConnectHeaderRecipientLight : ConnectHeaderRecipientDark
  const src = `https://content.moneydesktop.com/storage/MD_Client/oauth_logos/${clientGuid}.png`

  return (
    <img
      alt={alt}
      className={`${css({
        borderRadius: tokens.BorderRadius.Large,
        backgroundColor: tokens.Color.NeutralWhite,
      })} ${className}`}
      height={size}
      onError={(e) => (e.target.src = backUpSrc)}
      src={src}
      style={style}
      width={size}
    />
  )
}

ClientLogo.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
  clientGuid: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
}
