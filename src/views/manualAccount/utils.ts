import { __ } from 'src/utilities/Intl'
import { AccountTypes, PropertyTypeNames } from 'src/views/manualAccount/constants'

interface field {
  label?: string
  name: string
  options?: { label: string; value: string }[]
  type: string
  validation?: {
    required?: boolean
    max?: number
    min?: number
    pattern?: string
  }
}

export const getFormFields = (accountType?: number) => {
  const fields: field[] = [
    {
      label: __('Account name'),
      name: 'user_name',
      type: 'TextInput',
      validation: {
        required: true,
      },
    },
    {
      label: __('Account balance'),
      name: 'balance',
      type: 'TextInput',
      validation: {
        pattern: 'number',
        max: 999999999999,
      },
    },
  ]

  if (accountType === AccountTypes.PROPERTY) {
    fields.push({
      label: __('Property type'),
      name: 'property_type',
      options: propertyTypeOptions(),
      type: 'Select',
      validation: {
        required: true,
      },
    })
  }

  if (usesInterestRateField(accountType)) {
    fields.push({
      label: __('Interest rate'),
      name: 'interest_rate',
      type: 'TextInput',
      validation: {
        pattern: 'number',
        min: 0,
        max: 100,
      },
    })
  }

  if (isAccountLiability(accountType)) {
    fields.push({
      label: __('Minimum payment'),
      name: 'minimum_payment',
      type: 'TextInput',
      validation: {
        pattern: 'number',
        max: 999999999999,
      },
    })
    fields.push({
      label: __('Day of the month payment is due'),
      name: 'day_payment_is_due',
      type: 'DateInput',
      validation: {
        required: true,
      },
    })
  }

  if (usesCreditLimitField(accountType)) {
    fields.push({
      label: __('Credit limit'),
      name: 'credit_limit',
      type: 'TextInput',
      validation: {
        pattern: 'number',
        max: 999999999999,
      },
    })
  }

  if (usesOriginalBalanceField(accountType)) {
    fields.push({
      label: __('Original balance'),
      name: 'original_balance',
      type: 'TextInput',
      validation: {
        pattern: 'number',
        max: 999999999999,
      },
    })
  }

  fields.push({
    name: 'is_personal',
    type: 'SelectionBox',
  })

  return fields
}

const propertyTypeOptions = () => {
  const types: { label: string; value: string }[] = []

  PropertyTypeNames.map((name, i) => {
    types.push({
      label: name,
      value: i.toString(),
    })
  })

  return types
}

/**
 * Helper Functions
 */
const usesInterestRateField = (accountType?: number) => {
  return (
    accountType === AccountTypes.SAVINGS ||
    accountType === AccountTypes.CHECKING ||
    accountType === AccountTypes.LINE_OF_CREDIT ||
    accountType === AccountTypes.CREDIT_CARD ||
    accountType === AccountTypes.LOAN ||
    accountType === AccountTypes.MORTGAGE
  )
}
const isAccountLiability = (accountType?: number) => {
  return (
    accountType === AccountTypes.CREDIT_CARD ||
    accountType === AccountTypes.LOAN ||
    accountType === AccountTypes.MORTGAGE ||
    accountType === AccountTypes.LINE_OF_CREDIT ||
    accountType === AccountTypes.CHECKING_LINE_OF_CREDIT
  )
}
const usesCreditLimitField = (accountType?: number) => {
  return (
    accountType === AccountTypes.LINE_OF_CREDIT ||
    accountType === AccountTypes.CREDIT_CARD ||
    accountType === AccountTypes.CHECKING_LINE_OF_CREDIT
  )
}
const usesOriginalBalanceField = (accountType?: number) => {
  return accountType === AccountTypes.LOAN || accountType === AccountTypes.MORTGAGE
}
