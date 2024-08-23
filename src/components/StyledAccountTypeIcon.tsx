import React from 'react'

import { useTokens } from '@kyper/tokenprovider'
import { Accounts } from '@kyper/icon/Accounts'
import { Check } from '@kyper/icon/Check'
import { PiggyBankOutline } from '@kyper/icon/PiggyBankOutline'
import { Document } from '@kyper/icon/Document'
import { CreditCard } from '@kyper/icon/CreditCard'
import { Dollar } from '@kyper/icon/Dollar'
import { Growth } from '@kyper/icon/Growth'
import { Home } from '@kyper/icon/Home'
import { Notarized } from '@kyper/icon/Notarized'
import { Image } from '@kyper/icon/Image'
import { Health } from '@kyper/icon/Health'
import { Grid } from '@kyper/icon/Grid'

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
        return <Check color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.SAVINGS:
        return <PiggyBankOutline color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.LOAN:
        return <Document color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.CREDIT_CARD:
        return <CreditCard color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.INVESTMENT:
        return <Growth color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.LINE_OF_CREDIT:
        return <Notarized color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.MORTGAGE:
        return <Home color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.PROPERTY:
        return <Image color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.CASH:
        return <Dollar color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.INSURANCE:
        return <Health color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.PREPAID:
        return <CreditCard color={tokens.TextColor.Default} size={iconSize} />
      case AccountTypes.UNKNOWN:
        return <Grid color={tokens.TextColor.Default} size={iconSize} />
      case 'accounts':
        return <Accounts color={tokens.TextColor.Default} size={iconSize} />
      default:
        return <Accounts color={tokens.TextColor.Default} size={iconSize} />
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
