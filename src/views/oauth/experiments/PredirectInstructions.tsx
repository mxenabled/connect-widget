import React from 'react'

import 'src/views/oauth/experiments/PredirectInstructions.css'

import { Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'
import { Divider, Paper } from '@mui/material'
import { ExampleCheckbox } from 'src/components/ExampleCheckbox'
import {
  getInstitutionBrandColor,
  isWellsFargoInstitution,
  OAUTH_PREDIRECT_INSTRUCTION,
} from 'src/views/oauth/experiments/predirectInstructionsUtils'

export const WELLS_FARGO_INSTRUCTIONS_FEATURE_NAME = 'WELLS_FARGO_INSTRUCTIONS'
export const DEFAULT_HEADER_HEX_COLOR = '#444444'

function PredirectInstructions(
  props: React.FunctionComponent & {
    institution: InstitutionResponseType
  },
) {
  // Filter out any invalid instruction values
  const configuredPredirectInstructions = Array.isArray(
    props.institution?.oauth_predirect_instructions,
  )
    ? [...props.institution.oauth_predirect_instructions].filter((instruction) =>
        Object.values(OAUTH_PREDIRECT_INSTRUCTION).includes(instruction),
      )
    : []

  // Give Wells Fargo a default predirect instruction if none are configured, because we experimented on
  // Wells Fargo, and want to maintain the experience, until it is fully configured in the backend.
  if (isWellsFargoInstitution(props.institution) && configuredPredirectInstructions.length === 0) {
    configuredPredirectInstructions.push(
      OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION,
    )

    configuredPredirectInstructions.push(
      OAUTH_PREDIRECT_INSTRUCTION.PROFILE_INFORMATION_INSTRUCTION,
    )
  }

  // If the instructions are still empty, provide a default of account and transactions
  // for a better user experience.
  if (configuredPredirectInstructions.length === 0) {
    configuredPredirectInstructions.push(
      OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION,
    )
  }

  const institutionColor = getInstitutionBrandColor(props.institution, DEFAULT_HEADER_HEX_COLOR)

  const uiElementTypes = {
    [OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION]:
      'checking-or-savings-account',
    [OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_NUMBERS_INSTRUCTION]: 'account-numbers',
    [OAUTH_PREDIRECT_INSTRUCTION.PROFILE_INFORMATION_INSTRUCTION]: 'profile',
    [OAUTH_PREDIRECT_INSTRUCTION.STATEMENTS_INSTRUCTION]: 'statements',
    [OAUTH_PREDIRECT_INSTRUCTION.TAX_INSTRUCTION]: 'tax',
  }

  const checkboxItems: string[] = []
  configuredPredirectInstructions.forEach((instruction) => {
    const uiElementType = uiElementTypes[instruction]
    if (uiElementType) {
      checkboxItems.push(uiElementType)
    }
  })

  /* Bold text is needed. The styles applied to this text prevent server-provided styles from ruining strong elements */
  const instructionText = __(
    'To complete your connection, please %1share%2 the following after signing in:',
    "<strong style='font-weight: bold;'>",
    '</strong>',
  )

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
                let text = ''
                switch (item) {
                  case uiElementTypes[
                    OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_AND_TRANSACTIONS_INSTRUCTION
                  ]:
                    text = __('Checking or savings account')
                    break
                  case uiElementTypes[OAUTH_PREDIRECT_INSTRUCTION.ACCOUNT_NUMBERS_INSTRUCTION]:
                    text = __('Account numbers')
                    break
                  case uiElementTypes[OAUTH_PREDIRECT_INSTRUCTION.PROFILE_INFORMATION_INSTRUCTION]:
                    text = __('Profile information')
                    break
                  case uiElementTypes[OAUTH_PREDIRECT_INSTRUCTION.STATEMENTS_INSTRUCTION]:
                    text = __('Statements')
                    break
                  case uiElementTypes[OAUTH_PREDIRECT_INSTRUCTION.TAX_INSTRUCTION]:
                    text = __('Tax documents')
                    break
                }

                const isLastItem = index === checkboxItems.length - 1

                return (
                  <React.Fragment key={item}>
                    <li>
                      <ExampleCheckbox
                        id={item}
                        pseudoFocusColor={institutionColor}
                        showTouchIndicator={isLastItem}
                      />
                      <Text className="psuedo-checkbox-label" variant="body1">
                        {text}
                      </Text>
                    </li>

                    {!isLastItem && <Divider />}
                  </React.Fragment>
                )
              })}
            </ul>
          </div>
        </Paper>
      </div>
    </>
  )
}

export { PredirectInstructions }
