import React, { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { __ } from 'src/utilities/Intl'
import { Icon, Text } from '@mxenabled/mxui'
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'

import { getDelay } from 'src/utilities/getDelay'
import { focusElement } from 'src/utilities/Accessibility'
import { AccountTypeNames, AccountTypes } from 'src/views/manualAccount/constants'
import { StyledAccountTypeIcon } from 'src/components/StyledAccountTypeIcon'
import { Stack } from '@mui/material'

export const ManualAccountMenu = React.forwardRef((props, ref) => {
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

  const iconSize = 24

  const getIcon = {
    [AccountTypes.CHECKING]: <Icon color="secondary" name="checkbook" size={iconSize} />,
    [AccountTypes.SAVINGS]: <Icon color="secondary" name="savings" size={iconSize} />,
    [AccountTypes.LOAN]: <Icon color="secondary" name="contract" size={iconSize} />,
    [AccountTypes.CREDIT_CARD]: <Icon color="secondary" name="credit_card" size={iconSize} />,
    [AccountTypes.INVESTMENT]: <Icon color="secondary" name="bid_landscape" size={iconSize} />,
    [AccountTypes.LINE_OF_CREDIT]: <Icon color="secondary" name="description" size={iconSize} />,
    [AccountTypes.MORTGAGE]: <Icon color="secondary" name="home" size={iconSize} />,
    [AccountTypes.PROPERTY]: <Icon color="secondary" name="holiday_village" size={iconSize} />,
    [AccountTypes.CASH]: <Icon color="secondary" name="local_atm" size={iconSize} />,
    [AccountTypes.INSURANCE]: <Icon color="secondary" name="diagnosis" size={iconSize} />,
    [AccountTypes.PREPAID]: <Icon color="secondary" name="credit_card" size={iconSize} />,
    [AccountTypes.UNKNOWN]: <Icon color="secondary" name="grid_view" size={iconSize} />,
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
          <Stack spacing={1} useFlexGap={true}>
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
            <List dense={true}>
              {typeList.map((account_type) => (
                <Fragment key={account_type}>
                  <ListItem disableGutters={true}>
                    <ListItemButton
                      aria-label={AccountTypeNames[account_type]()}
                      data-test={`${AccountTypeNames[account_type]().replace(/\s+/g, '-')}-button`}
                      onClick={() => props.handleAccountTypeSelect(account_type)}
                    >
                      <ListItemAvatar>{getIcon[account_type]}</ListItemAvatar>
                      <ListItemText disableTypography={true}>
                        <Text variant="body1">{AccountTypeNames[account_type]()}</Text>
                      </ListItemText>
                      <ListItemIcon>
                        <Icon name="chevron_right" size={iconSize} />
                      </ListItemIcon>
                    </ListItemButton>
                  </ListItem>
                </Fragment>
              ))}
            </List>
          </Stack>
        </Stack>
      </SlideDown>
    </div>
  )
})

ManualAccountMenu.propTypes = {
  availableAccountTypes: PropTypes.array,
  handleAccountTypeSelect: PropTypes.func.isRequired,
}

ManualAccountMenu.displayName = 'ManualAccountMenu'
