import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import _pick from 'lodash/pick'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { Button } from '@mui/material'

import { selectCurrentMode } from 'src/redux/reducers/configSlice'
import { stepToAddManualAccount, stepToMicrodeposits } from 'src/redux/actions/connectActions'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { AnalyticEvents, PageviewInfo } from 'src/const/Analytics'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { AuthenticationMethods } from 'src/const/Analytics'
import useSelectInstitution from 'src/hooks/useSelectInstitution'
import { PostMessageContext } from 'src/ConnectWidget'

import { __, _n } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { SEARCH_PAGE_DEFAULT } from 'src/views/search/consts'
import { InstitutionTile } from 'src/components/InstitutionTile'

export const SearchedInstitutionsList = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCHED)
  const sendAnalyticsEvent = useAnalyticsEvent()
  const postMessage = useContext(PostMessageContext)
  const {
    currentSearchResults,
    institutions,
    institutionSearch,
    onRequestInstitution,
    setAriaLiveRegionMessage,
  } = props
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const [currentPage, setCurrentPage] = useState(SEARCH_PAGE_DEFAULT)
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false)
  // Redux
  const dispatch = useDispatch()
  const clientUsesOauth = useSelector((state) => state.profiles.clientProfile.uses_oauth ?? false)
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
  const { handleSelectInstitution } = useSelectInstitution()
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
                sendAnalyticsEvent(AnalyticEvents.SELECT_SEARCHED_INSTITUTION, {
                  authentication_method:
                    clientUsesOauth && institution.supports_oauth
                      ? AuthenticationMethods.OAUTH
                      : AuthenticationMethods.NON_OAUTH,
                  institution_guid: institution.guid,
                  institution_name: institution.name,
                })

                postMessage.onPostMessage(
                  'connect/selectedInstitution',
                  _pick(institution, ['name', 'guid', 'url', 'code']),
                )

                // The institution doesn't have credentials until we request it again from server
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
              onClick={() => dispatch(stepToAddManualAccount())}
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
              onClick={() => dispatch(stepToMicrodeposits())}
              variant="text"
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
  institutions: PropTypes.array.isRequired,
  institutionSearch: PropTypes.func.isRequired,
  onRequestInstitution: PropTypes.func.isRequired,
  setAriaLiveRegionMessage: PropTypes.func.isRequired,
}
