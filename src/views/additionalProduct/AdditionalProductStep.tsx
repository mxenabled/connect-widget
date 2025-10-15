import React, { useImperativeHandle } from 'react'
import { Text } from '@mxenabled/mxui'
import { Button } from '@mui/material'
import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { useSelector, useDispatch } from 'react-redux'
import { getSelectedInstitution } from 'src/redux/selectors/Connect'
import { __ } from 'src/utilities/Intl'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { selectLocalizedContent } from 'src/redux/reducers/localizedContentSlice'
import { ActionTypes } from 'src/redux/actions/Connect'
import {
  addAggregationData,
  addVerificationData,
  selectConnectConfig,
} from 'src/redux/reducers/configSlice'
import { isConsentEnabled } from 'src/redux/reducers/userFeaturesSlice'

type AdditionalProductStepText = {
  title: string
  body: string
  acceptButtonText: string
  rejectButtonText: string
}

export const ADDITIONAL_PRODUCT_OPTIONS = [
  COMBO_JOB_DATA_TYPES.TRANSACTIONS,
  COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER,
]

const AdditionalProductStep = React.forwardRef((_, navigationRef) => {
  const dispatch = useDispatch()
  const connectConfig = useSelector(selectConnectConfig)
  const selectedInstitution = useSelector(getSelectedInstitution)
  const consentIsEnabled = useSelector(isConsentEnabled)
  const { add_aggregation = {}, add_verification = {} } =
    useSelector(selectLocalizedContent)?.connect?.additional_product_screen || {}

  useImperativeHandle(navigationRef, () => {
    return {
      showBackButton() {
        return true
      },
    }
  }, [])

  const getNextDelay = getDelay()

  // Apply customizable text for adding aggregation, if provided
  const addAggregationText: AdditionalProductStepText = {
    title: add_aggregation?.title || __('Add financial management?'),
    body:
      add_aggregation?.body ||
      __(
        "You're connecting this account for payments and transfers. Would you like to also enable financial management so you can track your income and spending?",
      ),
    acceptButtonText: add_aggregation?.button_1 || __('Yes, add financial management'),
    rejectButtonText: add_aggregation?.button_2 || __('No, only add transfers and payments'),
  }

  // Apply customizable text for adding verification, if provided
  const addVerificationText: AdditionalProductStepText = {
    title: add_verification?.title || __('Add transfers and payments?'),
    body:
      add_verification?.body ||
      __(
        "You're connecting this account for financial management. Would you like to also enable transfers and payments so you can quickly move money to and from this institution?",
      ),
    acceptButtonText: add_verification?.button_1 || __('Yes, add transfers and payments'),
    rejectButtonText: add_verification?.button_2 || __('No, only add financial management'),
  }

  const componentText =
    connectConfig.additional_product_option === COMBO_JOB_DATA_TYPES.TRANSACTIONS
      ? addAggregationText
      : addVerificationText

  return (
    <SlideDown delay={getNextDelay()}>
      <InstitutionBlock institution={selectedInstitution} style={{ marginBottom: 24 }} />

      <Text
        component="h2"
        data-test="additional-product__title-text"
        style={{ marginBottom: 12 }}
        truncate={false}
        variant="H2"
      >
        {componentText.title}
      </Text>

      <Text component="p" style={{ marginBottom: 32 }} truncate={false} variant="Paragraph">
        {componentText.body}
      </Text>

      <Button
        data-test="additional-product__accept-button"
        fullWidth={true}
        onClick={() => {
          dispatch(
            connectConfig?.additional_product_option === COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER
              ? addVerificationData({ consentIsEnabled })
              : addAggregationData({ consentIsEnabled }),
          )
        }}
        style={{ marginBottom: 8 }}
        variant="contained"
      >
        {componentText.acceptButtonText}
      </Button>

      <Button
        data-test="additional-product__reject-button"
        fullWidth={true}
        onClick={() => {
          // Go to the next step in the flow without changing the configuration
          dispatch({
            type: ActionTypes.REJECT_ADDITIONAL_PRODUCT,
            payload: {
              consentIsEnabled,
            },
          })
        }}
        variant="text"
      >
        {componentText.rejectButtonText}
      </Button>
    </SlideDown>
  )
})

AdditionalProductStep.displayName = 'AdditionalProductStep'

export default AdditionalProductStep
