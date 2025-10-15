import React from 'react'
import { useSelector } from 'react-redux'

import { getIsLightColorScheme, selectConnectConfig } from 'src/redux/reducers/configSlice'

import AggWellsLightSvg from 'src/views/oauth/experiments/agg-wells-light.svg'
import AggWellsDarkSvg from 'src/views/oauth/experiments/agg-wells-dark.svg'
import IavWellsLightSvg from 'src/views/oauth/experiments/iav-wells-light.svg'
import IavWellsDarkSvg from 'src/views/oauth/experiments/iav-wells-dark.svg'
import { Icon, IconWeight, Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'

export const WELLS_FARGO_INSTRUCTIONS_FEATURE_NAME = 'WELLS_FARGO_INSTRUCTIONS'

function WellsFargoInstructions(props: React.FunctionComponent & { institutionName: string }) {
  const config = useSelector(selectConnectConfig)
  const isLight = useSelector(getIsLightColorScheme)
  const products = config?.data_request?.products || []
  const showProfileSelection =
    products.includes('account_verification') || products.includes('identity_verification')

  let wellsFargoImage = null
  if (isLight && showProfileSelection) {
    wellsFargoImage = <IavWellsLightSvg />
  } else if (isLight && !showProfileSelection) {
    wellsFargoImage = <AggWellsLightSvg />
  } else if (!isLight && showProfileSelection) {
    wellsFargoImage = <IavWellsDarkSvg />
  } else {
    wellsFargoImage = <AggWellsDarkSvg />
  }

  const instructionText = showProfileSelection
    ? __(
        'After logging in, share at least one account and %1profile information%2.',
        "<strong style='font-weight: bold;'>",
        '</strong>',
      )
    : __('After logging in, share at least one account.')

  return (
    <>
      <Text bold={true} component="h2" sx={{ mb: 12 }} truncate={false} variant="H2">
        {__('Log in at %1', props.institutionName)}
      </Text>
      <div>
        <Text
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: instructionText,
          }}
          style={{ display: 'inline' }}
          truncate={false}
          variant="body1"
        />
        {showProfileSelection && (
          <Icon
            color="secondary"
            name="info"
            size={20}
            sx={{ position: 'relative', bottom: '-2px' }}
            weight={IconWeight.Dark}
          />
        )}
      </div>

      <div style={{ width: '100%', marginTop: '12px' }}>{wellsFargoImage}</div>
    </>
  )
}

export { WellsFargoInstructions }
