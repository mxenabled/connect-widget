import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { UtilityRow } from '@kyper/utilityrow'
import { ChevronRight } from '@kyper/icon/ChevronRight'
import { Text } from '@kyper/text'

import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/connect/components/SlideDown'
import { getDelay } from 'src/connect/utilities/getDelay'
import useAnalyticsPath from 'src/connect/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/connect/const/Analytics'

export const SupportMenu = React.forwardRef((props, menuRef) => {
  const { selectGeneralSupport, selectRequestInstitution } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_MENU)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <div ref={menuRef}>
      <SlideDown delay={getNextDelay()}>
        <Text style={styles.title} tag="h2">
          {__('Get help')}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <UtilityRow
          borderType="inset-left"
          onClick={selectRequestInstitution}
          rightChildren={<ChevronRight />}
          subTitle={__('Request to have it added')}
          title={__("Can't find your bank?")}
        />
        <UtilityRow
          borderType="inset-left"
          onClick={selectGeneralSupport}
          rightChildren={<ChevronRight />}
          subTitle={__('Get help connecting your account')}
          title={__('Request support')}
        />
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
  selectRequestInstitution: PropTypes.func.isRequired,
}

SupportMenu.displayName = 'SupportMenu'
