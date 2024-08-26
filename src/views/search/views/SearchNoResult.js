import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import { Button } from '@kyper/button'

import { Text } from '@kyper/text'
import { useTokens } from '@kyper/tokenprovider'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

export const SearchNoResult = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH_NO_RESULTS, { search_term: props.searchTerm })
  const {
    enableManualAccounts,
    enableSupportRequests,
    isMicrodepositsEnabled,
    onAddManualAccountClick,
    onRequestInstitution,
    onVerifyWithMicrodeposits,
    setAriaLiveRegionMessage,
  } = props
  const timerRef = useRef(null)
  const tokens = useTokens()
  const styles = getStyles(tokens)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setAriaLiveRegionMessage(__('No results found for ”%1”', props.searchTerm))
    }, 500)
    return () => {
      clearTimeout(timerRef.current)
      setAriaLiveRegionMessage('')
    }
  }, [])

  return (
    <div style={styles.container}>
      <Text as="Body" bold={true} data-test="0-search-results" style={styles.body}>
        {__('No results found for ”%1”', props.searchTerm)}
      </Text>
      <Text
        as="ParagraphSmall"
        data-test="0-search-results-paragraph"
        style={styles.paragraph}
        tag="p"
      >
        {__('Check spelling and try again, or try searching for another institution.')}
      </Text>

      <hr aria-hidden={true} style={styles.rule} />

      <div style={styles.transparentButton}>
        {enableManualAccounts && (
          <Button
            data-test="add-account-manually-button"
            onClick={onAddManualAccountClick}
            variant={'transparent'}
          >
            {__('Add account manually')}
          </Button>
        )}

        {enableSupportRequests && (
          <Button
            data-test="submit-an-institution-request-button"
            onClick={onRequestInstitution}
            variant={'transparent'}
          >
            {__('Submit an institution request')}
          </Button>
        )}

        {/* Microdeposits uses ACH which isn't availbale in Canada(fr-CA) so not translating */}
        {isMicrodepositsEnabled && (
          <Button
            data-test="connect-account-numbers-button"
            onClick={onVerifyWithMicrodeposits}
            variant={'transparent'}
          >
            {__('Connect with account numbers')}
          </Button>
        )}
      </div>
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      overflow: 'auto',
      maxHeight: '100%',
    },
    body: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.Tiny,
    },
    paragraph: {
      marginBottom: tokens.Spacing.Large,
    },
    rule: {
      margin: `${tokens.Spacing.Small}px 0`,
    },
    transparentButton: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px',
    },
  }
}

SearchNoResult.propTypes = {
  enableManualAccounts: PropTypes.bool.isRequired,
  enableSupportRequests: PropTypes.bool.isRequired,
  isMicrodepositsEnabled: PropTypes.bool.isRequired,
  onAddManualAccountClick: PropTypes.func.isRequired,
  onRequestInstitution: PropTypes.func.isRequired,
  onVerifyWithMicrodeposits: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setAriaLiveRegionMessage: PropTypes.func.isRequired,
}
