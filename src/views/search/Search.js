import React, {
  useState,
  useEffect,
  useReducer,
  useRef,
  useImperativeHandle,
  useContext,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { zip, of, defer } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import _unionBy from 'lodash/unionBy'
import _debounce from 'lodash/debounce'
import _find from 'lodash/find'
import { Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'
import { CloseOutline } from '@kyper/icon/CloseOutline'
import { Search as SearchIcon } from '@kyper/icon/Search'
import InputAdornment from '@mui/material/InputAdornment'
import { TextField } from 'src/privacy/input'
import { IconButton } from '@mui/material'

import { __ } from 'src/utilities/Intl'
import * as connectActions from 'src/redux/actions/Connect'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'
import { getMembers } from 'src/redux/selectors/Connect'

import { AnalyticEvents, PageviewInfo } from 'src/const/Analytics'
import { SEARCH_VIEWS, SEARCH_ACTIONS, INSTITUTION_TYPES } from 'src/views/search/consts'
import { VERIFY_MODE, TAX_MODE } from 'src/const/Connect'

import { PopularInstitutionsList } from 'src/views/search/views/PopularInstitutionsList'
import { SearchedInstitutionsList } from 'src/views/search/views/SearchedInstitutionsList'
import { SearchNoResult } from 'src/views/search/views/SearchNoResult'
import { SearchFailed } from 'src/views/search/views/SearchFailed'
import { Support, VIEWS as SUPPORT_VIEWS } from 'src/components/support/Support'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { focusElement } from 'src/utilities/Accessibility'
import { AriaLive } from 'src/components/AriaLive'
import { useApi } from 'src/context/ApiContext'
import { SEARCH_PAGE_DEFAULT, SEARCH_PER_PAGE_DEFAULT } from 'src/views/search/consts'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'
import { PostMessageContext } from 'src/ConnectWidget'
import styles from './search.module.css'
import { getInstitutionStatus, InstitutionStatus } from 'src/utilities/institutionStatus'
import { getExperimentalFeatures } from 'src/redux/reducers/experimentalFeaturesSlice'

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

export const Search = React.forwardRef((_, navigationRef) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH, {}, false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [ariaLiveRegionMessage, setAriaLiveRegionMessage] = useState('')
  const searchInput = useRef('')
  const supportNavRef = useRef(null)
  const sendAnalyticsEvent = useAnalyticsEvent()
  const postMessageFunctions = useContext(PostMessageContext)
  const { api } = useApi()
  const tokens = useTokens()
  const inlineStyles = getStyles(tokens, state.currentView)
  // Redux
  const reduxDispatch = useDispatch()
  const connectConfig = useSelector(selectConnectConfig)
  const connectedMembers = useSelector(getMembers)
  const usePopularOnly = useSelector((state) => {
    const clientProfile = state.profiles.clientProfile || {}
    const client = state.profiles.client || {}

    return (
      (clientProfile.uses_custom_popular_institution_list ?? false) ||
      (client.has_limited_institutions ?? false)
    )
  })
  const experimentalFeatures = useSelector(getExperimentalFeatures)
  const unavailableInstitutions = experimentalFeatures?.unavailableInstitutions || []

  const MINIMUM_SEARCH_LENGTH = 2
  const isFirstTimeUser = connectedMembers.length === 0

  useImperativeHandle(navigationRef, () => {
    return {
      handleBackButton() {
        if (state.showSupportView) {
          supportNavRef.current.handleCloseSupport()
        } else {
          reduxDispatch({ type: connectActions.ActionTypes.CONNECT_GO_BACK })
        }
      },
      showBackButton() {
        if (state.showSupportView) {
          return true
        }
        return false
      },
    }
  }, [state])

  useEffect(() => {
    const loadPopularInstitutions = () => {
      let params = {
        per_page: MAX_SUGGESTED_LIST_SIZE,
      }

      params = applyCountryCodeToSearchQuery(connectConfig, params)
      params = applyProductsToSearchQuery(connectConfig, params)

      // When in AGG_MODE or REWARD_MODE we dont need to pass anything specifc
      return api.loadPopularInstitutions(params)
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
        return api.loadDiscoveredInstitutions({ iso_country_code: connectConfig?.iso_country_code })
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

        // Remove any Unavailable institutions from the popular/discovered lists
        const filteredPopularInstitutions = updatedPopularInstitutions.filter(
          (popular) =>
            getInstitutionStatus(popular, unavailableInstitutions) !==
            InstitutionStatus.UNAVAILABLE,
        )
        const filteredDiscoveredInstitutions = updatedDiscoveredInstitutions.filter(
          (discovered) =>
            getInstitutionStatus(discovered, unavailableInstitutions) !==
            InstitutionStatus.UNAVAILABLE,
        )

        return dispatch({
          type: SEARCH_ACTIONS.LOAD_SUCCESS,
          payload: {
            updatedPopularInstitutions: filteredPopularInstitutions,
            updatedDiscoveredInstitutions: filteredDiscoveredInstitutions,
          },
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
    focusElement(document.getElementById('connect-search-header'))
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
    const query = buildUserSearchQuery(state.searchTerm, connectConfig, currentPage)

    return defer(() => api.loadInstitutions(query)).pipe(
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

      sendAnalyticsEvent(AnalyticEvents.SEARCH_QUERY, {
        mode: connectConfig.mode,
        search_term: value,
      })
      postMessageFunctions.onPostMessage('connect/institutionSearch', { query: value })

      dispatch({ type: SEARCH_ACTIONS.SEARCH_LOADING, payload: value })
    }
  }, 500)

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
    <div className={styles.container}>
      <div style={inlineStyles.searchBar}>
        <Text
          aria-label={__('Select your institution')}
          bold={true}
          component={'h2'}
          data-test="search-header"
          id="connect-search-header"
          style={inlineStyles.headerText}
          tabIndex={-1}
          truncate={false}
          variant="H2"
        >
          {__('Select your institution')}
        </Text>
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  color={
                    state.currentView === SEARCH_VIEWS.LOADING
                      ? tokens.TextColor.Disabled
                      : tokens.TextColor.Default
                  }
                />
              </InputAdornment>
            ),
            endAdornment: state.searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label={__('Reset Search')}
                  onClick={() => {
                    dispatch({ type: SEARCH_ACTIONS.RESET_SEARCH })
                    searchInput.current.value = '' // Thinking about changing this to a controlled component to manage the value
                    searchInput.current.focus()
                  }}
                  style={inlineStyles.resetButton}
                  variant="text"
                >
                  <CloseOutline />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          disabled={state.currentView === SEARCH_VIEWS.LOADING}
          fullWidth={true}
          // neustar looks for this id for automated tests
          // DO NOT change without first also changing neustar
          id="mx-connect-search"
          inputProps={{ 'aria-label': __('Enter institution name'), 'data-test': 'search-input' }}
          inputRef={searchInput}
          label="" // To fix our design of no label, this is a required prop
          name="Search"
          onChange={(e) => debounceSearch(e.currentTarget.value)}
          placeholder={state.currentView === SEARCH_VIEWS.LOADING ? __('Loading …') : __('Search')}
        />
      </div>
      {state.currentView === SEARCH_VIEWS.LOADING && (
        <div style={inlineStyles.spinner}>
          <LoadingSpinner />
        </div>
      )}
      {state.currentView === SEARCH_VIEWS.SEARCH_FAILED && <SearchFailed />}
      {state.currentView === SEARCH_VIEWS.NO_RESULTS && (
        <SearchNoResult
          onRequestInstitution={() => {
            dispatch({ type: SEARCH_ACTIONS.SHOW_SUPPORT })
          }}
          searchTerm={state.searchTerm}
          setAriaLiveRegionMessage={setAriaLiveRegionMessage}
        />
      )}
      {state.currentView === SEARCH_VIEWS.SEARCH_LOADING && (
        <div style={inlineStyles.spinner}>
          <LoadingSpinner />
        </div>
      )}
      {state.currentView === SEARCH_VIEWS.SEARCHED && (
        <SearchedInstitutionsList
          currentSearchResults={state.currentSearchResults}
          institutionSearch={institutionSearch}
          institutions={state.searchedInstitutions}
          onRequestInstitution={() => {
            dispatch({ type: SEARCH_ACTIONS.SHOW_SUPPORT })
          }}
          setAriaLiveRegionMessage={setAriaLiveRegionMessage}
        />
      )}
      {state.currentView === SEARCH_VIEWS.POPULAR && (
        <PopularInstitutionsList
          institutions={
            usePopularOnly
              ? state.popularInstitutions
              : getSuggestedInstitutions(
                  state.popularInstitutions,
                  state.discoveredInstitutions,
                  connectedMembers,
                )
          }
          onSearchInstitutionClick={() => searchInput.current.focus()}
        />
      )}
      <AriaLive level="assertive" message={ariaLiveRegionMessage} />
    </div>
  )
})

const getStyles = (tokens) => {
  return {
    searchBar: {
      marginBottom: `${tokens.Spacing.Small}px`,
    },
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    headerText: {
      display: 'block',
      marginBottom: tokens.Spacing.Medium,
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

Search.displayName = 'Search'

export const applyProductsToSearchQuery = (connectConfig, queryObject) => {
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

const applyCountryCodeToSearchQuery = (connectConfig, queryObject) => {
  if (connectConfig.iso_country_code) {
    queryObject.iso_country_code = connectConfig.iso_country_code
  }

  return queryObject
}

/**
 * Creates the search query depending on:
 *  - Search term(routing number vs search term)
 *  - Connect config(iso_country_code)
 *  - Page (pagination page number)
 */
export const buildUserSearchQuery = (searchTerm, connectConfig, page) => {
  const isFullRoutingNum = /^\d{9}$/.test(searchTerm) // 9 digits(0-9)
  const searchTermKey = isFullRoutingNum ? 'routing_number' : 'search_name'

  /**
   * Note: We are NOT applying a product filter to the user's search
   * The widget should be showing all INS that match the search term,
   * The UI will inform the user of problems with the INS if they are not compatible with the widget's configuration
   */
  let queryObject = { [searchTermKey]: searchTerm }
  queryObject = applyCountryCodeToSearchQuery(connectConfig, queryObject)
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
