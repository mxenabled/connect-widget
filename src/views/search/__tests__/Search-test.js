import React from 'react'
import { render, screen, waitFor, fireEvent } from 'src/utilities/testingLibrary'
import { FAVORITE_INSTITUTIONS, SEARCHED_INSTITUTIONS } from 'src/services/mockedData'
import { Search, buildSearchQuery, getSuggestedInstitutions } from 'src/views/search/Search'
import { VERIFY_MODE, TAX_MODE, AGG_MODE } from 'src/const/Connect'
import { SEARCH_PER_PAGE_DEFAULT, SEARCH_PAGE_DEFAULT } from 'src/views/search/consts'
import { __ } from 'src/utilities/Intl'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue } from 'src/const/apiProviderMock'

describe('Search View', () => {
  describe('Search component', () => {
    const defaultProps = {
      connectConfig: {
        mode: AGG_MODE,
        data_request: {
          products: ['transactions'],
        },
      },
      connectedMembers: [],
      enableManualAccounts: true,
      enableSupportRequests: true,
      onAddManualAccountClick: vi.fn(),
      onInstitutionSelect: vi.fn(),
      usePopularOnly: true,
      isMicrodepositsEnabled: true,
      stepToMicrodeposits: vi.fn(),
    }
    it('renders only popular institutions if usePopular prop is "true"', async () => {
      const ref = React.createRef()
      render(<Search {...defaultProps} ref={ref} />)

      await waitFor(() => {
        FAVORITE_INSTITUTIONS.forEach((institution) => {
          expect(screen.getByText(institution.name)).toBeInTheDocument()
        })
      })
    })
    it('searches for institutions and renders the result', async () => {
      const ref = React.createRef()

      render(<Search {...defaultProps} ref={ref} />)

      //using fireEvent here because onChange of input is not fired, if userEvent.type is used
      fireEvent.change(screen.getByLabelText('Enter institution name'), {
        target: { value: 'test' },
      })

      await waitFor(() => {
        SEARCHED_INSTITUTIONS.forEach((institution) => {
          expect(screen.getByText(institution.name)).toBeInTheDocument()
        })
      })
    })

    it('returns "No results found" if a bogus search term is used', async () => {
      const ref = React.createRef()

      const searchTerm = 'wrong'
      const loadInstitutions = () => Promise.resolve([])

      render(
        <ApiProvider apiValue={{ ...apiValue, loadInstitutions }}>
          <Search {...defaultProps} ref={ref} />
        </ApiProvider>,
      )

      //using fireEvent here because onChange of input is not fired, if userEvent.type is used
      fireEvent.change(screen.getByLabelText('Enter institution name'), {
        target: { value: searchTerm },
      })

      await waitFor(() => {
        expect(screen.getByText(__('No results found for ”%1”', searchTerm))).toBeInTheDocument()
      })
    })
  })

  describe('buildSearchQuery function', () => {
    let searchTermResults
    let routingNumberResults

    it('in verify mode.', () => {
      searchTermResults = buildSearchQuery('searchTerm', { mode: VERIFY_MODE }, SEARCH_PAGE_DEFAULT)
      routingNumberResults = buildSearchQuery(
        '123456780',
        { mode: VERIFY_MODE },
        SEARCH_PAGE_DEFAULT,
      )

      expect(searchTermResults).toEqual({
        search_name: 'searchTerm',
        account_verification_is_enabled: true,
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
      expect(routingNumberResults).toEqual({
        routing_number: '123456780',
        account_verification_is_enabled: true,
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
    })

    it('in tax mode.', () => {
      searchTermResults = buildSearchQuery('searchTerm', { mode: TAX_MODE }, SEARCH_PAGE_DEFAULT)
      routingNumberResults = buildSearchQuery('123456780', { mode: TAX_MODE }, SEARCH_PAGE_DEFAULT)

      expect(searchTermResults).toEqual({
        search_name: 'searchTerm',
        tax_statement_is_enabled: true,
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
      expect(routingNumberResults).toEqual({
        routing_number: '123456780',
        tax_statement_is_enabled: true,
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
    })

    it('with include_identity', () => {
      const aggResults = buildSearchQuery(
        'searchTerm',
        { mode: AGG_MODE, include_identity: true },
        SEARCH_PAGE_DEFAULT,
      )
      const verifyResults = buildSearchQuery(
        'searchTerm',
        {
          mode: VERIFY_MODE,
          include_identity: true,
        },
        SEARCH_PAGE_DEFAULT,
      )
      const taxResults = buildSearchQuery(
        'searchTerm',
        { mode: TAX_MODE, include_identity: true },
        SEARCH_PAGE_DEFAULT,
      )
      const identityFalseResults = buildSearchQuery(
        'searchTerm',
        {
          mode: AGG_MODE,
          include_identity: false,
        },
        SEARCH_PAGE_DEFAULT,
      )

      expect(aggResults).toEqual({
        search_name: 'searchTerm',
        account_identification_is_enabled: true,
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
      expect(verifyResults).toEqual({
        search_name: 'searchTerm',
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
      expect(taxResults).toEqual({
        search_name: 'searchTerm',
        tax_statement_is_enabled: true,
        account_identification_is_enabled: true,
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
      expect(identityFalseResults).toEqual({
        search_name: 'searchTerm',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
    })

    it('in all other modes.', () => {
      searchTermResults = buildSearchQuery('searchTerm', { mode: AGG_MODE }, SEARCH_PAGE_DEFAULT)
      routingNumberResults = buildSearchQuery('123456780', { mode: AGG_MODE }, SEARCH_PAGE_DEFAULT)

      expect(searchTermResults).toEqual({
        search_name: 'searchTerm',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
      expect(routingNumberResults).toEqual({
        routing_number: '123456780',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
    })

    it('can use products and ignore configuration booleans for search', () => {
      const connectConfig = {
        data_request: {
          products: ['transactions', 'account_verification', 'identity_verification'],
        },
        include_identity: true, // This is expected to be ignored, and not added the url query
      }

      searchTermResults = buildSearchQuery('searchTerm', connectConfig, SEARCH_PAGE_DEFAULT)
      routingNumberResults = buildSearchQuery('123456780', connectConfig, SEARCH_PAGE_DEFAULT)

      expect(searchTermResults).toEqual({
        search_name: 'searchTerm',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
        products: connectConfig.data_request.products,
      })

      expect(routingNumberResults).toEqual({
        routing_number: '123456780',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
        products: connectConfig.data_request.products,
      })
    })
  })

  describe('getSuggestedInstitutions function', () => {
    const EXPECTED_MAX_SIZE = 25

    // Create a popular list that is more than we need for "popular institutions"
    // Assigns bogus guids and popularity
    const POPULAR_LIST_SIZE = 50
    let currentGuid = 1
    let popularity = 1
    const popular = []
    for (let i = 0; i < POPULAR_LIST_SIZE; i++) {
      const stringGuid = currentGuid.toString()
      currentGuid++
      popular.push({
        guid: stringGuid,
        popularity: popularity++,
      })
    }

    // Set up a discovered list where the first few are also part of the popular list
    // Another entry is unique to discovered with HIGH popularity
    const MAX_POPULARITY = 1000
    const discovered = popular.slice(0, 4)
    discovered.push({ guid: '1000', popularity: MAX_POPULARITY })

    it('Allows up to an EXPECTED_MAX_SIZE of institutions', () => {
      const result = getSuggestedInstitutions(popular, discovered, [], EXPECTED_MAX_SIZE)
      expect(result).toHaveLength(EXPECTED_MAX_SIZE)
    })

    it('Sorts the institution list based on popularity, and includes higher popularity discovered institutions first', () => {
      const result = getSuggestedInstitutions(popular, discovered, [], EXPECTED_MAX_SIZE)
      expect(result[0].popularity).toEqual(MAX_POPULARITY)
      expect(result[1].popularity).toEqual(POPULAR_LIST_SIZE)
    })

    it('Does not suggest institutions with a connected member', () => {
      const members = [{ guid: 'MBR-1', institution_guid: 50 }]

      const result = getSuggestedInstitutions(popular, discovered, members, EXPECTED_MAX_SIZE)
      const searchResult = result.find(
        (institution) => institution.guid === members[0].institution_guid,
      )
      expect(searchResult).toEqual(undefined)
    })

    it('Dedupes popular & discovered lists, only includes an institution once', () => {
      const institution1 = { guid: '1', popularity: 1 }
      const institution2 = { guid: '2', popularity: 2 }

      const popular = [institution1, institution2]
      const discovered = [institution1]

      const result = getSuggestedInstitutions(popular, discovered, [], EXPECTED_MAX_SIZE)
      expect(result).toHaveLength(2)
    })
  })
})
