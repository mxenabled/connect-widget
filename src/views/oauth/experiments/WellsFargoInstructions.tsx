import React from 'react'
import { useSelector } from 'react-redux'

import 'src/views/oauth/experiments/WellsFargoInstructions.css'

import { selectConnectConfig } from 'src/redux/reducers/configSlice'

import { Icon, IconWeight, Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'
import { Checkbox, Divider, Paper } from '@mui/material'

export const WELLS_FARGO_INSTRUCTIONS_FEATURE_NAME = 'WELLS_FARGO_INSTRUCTIONS'

function PredirectInstructions(props: React.FunctionComponent & { institutionName: string }) {
  // const isLight = useSelector(getIsLightColorScheme)
  const config = useSelector(selectConnectConfig)
  const products = config?.data_request?.products || []
  const showProfileSelection =
    products.includes('account_verification') || products.includes('identity_verification')

  const uiElementTypes = {
    CHECKING_OR_SAVINGS_ACCOUNT: 'checking-or-savings-account',
    DIVIDER: 'divider',
    PROFILE_INFORMATION: 'profile',
  }
  const checkboxItems = [uiElementTypes.CHECKING_OR_SAVINGS_ACCOUNT]

  if (showProfileSelection) {
    checkboxItems.push(uiElementTypes.DIVIDER)
    checkboxItems.push(uiElementTypes.PROFILE_INFORMATION)
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

      <div className="institution-panel-wrapper">
        <Paper className="institution-panel" elevation={2}>
          <div className="institution-panel-header">
            <Text aria-hidden="true" sx={{ fontWeight: 600, color: 'white' }} uppercase={true}>
              {props.institutionName}
            </Text>
          </div>
          <div className="institution-panel-body">
            <ul aria-label={__('Information to select on the %1 site', props.institutionName)}>
              {checkboxItems.map((item, index) => {
                if (item === uiElementTypes.DIVIDER) {
                  return <Divider key={`divider-${index}`} />
                } else {
                  let text = ''
                  if (item === uiElementTypes.CHECKING_OR_SAVINGS_ACCOUNT) {
                    text = __('Checking or savings account')
                  } else if (item === uiElementTypes.PROFILE_INFORMATION) {
                    text = __('Profile information')
                  }

                  return (
                    <li key={item}>
                      <Checkbox
                        aria-hidden="true"
                        checked={true}
                        color="default"
                        id={item}
                        name={item}
                        size="small"
                        tabIndex={-1}
                      />
                      <Text variant="body1">{text}</Text>
                    </li>
                  )
                }
              })}
            </ul>
          </div>
        </Paper>
        <div className="institution-panel-inside-shadow" />
      </div>
    </>
  )
}

export { PredirectInstructions }
