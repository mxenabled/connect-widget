import React from 'react'
import PropTypes from 'prop-types'

import { List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { Icon, Text } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import styles from 'src/components/support/SupportMenu.module.css'

export const SupportMenu = React.forwardRef((props, menuRef) => {
  const { selectGeneralSupport } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_MENU)
  const getNextDelay = getDelay()

  return (
    <div ref={menuRef}>
      <SlideDown delay={getNextDelay()}>
        <Text className={styles.title} truncate={false} variant="H2">
          {__('Get help')}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <List disablePadding={true}>
          <ListItem disableGutters={true}>
            <ListItemButton onClick={selectGeneralSupport}>
              <ListItemText
                primary={__('Request support')}
                secondary={__('Get help connecting your account')}
              />
              <Icon name="chevron_right" size={24} />
            </ListItemButton>
          </ListItem>
        </List>
      </SlideDown>
    </div>
  )
})

SupportMenu.propTypes = {
  selectGeneralSupport: PropTypes.func.isRequired,
}

SupportMenu.displayName = 'SupportMenu'
