import React from 'react'
import { useSelector } from 'react-redux'

import { getIsLightColorScheme, selectConnectConfig } from 'src/redux/reducers/configSlice'
import AggWellsLightSvg from 'src/views/oauth/experiments/agg-wells-light.svg'
import AggWellsDarkSvg from 'src/views/oauth/experiments/agg-wells-dark.svg'
import IavWellsLightSvg from 'src/views/oauth/experiments/iav-wells-light.svg'
import IavWellsDarkSvg from 'src/views/oauth/experiments/iav-wells-dark.svg'
import { ViewTitle } from 'src/components/ViewTitle'
import { Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'

export const WELLS_FARGO_INSTRUCTIONS_FEATURE_NAME = 'WELLS_FARGO_INSTRUCTIONS'

function WellsFargoInstructions(
  props: React.FunctionComponent & { title: string; institutionName: string },
) {
  const config = useSelector(selectConnectConfig)
  const isLight = useSelector(getIsLightColorScheme)
  const products = config?.data_request?.products || []
  const showProfileSelection =
    products.includes('account_verification') || products.includes('identity_verification')

  let wellsFargoImage = null
  if (isLight && showProfileSelection) {
    wellsFargoImage = <IavWellsLightSvg style={{ width: '100%' }} />
  } else if (isLight && !showProfileSelection) {
    wellsFargoImage = <AggWellsLightSvg style={{ width: '100%' }} />
  } else if (!isLight && showProfileSelection) {
    wellsFargoImage = <IavWellsDarkSvg style={{ width: '100%' }} />
  } else {
    wellsFargoImage = <AggWellsDarkSvg style={{ width: '100%' }} />
  }

  return (
    <>
      <ViewTitle title={props.title ?? __('Log in at %1', props.institutionName)} />
      <Text
        color="textSecondary"
        dangerouslySetInnerHTML={{
          __html: __(
            'After logging in, select at least one %1account%2 to connect.',
            "<strong style='font-weight: bold;'>",
            '</strong>',
          ),
        }}
        truncate={false}
        variant="Paragraph"
      />

      {wellsFargoImage}
    </>
  )
}

export { WellsFargoInstructions }
