import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Icon, Text } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { FlushListContainer } from 'src/shared/MuiList/FlushListContainer'

export const SupportMenu = React.forwardRef((props, menuRef) => {
  const { selectGeneralSupport } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_MENU)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <div ref={menuRef}>
      <SlideDown delay={getNextDelay()}>
        <Text style={styles.title} truncate={false} variant="H2">
          {__('Get help')}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <FlushListContainer>
          <List>
            <ListItem>
              <ListItemButton onClick={selectGeneralSupport}>
                <ListItemText
                  primary={__('Request support')}
                  secondary={__('Get help connecting your account')}
                />
                <ListItemIcon>
                  <Icon name="chevron_right" size={24} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </List>
        </FlushListContainer>
      </SlideDown>
    </div>
  )
})

const getStyles = (tokens) => ({
  title: {
    display: 'block',
    marginBottom: tokens.Spacing.XSmall,
  },
})

SupportMenu.propTypes = {
  selectGeneralSupport: PropTypes.func.isRequired,
}

SupportMenu.displayName = 'SupportMenu'
