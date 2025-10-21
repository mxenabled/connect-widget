import React from 'react'
import { useSelector } from 'react-redux'

import 'src/views/oauth/experiments/WellsFargoInstructions.css'

import { getIsLightColorScheme, selectConnectConfig } from 'src/redux/reducers/configSlice'

import AggWellsLightSvg from 'src/views/oauth/experiments/agg-wells-light.svg'
import AggWellsDarkSvg from 'src/views/oauth/experiments/agg-wells-dark.svg'
import IavWellsLightSvg from 'src/views/oauth/experiments/iav-wells-light.svg'
import IavWellsDarkSvg from 'src/views/oauth/experiments/iav-wells-dark.svg'
import { ViewTitle } from 'src/components/ViewTitle'
import { InstitutionLogo, Text } from '@mxenabled/mxui'
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
        'After logging in, select at least one %1account%2 and %1profile information%2.',
        "<strong style='font-weight: bold;'>",
        '</strong>',
      )
    : __(
        'After logging in, select at least one %1account%2 to connect.',
        "<strong style='font-weight: bold;'>",
        '</strong>',
      )

  return (
    <>
      <ViewTitle title={props.title ?? __('Log in at %1', props.institutionName)} />
      <Text
        color="textSecondary"
        dangerouslySetInnerHTML={{
          __html: instructionText,
        }}
        truncate={false}
        variant="Paragraph"
      />

      <div style={{ width: '100%', marginTop: '12px' }}>{wellsFargoImage}</div>
    </>
  )
}

function GenericCustomInstructions(
  props: React.FunctionComponent & { institutionGuid: string; institutionName: string },
) {
  return (
    <div className="institution-panel-wrapper">
      <div className="institution-panel">
        <div className="institution-panel-header">
          {/* <Text>{props.institutionName}</Text> */}
          <InstitutionLogo
            alt={props.institutionName}
            institutionGuid={props.institutionGuid}
            size={26}
          />
        </div>
        <div className="institution-panel-body">
          <ul>
            <li>
              <input checked={true} id="accounts" name="accounts" tabIndex={-1} type="checkbox" />
              <label htmlFor="accounts">{__('Checking or savings account')}</label>
            </li>
            <hr className="institution-panel-hr" />
            <li>
              <input checked={true} id="profile" name="profile" tabIndex={-1} type="checkbox" />
              <label htmlFor="profile">{__('Profile information')}</label>
            </li>
          </ul>
        </div>
      </div>
      <div className="institution-panel-inside-shadow" />
    </div>
  )
}

export { WellsFargoInstructions, GenericCustomInstructions }
