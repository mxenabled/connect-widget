import React from 'react'
import { useSelector } from 'react-redux'

import 'src/views/oauth/experiments/PredirectInstructions.css'

import { selectConnectConfig } from 'src/redux/reducers/configSlice'

import { Icon, IconWeight, Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'
import { Divider, Paper } from '@mui/material'
import { ExampleCheckbox } from 'src/components/ExampleCheckbox'

export const WELLS_FARGO_INSTRUCTIONS_FEATURE_NAME = 'WELLS_FARGO_INSTRUCTIONS'
export const DEFAULT_HEADER_HEX_COLOR = '#444444'

function PredirectInstructions(
  props: React.FunctionComponent & {
    institution: { name?: string; brand_color_hex_code?: string }
  },
) {
  const config = useSelector(selectConnectConfig)
  const products = config?.data_request?.products || []
  const showProfileSelection =
    products.includes('account_verification') || products.includes('identity_verification')

  const institutionColor = props.institution?.brand_color_hex_code || DEFAULT_HEADER_HEX_COLOR // Goshawk Grey as a default

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

  /* Bold text is needed. The styles applied to this text prevent server-provided styles from ruining strong elements */
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
        {__('Log in at %1', props.institution.name)}
      </Text>
      <div className="predirect-instruction-text-wrapper">
        <Text
          className="predirect-instruction-text"
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: instructionText,
          }}
          truncate={false}
          variant="body1"
        />
        {showProfileSelection && (
          <Icon color="secondary" name="info" size={20} weight={IconWeight.Dark} />
        )}
      </div>

      <div className="institution-panel-wrapper">
        <Paper className="institution-panel" elevation={2}>
          {/* Inline color and font styles on the header and text because this is a dynamic area */}
          <div className="institution-panel-header" style={{ backgroundColor: institutionColor }}>
            <Text aria-hidden="true" sx={{ fontWeight: 600, color: 'white' }} uppercase={true}>
              {props.institution.name}
            </Text>
          </div>
          <div className="institution-panel-body">
            <ul aria-label={__('Information to select on the %1 site', props.institution.name)}>
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

                  const isLastItem = index === checkboxItems.length - 1

                  return (
                    <li key={item}>
                      <ExampleCheckbox
                        id={item}
                        pseudoFocusColor={institutionColor}
                        showTouchIndicator={isLastItem}
                      />
                      <Text className="psuedo-checkbox-label" variant="body1">
                        {text}
                      </Text>
                    </li>
                  )
                }
              })}
            </ul>
          </div>
        </Paper>
      </div>
    </>
  )
}

export { PredirectInstructions }
