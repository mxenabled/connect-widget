import { __ } from 'src/utilities/Intl'

export const getConsentDataClusters = () => {
  const dataClusters = {
    accountInfo: {
      name: __('Account Information'),
      details: [
        __('Account name'),
        __('Account number'),
        __('Routing number'),
        __('Account type and description'),
        __('Account balances'),
        __('Credit limits'),
        __('Due dates'),
        __('Interest rates'),
      ],
      dataTest: 'consent-account-info',
      icon: 'account_balance',
    },
    paymentInfo: {
      name: __('Payment information'),
      details: [__('Account number'), __('Routing number')],
      dataTest: 'consent-payment-info',
      icon: 'checkbook',
    },
    contactInfo: {
      name: __('Contact information'),
      details: [__('Name(s)'), __('Email(s)'), __('Phone number(s)'), __('Address(es)')],
      dataTest: 'consent-contact-info',
      icon: 'person',
    },
    transactionInfo: {
      name: __('Transactions'),
      details: [
        __('Historical and current transactions'),
        __('Transaction types'),
        __('Transaction amounts'),
        __('Transaction dates'),
        __('Transaction descriptions'),
      ],
      dataTest: 'consent-transaction-info',
      icon: 'receipt_long',
    },
  }

  const aggConsentCluster = [
    dataClusters.accountInfo,
    dataClusters.transactionInfo,
    dataClusters.contactInfo,
  ]

  const iavConsentCluster = [
    dataClusters.accountInfo,
    dataClusters.paymentInfo,
    dataClusters.contactInfo,
  ]

  const iavAggCluster = [
    dataClusters.accountInfo,
    dataClusters.paymentInfo,
    dataClusters.transactionInfo,
    dataClusters.contactInfo,
  ]

  return {
    aggConsentCluster,
    iavConsentCluster,
    iavAggCluster,
  }
}
