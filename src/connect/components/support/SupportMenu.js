import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { UtilityRow } from '@kyper/utilityrow'
import { ChevronRight } from '@kyper/icon/ChevronRight'
import { Text } from '@kyper/text'

import { __ } from 'src/connect/utilities/Intl'

import { SlideDown } from 'src/connect/components/SlideDown'
import { GoBackButton } from 'src/connect/components/GoBackButton'
import { getDelay } from 'src/connect/utilities/getDelay'
import useAnalyticsPath from 'src/connect/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/connect/const/Analytics'

import { shouldShowConnectGlobalNavigationHeader } from 'reduxify/reducers/userFeaturesSlice'

export const SupportMenu = React.forwardRef((props, menuRef) => {
  const { handleClose, selectGeneralSupport, selectRequestInstitution } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_MENU)
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <div ref={menuRef}>
      <SlideDown delay={getNextDelay()}>
        {!showConnectGlobalNavigationHeader && <GoBackButton handleGoBack={handleClose} />}
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

const getStyles = tokens => ({
  title: {
    display: 'block',
    marginBottom: tokens.Spacing.XSmall,
  },
})

SupportMenu.propTypes = {
  handleClose: PropTypes.func.isRequired,
  selectGeneralSupport: PropTypes.func.isRequired,
  selectRequestInstitution: PropTypes.func.isRequired,
}

SupportMenu.displayName = 'SupportMenu'
