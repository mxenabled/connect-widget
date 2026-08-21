import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { __ } from 'src/utilities/Intl'

import { useTokens } from '@kyper/tokenprovider'
import { Icon, Text } from '@mxenabled/mxui'
import { UtilityRow } from '@kyper/utilityrow'
import { Growth } from '@kyper/icon/Growth'
import { Image } from '@kyper/icon/Image'
import { Health } from '@kyper/icon/Health'

import { fadeOut } from 'src/utilities/Animation'

import { SlideDown } from 'src/components/SlideDown'

import { getDelay } from 'src/utilities/getDelay'
import { focusElement } from 'src/utilities/Accessibility'
import { AccountTypeNames, AccountTypes } from 'src/views/manualAccount/constants'
import { StyledAccountTypeIcon } from 'src/components/StyledAccountTypeIcon'
import { Stack } from '@mui/material'

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
    [AccountTypes.CHECKING]: <Icon color="secondary" name="checkbook" size={20} />,
    [AccountTypes.SAVINGS]: <Icon color="secondary" name="savings" size={20} />,
    [AccountTypes.LOAN]: <Icon color="secondary" name="contract" size={20} />,
    [AccountTypes.CREDIT_CARD]: <Icon color="secondary" name="credit_card" size={20} />,
    [AccountTypes.INVESTMENT]: <Growth color={tokens.TextColor.Default} />,
    [AccountTypes.LINE_OF_CREDIT]: <Icon color="secondary" name="description" size={20} />,
    [AccountTypes.MORTGAGE]: <Icon color="secondary" name="home" size={20} />,
    [AccountTypes.PROPERTY]: <Image color={tokens.TextColor.Default} />,
    [AccountTypes.CASH]: <Icon color="secondary" name="local_atm" size={20} />,
    [AccountTypes.INSURANCE]: <Health color={tokens.TextColor.Default} />,
    [AccountTypes.PREPAID]: <Icon color="secondary" name="credit_card" size={20} />,
    [AccountTypes.UNKNOWN]: <Icon color="secondary" name="grid_view" size={20} />,
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
        <Stack>
          {typeList.map((account_type, i) => (
            <UtilityRow
              aria-label={AccountTypeNames[account_type]()}
              borderType="inset-left"
              data-test={`${AccountTypeNames[account_type]().replace(/\s+/g, '-')}-button`}
              key={i}
              leftChildren={getIcon[account_type]}
              onClick={() =>
                fadeOut(ref.current, 'up', 300).then(props.handleAccountTypeSelect(account_type))
              }
              rightChildren={<Icon name="chevron_right" size={24} />}
              title={AccountTypeNames[account_type]()}
            />
          ))}
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
