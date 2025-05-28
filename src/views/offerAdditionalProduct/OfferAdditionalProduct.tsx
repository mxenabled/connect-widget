import React from 'react'
import { Text } from '@kyper/mui'
import { Button } from '@mui/material'
import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { useSelector } from 'react-redux'
import { getSelectedInstitution } from 'src/redux/selectors/Connect'
import { __ } from 'src/utilities/Intl'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

type OfferComponentText = {
  title: string
  body: string
  acceptButtonText: string
  rejectButtonText: string
}

type OfferProductName = 'transactions' | 'account_verification'

export const SUPPORTED_PRODUCT_OFFERS = [
  COMBO_JOB_DATA_TYPES.TRANSACTIONS,
  COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER,
]

const OfferAdditionalProduct = (props: { offerProductName: OfferProductName }) => {
  const selectedInstitution = useSelector(getSelectedInstitution)

  const offerAggregationText: OfferComponentText = {
    title: __('Add financial management?'),
    body: __(
      'You are connecting this account for payments and transfers. Would you also like to connect it for financial management to track income and spending?',
    ),
    acceptButtonText: __('Yes, add financial management'),
    rejectButtonText: __('No, just transfers and payment'),
  }

  const offerVerificationText: OfferComponentText = {
    title: __('Add transfers and payments?'),
    body: __(
      'You are connecting this account for financial management. Would you also like to connect it for transfers and payments to quickly move money to and from this institution?',
    ),
    acceptButtonText: __('Yes, add transfers and payments'),
    rejectButtonText: __('No, just financial management'),
  }

  const componentText =
    props.offerProductName === COMBO_JOB_DATA_TYPES.TRANSACTIONS
      ? offerAggregationText
      : offerVerificationText

  return (
    <div>
      <InstitutionBlock institution={selectedInstitution} style={{ marginBottom: 24 }} />

      <Text
        component="h2"
        data-test="offer__title-text"
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
        data-test="offer__accept-button"
        fullWidth={true}
        onClick={() => {
          //   console.log('Offer Product: Yes clicked')
        }}
        style={{ marginBottom: 8 }}
        variant="contained"
      >
        {componentText.acceptButtonText}
      </Button>

      <Button
        data-test="offer__reject-button"
        fullWidth={true}
        onClick={() => {
          //   console.log('Offer Product: No clicked')
        }}
        variant="text"
      >
        {componentText.rejectButtonText}
      </Button>
    </div>
  )
}

export default OfferAdditionalProduct
