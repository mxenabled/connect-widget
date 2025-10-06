import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { Button } from '@mui/material'
import { Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

import { selectCurrentMode } from 'src/redux/reducers/configSlice'
import { stepToAddManualAccount, stepToMicrodeposits } from 'src/redux/actions/Connect'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

export const SearchNoResult = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH_NO_RESULTS, { search_term: props.searchTerm })
  const { onRequestInstitution, setAriaLiveRegionMessage } = props
  const timerRef = useRef(null)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  // Redux
  const dispatch = useDispatch()
  const enableManualAccounts = useSelector((state) => {
    const isManualAccountsEnabled = state.profiles.widgetProfile?.enable_manual_accounts
    const { isAggMode } = selectCurrentMode(state)
    const hasAtriumAPI = state.profiles.client?.has_atrium_api

    return isManualAccountsEnabled && isAggMode && !hasAtriumAPI
  })
  const enableSupportRequests = useSelector((state) => {
    const isSupportEnabled = state.profiles.widgetProfile?.enable_support_requests
    const { isAggMode } = selectCurrentMode(state)

    return isSupportEnabled && isAggMode
  })
  const isMicrodepositsEnabled = useSelector((state) => {
    const { isVerifyMode } = selectCurrentMode(state)
    const clientProfile = state.profiles.clientProfile || {}
    const widgetProfile = state.profiles.widgetProfile || {}

    return (
      isVerifyMode && // Widget is in Verify Mode
      clientProfile.account_verification_is_enabled && // Client supports verification
      clientProfile.is_microdeposits_enabled && // Client supports MDV
      widgetProfile.show_microdeposits_in_connect // Client enables MDV in widget
    )
  })

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
      <Text
        bold={true}
        data-test="0-search-results"
        style={styles.body}
        truncate={false}
        variant="Body"
      >
        {__('No results found for ”%1”', props.searchTerm)}
      </Text>
      <Text
        component="p"
        data-test="0-search-results-paragraph"
        style={styles.paragraph}
        truncate={false}
        variant="ParagraphSmall"
      >
        {__('Check spelling and try again, or try searching for another institution.')}
      </Text>

      <hr aria-hidden={true} style={styles.rule} />

      <div style={styles.transparentButton}>
        {enableManualAccounts && (
          <Button
            data-test="add-account-manually-button"
            onClick={() => dispatch(stepToAddManualAccount())}
            variant={'text'}
          >
            {__('Add account manually')}
          </Button>
        )}

        {enableSupportRequests && (
          <Button
            data-test="submit-an-institution-request-button"
            onClick={onRequestInstitution}
            variant={'text'}
          >
            {__('Submit an institution request')}
          </Button>
        )}

        {/* Microdeposits uses ACH which isn't availbale in Canada(fr-CA) so not translating */}
        {isMicrodepositsEnabled && (
          <Button
            data-test="connect-account-numbers-button"
            onClick={() => dispatch(stepToMicrodeposits())}
            variant={'text'}
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
  onRequestInstitution: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setAriaLiveRegionMessage: PropTypes.func.isRequired,
}
