import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { __ } from 'src/utilities/Intl'

import { useTokens } from '@kyper/tokenprovider'
import { Icon, Text } from '@mxenabled/mxui'
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Check } from '@kyper/icon/Check'
import { Growth } from '@kyper/icon/Growth'
import { Home } from '@kyper/icon/Home'
import { Notarized } from '@kyper/icon/Notarized'
import { Image } from '@kyper/icon/Image'
import { Health } from '@kyper/icon/Health'
import { Grid } from '@kyper/icon/Grid'

import { SlideDown } from 'src/components/SlideDown'

import { getDelay } from 'src/utilities/getDelay'
import { focusElement } from 'src/utilities/Accessibility'
import { AccountTypeNames, AccountTypes } from 'src/views/manualAccount/constants'
import { StyledAccountTypeIcon } from 'src/components/StyledAccountTypeIcon'
import { Stack } from '@mui/material'
import styles from 'src/views/manualAccount/ManualAccountMenu.module.css'

export const ManualAccountMenu = React.forwardRef((props, ref) => {
  const tokens = useTokens()
  const getNextDelay = getDelay()

  const typeList =
    props.availableAccountTypes?.length !== 0
      ? props.availableAccountTypes
      : [
          AccountTypes.CHECKING,
          AccountTypes.SAVINGS,
          AccountTypes.LOAN,
          AccountTypes.CREDIT_CARD,
          AccountTypes.INVESTMENT,
          AccountTypes.LINE_OF_CREDIT,
          AccountTypes.MORTGAGE,
          AccountTypes.PROPERTY,
          AccountTypes.CASH,
          AccountTypes.INSURANCE,
          AccountTypes.PREPAID,
          AccountTypes.UNKNOWN,
        ]

  const getIcon = {
    [AccountTypes.CHECKING]: <Check color={tokens.TextColor.Default} />,
    [AccountTypes.SAVINGS]: <Icon color="secondary" name="savings" size={20} />,
    [AccountTypes.LOAN]: <Icon color="secondary" name="contract" size={20} />,
    [AccountTypes.CREDIT_CARD]: <Icon color="secondary" name="credit_card" size={20} />,
    [AccountTypes.INVESTMENT]: <Growth color={tokens.TextColor.Default} />,
    [AccountTypes.LINE_OF_CREDIT]: <Notarized color={tokens.TextColor.Default} />,
    [AccountTypes.MORTGAGE]: <Home color={tokens.TextColor.Default} />,
    [AccountTypes.PROPERTY]: <Image color={tokens.TextColor.Default} />,
    [AccountTypes.CASH]: <Icon color="secondary" name="local_atm" size={20} />,
    [AccountTypes.INSURANCE]: <Health color={tokens.TextColor.Default} />,
    [AccountTypes.PREPAID]: <Icon color="secondary" name="credit_card" size={20} />,
    [AccountTypes.UNKNOWN]: <Grid color={tokens.TextColor.Default} />,
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      focusElement(document.querySelector('[data-test="back-button"]:first-of-type'))
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div data-test="manual-account-menu-container" ref={ref}>
      <SlideDown delay={getNextDelay()}>
        <Stack spacing={3}>
          <StyledAccountTypeIcon icon="accounts" iconSize={40} size={64} />
          <Stack spacing={1}>
            <Text
              component="h2"
              data-test="add-account-manually-header"
              truncate={false}
              variant="H2"
            >
              {__('Add account manually')}
            </Text>
            <Text
              component="p"
              data-test="add-manual-account-paragraph"
              truncate={false}
              variant="Paragraph"
            >
              {__("Track accounts, assets, and other things that don't have a live connection.")}
            </Text>
          </Stack>
        </Stack>
      </SlideDown>
      <SlideDown delay={getNextDelay()}>
        <List dense={true}>
          {typeList.map((account_type, i) => (
            <ListItem divider={true} key={i}>
              <ListItemButton
                aria-label={AccountTypeNames[account_type]()}
                data-test={`${AccountTypeNames[account_type]().replace(/\s+/g, '-')}-button`}
                onClick={() => props.handleAccountTypeSelect(account_type)}
              >
                <ListItemAvatar className={styles.listItemAvatar}>
                  {getIcon[account_type]}
                </ListItemAvatar>
                <ListItemText primary={AccountTypeNames[account_type]()} />
                <ListItemIcon>
                  <Icon name="chevron_right" size={24} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </SlideDown>
    </div>
  )
})

ManualAccountMenu.propTypes = {
  availableAccountTypes: PropTypes.array,
  handleAccountTypeSelect: PropTypes.func.isRequired,
}

ManualAccountMenu.displayName = 'ManualAccountMenu'
