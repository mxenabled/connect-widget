import React, { useImperativeHandle } from 'react'
import { Text } from '@kyper/mui'
import { Button } from '@mui/material'
import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { useSelector } from 'react-redux'
import { getSelectedInstitution } from 'src/redux/selectors/Connect'
import { __ } from 'src/utilities/Intl'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

type AdditionalProductStepText = {
  title: string
  body: string
  acceptButtonText: string
  rejectButtonText: string
}

type OfferProductName = 'transactions' | 'account_verification'

export const ADDITIONAL_PRODUCT_OPTIONS = [
  COMBO_JOB_DATA_TYPES.TRANSACTIONS,
  COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER,
]

type OfferAdditionalProductProps = {
  additionalProductName: OfferProductName
  onNoClick: () => void
  onYesClick: () => void
}

const AdditionalProductStep = React.forwardRef(
  (
    {
      additionalProductName,
      onNoClick = () => {
        throw new Error('onNoClick not implemented')
      },
      onYesClick = () => {
        throw new Error('onYesClick not implemented')
      },
    }: OfferAdditionalProductProps,
    navigationRef,
  ) => {
    const selectedInstitution = useSelector(getSelectedInstitution)

    useImperativeHandle(navigationRef, () => {
      return {
        showBackButton() {
          return true
        },
      }
    }, [])

    const addAggregationText: AdditionalProductStepText = {
      title: __('Add financial management?'),
      body: __(
        'You are connecting this account for payments and transfers. Would you also like to connect it for financial management to track income and spending?',
      ),
      acceptButtonText: __('Yes, add financial management'),
      rejectButtonText: __('No, just transfers and payments'),
    }

    const addVerificationText: AdditionalProductStepText = {
      title: __('Add transfers and payments?'),
      body: __(
        'You are connecting this account for financial management. Would you also like to connect it for transfers and payments to quickly move money to and from this institution?',
      ),
      acceptButtonText: __('Yes, add transfers and payments'),
      rejectButtonText: __('No, just financial management'),
    }

    const componentText =
      additionalProductName === COMBO_JOB_DATA_TYPES.TRANSACTIONS
        ? addAggregationText
        : addVerificationText

    return (
      <div>
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

        <Text component="p" style={{ marginBottom: 32 }} truncate={false} variant="ParagraphSmall">
          {componentText.body}
        </Text>

        <Button
          data-test="additional-product__accept-button"
          fullWidth={true}
          onClick={() => {
            onYesClick()
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
            onNoClick()
          }}
          variant="text"
        >
          {componentText.rejectButtonText}
        </Button>
      </div>
    )
  },
)

AdditionalProductStep.displayName = 'AdditionalProductStep'

export default AdditionalProductStep
