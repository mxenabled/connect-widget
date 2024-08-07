export const SEARCH_VIEWS = {
  LOADING: 'loading',
  POPULAR: 'popular',
  SEARCHED: 'searched',
  NO_RESULTS: 'no_results',
  SEARCHED_LOADING: 'searched_loading',
  SEARCH_FAILED: 'search_failed',
  OOPS: 'oops',
}

export const SEARCH_ACTIONS = {
  LOAD: 'institution_search/load',
  LOAD_SUCCESS: 'institution_search/load_success',
  LOAD_ERROR: 'institution_search/load_error',
  POPULAR: 'institution_search/popular',
  NO_RESULTS: 'institution_search/no_results',
  SEARCH_LOADING: 'institution_search/search_loading',
  SHOW_SEARCHED: 'institution_search/show_searched',
  SHOW_SUPPORT: 'institution_search/show_supported',
  HIDE_SUPPORT: 'institution_search/hide_supported',
  RESET_SEARCH: 'institution_search/reset_search',
  SEARCH_FAILED: 'institution_search/search_failed',
}

export const INSTITUTION_TYPES = {
  POPULAR: 'popular',
  DISCOVERED: 'discovered',
}

export const SEARCH_PER_PAGE_DEFAULT = 25
export const SEARCH_PAGE_DEFAULT = 1
