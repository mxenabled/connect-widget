import React, { useState, useEffect, useReducer, useRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { zip, of, defer } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import _unionBy from 'lodash/unionBy'
import _debounce from 'lodash/debounce'
import _find from 'lodash/find'
import { Text } from '@kyper/text'
import { useTokens } from '@kyper/tokenprovider'
import { CloseOutline } from '@kyper/icon/CloseOutline'
import { Search as SearchIcon } from '@kyper/icon/Search'
import { Button } from '@kyper/button'
import { TextInput } from 'src/privacy/input'

import { __ } from 'src/connect/utilities/Intl'

import { AnalyticEvents, PageviewInfo } from 'src/connect/const/Analytics'
import { SEARCH_VIEWS, SEARCH_ACTIONS, INSTITUTION_TYPES } from 'src/connect/views/search/consts'
import { VERIFY_MODE, TAX_MODE } from 'src/connect/const/Connect'

import { PopularInstitutionsList } from 'src/connect/views/search/views/PopularInstitutionsList'
import { SearchedInstitutionsList } from 'src/connect/views/search/views/SearchedInstitutionsList'
import { SearchNoResult } from 'src/connect/views/search/views/SearchNoResult'
import { SearchFailed } from 'src/connect/views/search/views/SearchFailed'
import { Support, VIEWS as SUPPORT_VIEWS } from 'src/connect/components/support/Support'
import { LoadingSpinner } from 'src/connect/components/LoadingSpinner'
import useAnalyticsPath from 'src/connect/hooks/useAnalyticsPath'
import useAnalyticsEvent from 'src/connect/hooks/useAnalyticsEvent'
import { ActionTypes } from 'reduxify/actions/PostMessage'
import { focusElement } from 'src/connect/utilities/Accessibility'
import { AriaLive } from 'src/connect/components/AriaLive'
import connectAPI from 'src/connect/services/api'
import { SEARCH_PAGE_DEFAULT, SEARCH_PER_PAGE_DEFAULT } from 'src/connect/views/search/consts'
import { COMBO_JOB_DATA_TYPES } from 'src/connect/const/comboJobDataTypes'

export const initialState = {
  currentView: SEARCH_VIEWS.LOADING,
  popularInstitutions: [],
  discoveredInstitutions: [],
  showSupportView: false,
  searchedInstitutions: [],
  currentSearchResults: [],
  searchTerm: '',
  error: null, // Used to store the load or search failed related exceptions
}

const MAX_SUGGESTED_LIST_SIZE = 25

const reducer = (state, action) => {
  switch (action.type) {
    case SEARCH_ACTIONS.LOAD_SUCCESS:
      return {
        ...state,
        currentView: SEARCH_VIEWS.POPULAR,
        popularInstitutions: action.payload.updatedPopularInstitutions,
        discoveredInstitutions: action.payload.updatedDiscoveredInstitutions,
      }

    case SEARCH_ACTIONS.POPULAR:
      return {
        ...state,
        currentView: SEARCH_VIEWS.POPULAR,
        searchTerm: '',
      }

    case SEARCH_ACTIONS.RESET_SEARCH:
      return {
        ...state,
        currentView: SEARCH_VIEWS.POPULAR,
        searchTerm: '',
      }

    case SEARCH_ACTIONS.LOAD_ERROR:
      return {
        ...state,
        error: action.payload,
        currentView: SEARCH_VIEWS.OOPS,
      }

    case SEARCH_ACTIONS.SEARCH_FAILED:
      return {
        ...state,
        error: action.payload,
        currentView: SEARCH_VIEWS.SEARCH_FAILED,
      }

    case SEARCH_ACTIONS.SEARCH_LOADING:
      return {
        ...state,
        currentSearchResults: initialState.currentSearchResults,
        searchedInstitutions: initialState.searchedInstitutions,
        currentView: SEARCH_VIEWS.SEARCH_LOADING,
        searchTerm: action.payload,
      }

    case SEARCH_ACTIONS.NO_RESULTS:
      return {
        ...state,
        currentView: SEARCH_VIEWS.NO_RESULTS,
      }

    case SEARCH_ACTIONS.SHOW_SEARCHED:
      return {
        ...state,
        currentView: SEARCH_VIEWS.SEARCHED,
        searchedInstitutions: [...state.searchedInstitutions, ...action.payload],
        currentSearchResults: action.payload,
      }

    case SEARCH_ACTIONS.SHOW_SUPPORT:
      return { ...state, showSupportView: true }

    case SEARCH_ACTIONS.HIDE_SUPPORT:
      return { ...state, showSupportView: false }

    default:
      return state
  }
}

export const Search = React.forwardRef((props, navigationRef) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH, {}, false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [ariaLiveRegionMessage, setAriaLiveRegionMessage] = useState('')
  const searchInput = useRef('')
  const searchForInstitution = useRef(null)
  const supportNavRef = useRef(null)
  const showDisclosureStep = useSelector(
    (state) => state.profiles.widgetProfile.display_disclosure_in_connect,
  )
  const reduxDispatch = useDispatch()
  const sendPosthogEvent = useAnalyticsEvent()

  const {
    connectConfig,
    connectedMembers,
    enableManualAccounts,
    enableSupportRequests,
    onAddManualAccountClick,
    onInstitutionSelect,
    usePopularOnly,
    isMicrodepositsEnabled,
    stepToMicrodeposits,
  } = props

  const MINIMUM_SEARCH_LENGTH = 2
  const mode = connectConfig.mode
  const isFirstTimeUser = connectedMembers.length === 0

  useImperativeHandle(navigationRef, () => {
    return {
      handleBackButton() {
        if (state.showSupportView) {
          supportNavRef.current.handleCloseSupport()
        }
      },
      showBackButton() {
        if (state.showSupportView) {
          return true
        }
        return showDisclosureStep
      },
    }
  }, [showDisclosureStep, state])

  useEffect(() => {
    const loadPopularInstitutions = () => {
      let params = {
        per_page: MAX_SUGGESTED_LIST_SIZE,
      }

      params = applyConnectConfigToSearchQuery(connectConfig, params)

      // When in AGG_MODE or REWARD_MODE we dont need to pass anything specifc
      return connectAPI.loadPopularInstitutions(params)
    }

    const loadDiscoveredInstitutions = () => {
      // Only load transaction-discovered institutions when:
      // - transactions are the only requested data type
      // - other configurations allow it.
      if (
        !usePopularOnly &&
        !isFirstTimeUser &&
        Array.isArray(connectConfig?.data_request?.products) &&
        connectConfig.data_request.products.length === 1 &&
        connectConfig.data_request.products.includes(COMBO_JOB_DATA_TYPES.TRANSACTIONS)
      ) {
        return connectAPI.loadDiscoveredInstitutions()
      }

      // For all other modes and configs, return empty array
      return of([])
    }

    const loadInstitutionSearch = zip(
      loadPopularInstitutions(),
      loadDiscoveredInstitutions(),
    ).subscribe(
      ([popularInstitutions, discoveredInstitutions]) => {
        // Since there is no distinction of a 'popular' or 'discovered' on an institution
        // We need to add a type to key off of for our analytic events when selecting an institution
        const updatedPopularInstitutions = popularInstitutions.map((popular) => {
          return {
            ...popular,
            analyticType: INSTITUTION_TYPES.POPULAR,
          }
        })

        const updatedDiscoveredInstitutions = discoveredInstitutions.map((discovered) => {
          return {
            ...discovered,
            analyticType: INSTITUTION_TYPES.DISCOVERED,
          }
        })

        return dispatch({
          type: SEARCH_ACTIONS.LOAD_SUCCESS,
          payload: { updatedPopularInstitutions, updatedDiscoveredInstitutions },
        })
      },
      (error) => {
        return dispatch({
          type: SEARCH_ACTIONS.LOAD_ERROR,
          payload: error,
        })
      },
    )

    return () => {
      loadInstitutionSearch.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (state.searchTerm.length < MINIMUM_SEARCH_LENGTH) return () => {}

    const institutionSearch$ = institutionSearch(SEARCH_PAGE_DEFAULT).subscribe(() => {})

    return () => {
      institutionSearch$.unsubscribe()
    }
  }, [state.searchTerm])

  useEffect(() => {
    focusElement(searchForInstitution.current)
  }, [])

  useEffect(() => {
    // Input is not a controlled input. When closing the support view the inputs value
    // wasn't retained but the search results were. This repopulates the inputs values
    if (state.showSupportView === false && state.searchTerm !== initialState.searchTerm) {
      searchInput.current.value = state.searchTerm
    }
  }, [state.showSupportView])

  /**
   * It searches institutions on a given pagination page number and
   * It dispaches an appropriate action afterwards.
   * @param currentPage Current pagination page number
   *
   */
  const institutionSearch = (currentPage) => {
    const query = buildSearchQuery(state.searchTerm, connectConfig, currentPage)

    return defer(() => connectAPI.loadInstitutions(query)).pipe(
      map((currentSearchResults) => {
        if (!currentSearchResults.length && currentPage === SEARCH_PAGE_DEFAULT) {
          dispatch({ type: SEARCH_ACTIONS.NO_RESULTS })
        } else {
          dispatch({
            type: SEARCH_ACTIONS.SHOW_SEARCHED,
            payload: currentSearchResults,
          })
        }
      }),
      catchError((error) =>
        dispatch({
          type: SEARCH_ACTIONS.SEARCH_FAILED,
          payload: error,
        }),
      ),
    )
  }

  const debounceSearch = _debounce((value) => {
    if (value === '') {
      dispatch({ type: SEARCH_ACTIONS.POPULAR })
    } else if (value.length >= MINIMUM_SEARCH_LENGTH) {
      // If the searchTerm hasnt changed yet due to the debounce not having run
      // But the value is the same as the previous searchTerm, just
      // continue to show the previous search results
      if (value === state.searchTerm) {
        return
      }

      sendPosthogEvent(AnalyticEvents.SEARCH_QUERY, {
        mode,
        search_term: value,
      })

      reduxDispatch({
        type: ActionTypes.SEND_POST_MESSAGE,
        payload: { event: 'connect/institutionSearch', data: { query: value } },
      })

      dispatch({ type: SEARCH_ACTIONS.SEARCH_LOADING, payload: value })
    }
  }, 500)

  const tokens = useTokens()
  const styles = getStyles(tokens, state.currentView)

  // This allows us to bubble up the exception in the case of an endpoint failing
  // Which will show the GlobalErrorBoundary screen, while retaining the error
  if (state.currentView === SEARCH_VIEWS.OOPS) {
    throw state.error
  }

  if (state.showSupportView) {
    return (
      <Support
        loadToView={SUPPORT_VIEWS.REQ_INSTITUTION}
        onClose={() => dispatch({ type: SEARCH_ACTIONS.HIDE_SUPPORT })}
        ref={supportNavRef}
      />
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.searchBar}>
        <Text
          aria-label={__('Select your institution')}
          as="H2"
          data-test="search-header"
          ref={searchForInstitution}
          style={styles.headerText}
          tabIndex={-1}
          tag={'h2'}
        >
          {__('Select your institution')}
        </Text>
        <TextInput
          allowCapture={true}
          aria-label={__('Enter institution name')}
          autoComplete="off"
          autoFocus={false}
          data-test="search-input"
          disabled={state.currentView === SEARCH_VIEWS.LOADING}
          iconLeft={<SearchIcon color={tokens.TextColor.Default} />}
          iconRight={
            state.searchTerm ? (
              <Button
                aria-label={__('Reset Search')}
                onClick={() => {
                  dispatch({ type: SEARCH_ACTIONS.RESET_SEARCH })

                  searchInput.current.value = '' // Thinking about changing this to a controlled component to manage the value
                  searchInput.current.focus()
                }}
                style={styles.resetButton}
                variant="transparent"
              >
                <CloseOutline />
              </Button>
            ) : null
          }
          // neustar looks for this id for automated tests
          // DO NOT change without first also changing neustar
          id="mx-connect-search"
          label="" // To fix our design of no label, this is a required prop
          name="Search"
          onChange={(e) => debounceSearch(e.currentTarget.value)}
          placeholder={state.currentView === SEARCH_VIEWS.LOADING ? __('Loading …') : __('Search')}
          ref={searchInput}
        />
      </div>
      {state.currentView === SEARCH_VIEWS.LOADING && (
        <div style={styles.spinner}>
          <LoadingSpinner />
        </div>
      )}
      {state.currentView === SEARCH_VIEWS.SEARCH_FAILED && <SearchFailed />}
      {state.currentView === SEARCH_VIEWS.NO_RESULTS && (
        <SearchNoResult
          enableManualAccounts={enableManualAccounts}
          enableSupportRequests={enableSupportRequests}
          isMicrodepositsEnabled={isMicrodepositsEnabled}
          onAddManualAccountClick={onAddManualAccountClick}
          onRequestInstitution={() => {
            dispatch({ type: SEARCH_ACTIONS.SHOW_SUPPORT })
          }}
          onVerifyWithMicrodeposits={stepToMicrodeposits}
          searchTerm={state.searchTerm}
          setAriaLiveRegionMessage={setAriaLiveRegionMessage}
        />
      )}
      {state.currentView === SEARCH_VIEWS.SEARCH_LOADING && (
        <div style={styles.spinner}>
          <LoadingSpinner />
        </div>
      )}
      {state.currentView === SEARCH_VIEWS.SEARCHED && (
        <SearchedInstitutionsList
          currentSearchResults={state.currentSearchResults}
          enableManualAccounts={enableManualAccounts}
          enableSupportRequests={enableSupportRequests}
          handleSelectInstitution={onInstitutionSelect}
          institutionSearch={institutionSearch}
          institutions={state.searchedInstitutions}
          isMicrodepositsEnabled={isMicrodepositsEnabled}
          onAddManualAccountClick={onAddManualAccountClick}
          onRequestInstitution={() => {
            dispatch({ type: SEARCH_ACTIONS.SHOW_SUPPORT })
          }}
          onVerifyWithMicrodeposits={stepToMicrodeposits}
          setAriaLiveRegionMessage={setAriaLiveRegionMessage}
        />
      )}
      {state.currentView === SEARCH_VIEWS.POPULAR && (
        <PopularInstitutionsList
          enableManualAccounts={enableManualAccounts}
          handleSelectInstitution={onInstitutionSelect}
          institutions={
            usePopularOnly
              ? state.popularInstitutions
              : getSuggestedInstitutions(
                  state.popularInstitutions,
                  state.discoveredInstitutions,
                  connectedMembers,
                )
          }
          onAddManualAccountClick={onAddManualAccountClick}
          onSearchInstitutionClick={() => searchInput.current.focus()}
        />
      )}
      <AriaLive level="assertive" message={ariaLiveRegionMessage} />
    </div>
  )
})

const getStyles = (tokens, currentView) => {
  return {
    searchBar: {
      margin: `${tokens.Spacing.Large}px ${tokens.Spacing.Large}px ${tokens.Spacing.Small}px ${tokens.Spacing.Large}px`,
      width: '100%',
      maxWidth: '352px',
      minWidth: '270px',
    },
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: currentView === SEARCH_VIEWS.POPULAR ? 'center' : '',
    },
    headerText: {
      display: 'block',
      fontWeight: tokens.FontWeight.Bold,
      marginBottom: tokens.Spacing.Medium,
    },
    resetButton: {
      height: 'auto',
      padding: tokens.Spacing.Tiny,
    },
    tooManyResults: {
      marginTop: tokens.Spacing.Large,
      color: tokens.TextColor.Default,
      fontSize: tokens.FontSize.Paragraph,
      fontWeight: tokens.FontWeight.Regular,
    },
    spinner: {
      marginTop: '24px',
    },
  }
}

Search.propTypes = {
  connectConfig: PropTypes.object.isRequired,
  connectedMembers: PropTypes.array.isRequired,
  enableManualAccounts: PropTypes.bool,
  enableSupportRequests: PropTypes.bool,
  isMicrodepositsEnabled: PropTypes.bool,
  onAddManualAccountClick: PropTypes.func.isRequired,
  onInstitutionSelect: PropTypes.func.isRequired,
  stepToMicrodeposits: PropTypes.func.isRequired,
  usePopularOnly: PropTypes.bool,
}

Search.displayName = 'Search'

const applyConnectConfigToSearchQuery = (connectConfig, queryObject) => {
  if (Array.isArray(connectConfig?.data_request?.products)) {
    // Simplify Connectivity - use products instead of booleans and mode
    queryObject.products = connectConfig.data_request.products
  } else {
    const mode = connectConfig.mode
    const IS_IN_VERIFY_MODE = mode === VERIFY_MODE
    const IS_IN_TAX_MODE = mode === TAX_MODE

    if (IS_IN_TAX_MODE) {
      queryObject.tax_statement_is_enabled = true
    }

    if (IS_IN_VERIFY_MODE) {
      queryObject.account_verification_is_enabled = true
    }

    if (connectConfig?.include_identity === true) {
      queryObject.account_identification_is_enabled = true
    }
  }

  return queryObject
}

/**
 * Creates the search query depending on:
 *  - Search term(routing number vs search term)
 *  - Connect config(include_identity, mode)
 *  - Page (pagination page number)
 */
export const buildSearchQuery = (searchTerm, connectConfig, page) => {
  const isFullRoutingNum = /^\d{9}$/.test(searchTerm) // 9 digits(0-9)
  const searchTermKey = isFullRoutingNum ? 'routing_number' : 'search_name'

  let queryObject = { [searchTermKey]: searchTerm }
  queryObject = applyConnectConfigToSearchQuery(connectConfig, queryObject)
  queryObject.page = page
  queryObject.per_page = SEARCH_PER_PAGE_DEFAULT

  return queryObject
}

/**
 *
 * @param {Array<{guid: string, popularity: number}} popularInstitutions
 * @param {Array<{guid: string, popularity: number}>} discoveredInstitutions
 * @param {Array<{institution_guid: string}} connectedMembers
 * @returns {Array<Object>}
 */
export const getSuggestedInstitutions = (
  popularInstitutions,
  discoveredInstitutions,
  connectedMembers,
  limit = MAX_SUGGESTED_LIST_SIZE,
) => {
  // Combine and dedupe both our institution lists
  const dedupedList = _unionBy(popularInstitutions, discoveredInstitutions, 'guid')

  // Remove connected institutions from the list
  const filteredConnectedList = dedupedList.filter(
    (popular) => !_find(connectedMembers, ['institution_guid', popular.guid]),
  )

  // Sort list by popularity (highest to lowest)
  const sortedList = filteredConnectedList.sort((a, b) => b.popularity - a.popularity)

  return sortedList.slice(0, limit)
}
