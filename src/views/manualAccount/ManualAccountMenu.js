import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { __ } from 'src/utilities/Intl'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { UtilityRow } from '@kyper/utilityrow'
import { ChevronRight } from '@kyper/icon/ChevronRight'
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

import { fadeOut } from 'src/utilities/Animation'

import { SlideDown } from 'src/components/SlideDown'

import { getDelay } from 'src/utilities/getDelay'
import { focusElement } from 'src/utilities/Accessibility'
import { AccountTypeNames, AccountTypes } from 'src/views/manualAccount/constants'
import { StyledAccountTypeIcon } from 'src/components/StyledAccountTypeIcon'

export const ManualAccountMenu = React.forwardRef((props, ref) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)
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
    [AccountTypes.SAVINGS]: <PiggyBankOutline color={tokens.TextColor.Default} />,
    [AccountTypes.LOAN]: <Document color={tokens.TextColor.Default} />,
    [AccountTypes.CREDIT_CARD]: <CreditCard color={tokens.TextColor.Default} />,
    [AccountTypes.INVESTMENT]: <Growth color={tokens.TextColor.Default} />,
    [AccountTypes.LINE_OF_CREDIT]: <Notarized color={tokens.TextColor.Default} />,
    [AccountTypes.MORTGAGE]: <Home color={tokens.TextColor.Default} />,
    [AccountTypes.PROPERTY]: <Image color={tokens.TextColor.Default} />,
    [AccountTypes.CASH]: <Dollar color={tokens.TextColor.Default} />,
    [AccountTypes.INSURANCE]: <Health color={tokens.TextColor.Default} />,
    [AccountTypes.PREPAID]: <CreditCard color={tokens.TextColor.Default} />,
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
        <StyledAccountTypeIcon icon="accounts" iconSize={40} size={64} />
        <Text
          component="h2"
          data-test="add-account-manually-header"
          style={styles.title}
          truncate={false}
          variant="H2"
        >
          {__('Add account manually')}
        </Text>
        <Text
          component="p"
          data-test="add-manual-account-paragraph"
          style={styles.body}
          truncate={false}
          variant="Paragraph"
        >
          {__("Track accounts, assets, and other things that don't have a live connection.")}
        </Text>
      </SlideDown>
      <SlideDown delay={getNextDelay()}>
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
            rightChildren={<ChevronRight />}
            title={AccountTypeNames[account_type]()}
          />
        ))}
      </SlideDown>
    </div>
  )
})

const getStyles = (tokens) => ({
  title: {
    marginBottom: tokens.Spacing.XSmall,
    marginTop: tokens.Spacing.Large,
  },
  body: {
    marginBottom: tokens.Spacing.XSmall,
  },
})

ManualAccountMenu.propTypes = {
  availableAccountTypes: PropTypes.array,
  handleAccountTypeSelect: PropTypes.func.isRequired,
}

ManualAccountMenu.displayName = 'ManualAccountMenu'
