/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { Icon } from '@mxenabled/mxui'

import { useTokens } from '@kyper/tokenprovider'
import { Growth } from '@kyper/icon/Growth'
import { Image } from '@kyper/icon/Image'
import { Health } from '@kyper/icon/Health'

import { AccountTypes } from 'src/views/manualAccount/constants'

interface StyledAccountTypeIconProps {
  icon: string | number
  iconSize?: number
  size: number
  style?: object
}
export const StyledAccountTypeIcon: React.FC<StyledAccountTypeIconProps> = ({
  iconSize = 16,
  style = {},
  ...props
}) => {
  const tokens = useTokens()
  const styles = getStyles(tokens, props.size, style)

  const getIcon = () => {
    switch (props.icon) {
      case AccountTypes.CHECKING:
        return <Icon name="checkbook" size={iconSize} />
      case AccountTypes.SAVINGS:
        return <Icon name="savings" size={iconSize} />
      case AccountTypes.LOAN:
        return <Icon name="contract" size={iconSize} />
      case AccountTypes.CREDIT_CARD:
        return <Icon name="credit_card" size={iconSize} />
      case AccountTypes.INVESTMENT:
        return <Growth color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.LINE_OF_CREDIT:
        return <Icon name="description" size={iconSize} />
      case AccountTypes.MORTGAGE:
        return <Icon name="home" size={iconSize} />
      case AccountTypes.PROPERTY:
        return <Image color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.CASH:
        return <Icon name="local_atm" size={iconSize} />
      case AccountTypes.INSURANCE:
        return <Health color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.PREPAID:
        return <Icon name="credit_card" size={iconSize} />
      case AccountTypes.UNKNOWN:
        return <Icon name="grid_view" size={iconSize} />
      case 'accounts':
        return <Icon color="inherit" name="account_balance" size={iconSize} />
      default:
        return <Icon color="inherit" name="account_balance" size={iconSize} />
    }
  }
  return <div style={styles.wrapper}>{getIcon()}</div>
}

const getStyles = (tokens: any, size: number, style: object) => ({
  wrapper: {
    background: 'linear-gradient(to top right, rgba(77, 214, 214, 0.35), rgba(143, 69, 229, 0.35)',
    border: `1px solid rgba(18, 20, 23, 0.25)`,
    borderRadius: tokens.BorderRadius.Large,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: size,
    width: size,
    ...style,
  },
})
