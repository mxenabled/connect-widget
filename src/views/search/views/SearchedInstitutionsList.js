import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { Button } from '@mui/material'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { AnalyticEvents, PageviewInfo } from 'src/const/Analytics'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { AuthenticationMethods } from 'src/const/Analytics'

import { __, _n } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { SEARCH_PAGE_DEFAULT } from 'src/views/search/consts'
import { InstitutionTile } from 'src/components/InstitutionTile'

export const SearchedInstitutionsList = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCHED)
  const sendPosthogEvent = useAnalyticsEvent()
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
  const clientUsesOauth = useSelector((state) => state.profiles.clientProfile.uses_oauth ?? false)
  const [currentPage, setCurrentPage] = useState(SEARCH_PAGE_DEFAULT)
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false)
  const shouldShowLoadMore = !!currentSearchResults.length && !isLoadingInstitutions

  useEffect(() => {
    setAriaLiveRegionMessage(
      _n('%1 search result', '%1 search results', institutions.length, institutions.length),
    )
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
        <Text style={styles.paragraph} truncate={false} variant="Paragraph">
          {_n('%1 search result', '%1 search results', institutions.length, institutions.length)}
        </Text>

        {institutions.map((institution) => {
          return (
            <InstitutionTile
              institution={institution}
              key={institution.guid}
              selectInstitution={() => {
                sendPosthogEvent(AnalyticEvents.SELECT_SEARCHED_INSTITUTION, {
                  authentication_method:
                    clientUsesOauth && institution.supports_oauth
                      ? AuthenticationMethods.OAUTH
                      : AuthenticationMethods.NON_OAUTH,
                  institution_guid: institution.guid,
                  institution_name: institution.name,
                })

                handleSelectInstitution(institution)
              }}
              size={48}
            />
          )
        })}
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
              variant={'text'}
            >
              {__('Load more institutions')}
            </Button>
          )}
          {enableManualAccounts && (
            <Button
              data-test="add-account-manually-button"
              onClick={onAddManualAccountClick}
              variant={'text'}
            >
              {__('Add account manually')}
            </Button>
          )}
          {enableSupportRequests && (
            <Button
              data-test="submit-institution-request-button"
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

const getStyles = (tokens) => {
  return {
    container: {
      background: tokens.BackgroundColor.Container,
      flexFlow: 'column',
      marginLeft: `-${tokens.Spacing.Small}px`,
      marginRight: `-${tokens.Spacing.Small}px`,
      overflow: 'auto',
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
