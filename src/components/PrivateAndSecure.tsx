import React from 'react'

import { Icon } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'
import styles from 'src/components/PrivateAndSecure.module.css'

interface PrivateAndSecureProps {
  style?: object
}

export const PrivateAndSecure: React.FC<PrivateAndSecureProps> = ({ style }) => {
  return (
    <div className={styles.secureSeal} data-test="private-secure-footer" style={style}>
      <Icon name="lock" size={12} />
      {
        // --TR: This is a "MX" slogan bank level security meaning as safe as banks are able
        __('Private and secure')
      }
    </div>
  )
}
