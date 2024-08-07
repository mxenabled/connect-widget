import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Button } from '@kyper/button'

import useAnalyticsPath from 'src/connect/hooks/useAnalyticsPath'
import { AnalyticEvents, PageviewInfo } from 'src/connect/const/Analytics'

import { __, _n } from 'src/connect/utilities/Intl'

import { SlideDown } from 'src/connect/components/SlideDown'
import { getDelay } from 'src/connect/utilities/getDelay'
import { LoadingSpinner } from 'src/connect/components/LoadingSpinner'
import { SEARCH_PAGE_DEFAULT } from 'src/connect/views/search/consts'
import { InstituionGrid } from 'src/connect/views/search/views/InstitutionGrid'

export const SearchedInstitutionsList = props => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCHED)
  const {
    currentSearchResults,
    enableManualAccounts,
    enableSupportRequests,
    institutions,
    institutionSearch,
    isMicrodepositsEnabled,
    handleSelectInstitution,
    onAddManualAccountClick,
    onRequestInstitution,
    onVerifyWithMicrodeposits,
    setAriaLiveRegionMessage,
  } = props
  const tokens = useTokens()

  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const [currentPage, setCurrentPage] = useState(SEARCH_PAGE_DEFAULT)
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false)
  const shouldShowLoadMore = !!currentSearchResults.length && !isLoadingInstitutions

  useEffect(() => {
    setAriaLiveRegionMessage(_n('%1 search result', '%1 search results', institutions.length))
    return () => {
      setAriaLiveRegionMessage('')
    }
  }, [institutions.length])

  useEffect(() => {
    if (!isLoadingInstitutions) return () => {}

    const institutionSearch$ = institutionSearch(currentPage).subscribe(() =>
      setIsLoadingInstitutions(false),
    )

    return () => {
      institutionSearch$.unsubscribe()
    }
  }, [currentPage, isLoadingInstitutions])

  const loadMoreInstitutionsHandler = () => {
    setCurrentPage(currentPage + 1)
    setIsLoadingInstitutions(true)
  }

  return (
    <div style={styles.container}>
      <SlideDown delay={getNextDelay()}>
        <Text as="Paragraph" style={styles.paragraph}>
          {_n('%1 search result', '%1 search results', institutions.length)}
        </Text>

        <InstituionGrid
          handleSelectInstitution={handleSelectInstitution}
          institutions={institutions}
          posthogEvent={AnalyticEvents.SELECT_SEARCHED_INSTITUTION}
        />
      </SlideDown>

      <hr aria-hidden={true} style={styles.rule} />
      <SlideDown delay={getNextDelay()}>
        {isLoadingInstitutions && (
          <div style={styles.spinner}>
            <LoadingSpinner size={32} />
          </div>
        )}
        <div style={styles.transparentButton}>
          {shouldShowLoadMore && (
            <Button
              data-test="load-more-institutions-button"
              onClick={loadMoreInstitutionsHandler}
              variant={'transparent'}
            >
              {__('Load more institutions')}
            </Button>
          )}
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
              data-test="submit-institution-request-button"
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
      </SlideDown>
    </div>
  )
}

const getStyles = tokens => {
  return {
    container: {
      display: 'flex',
      background: tokens.BackgroundColor.Container,
      flexFlow: 'column',
      alignItems: 'center',
      marginLeft: `-${tokens.Spacing.Small}px`,
      marginRight: `-${tokens.Spacing.Small}px`,
      overflowY: 'auto',
      overflowX: 'hidden',
      maxHeight: '100%',
    },
    paragraph: {
      display: 'block',
      margin: `0 0 ${tokens.Spacing.Tiny}px ${tokens.Spacing.Small}px`,
    },
    subhead: {
      marginBottom: tokens.Spacing.XSmall,
    },
    rule: {
      margin: tokens.Spacing.Small,
      alignSelf: 'stretch',
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

SearchedInstitutionsList.propTypes = {
  currentSearchResults: PropTypes.array.isRequired,
  enableManualAccounts: PropTypes.bool.isRequired,
  enableSupportRequests: PropTypes.bool.isRequired,
  handleSelectInstitution: PropTypes.func.isRequired,
  institutions: PropTypes.array.isRequired,
  institutionSearch: PropTypes.func.isRequired,
  isMicrodepositsEnabled: PropTypes.bool.isRequired,
  onAddManualAccountClick: PropTypes.func.isRequired,
  onRequestInstitution: PropTypes.func.isRequired,
  onVerifyWithMicrodeposits: PropTypes.func.isRequired,
  setAriaLiveRegionMessage: PropTypes.func.isRequired,
}
