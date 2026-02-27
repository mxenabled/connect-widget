import React from 'react'
import { render, screen, waitFor, fireEvent } from 'src/utilities/testingLibrary'
import { FAVORITE_INSTITUTIONS, SEARCHED_INSTITUTIONS } from 'src/services/mockedData'
import {
  Search,
  buildUserSearchQuery,
  getSuggestedInstitutions,
  applyProductsToSearchQuery,
} from 'src/views/search/Search'
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
    it('renders only popular institutions if usePopular prop is "true"(does not include disabled institutions)', async () => {
      const ref = React.createRef()
      render(<Search {...defaultProps} ref={ref} />)

      await waitFor(() => {
        FAVORITE_INSTITUTIONS.forEach((institution) =>
          institution.is_disabled_by_client
            ? expect(screen.queryByText(institution.name)).not.toBeInTheDocument()
            : expect(screen.getByText(institution.name)).toBeInTheDocument(),
        )
      })
    })
    it('searches for institutions and renders the result', async () => {
      const ref = React.createRef()

      render(<Search {...defaultProps} ref={ref} />)

      //using fireEvent here because onChange of input is not fired, if userEvent.type is used
      fireEvent.change(await screen.findByPlaceholderText('Search'), {
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
      fireEvent.change(await screen.findByPlaceholderText('Search'), {
        target: { value: searchTerm },
      })

      await waitFor(() => {
        expect(screen.getByText(__('No results found for ”%1”', searchTerm))).toBeInTheDocument()
      })
    })
  })

  describe('buildUserSearchQuery function', () => {
    let searchTermResults
    let routingNumberResults

    it('builds query with search term when iso_country_code is not present', () => {
      searchTermResults = buildUserSearchQuery('searchTerm', {}, SEARCH_PAGE_DEFAULT)
      routingNumberResults = buildUserSearchQuery('123456780', {}, SEARCH_PAGE_DEFAULT)

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

    it('includes iso_country_code in query when present in config', () => {
      searchTermResults = buildUserSearchQuery(
        'searchTerm',
        { iso_country_code: 'US' },
        SEARCH_PAGE_DEFAULT,
      )
      routingNumberResults = buildUserSearchQuery(
        '123456780',
        { iso_country_code: 'CA' },
        SEARCH_PAGE_DEFAULT,
      )

      expect(searchTermResults).toEqual({
        search_name: 'searchTerm',
        iso_country_code: 'US',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
      expect(routingNumberResults).toEqual({
        routing_number: '123456780',
        iso_country_code: 'CA',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
    })

    it('ignores other config properties and only uses iso_country_code', () => {
      const connectConfig = {
        iso_country_code: 'US',
        mode: VERIFY_MODE,
        include_identity: true,
        data_request: {
          products: ['transactions', 'account_verification'],
        },
      }

      searchTermResults = buildUserSearchQuery('searchTerm', connectConfig, SEARCH_PAGE_DEFAULT)
      routingNumberResults = buildUserSearchQuery('123456780', connectConfig, SEARCH_PAGE_DEFAULT)

      expect(searchTermResults).toEqual({
        search_name: 'searchTerm',
        iso_country_code: 'US',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })

      expect(routingNumberResults).toEqual({
        routing_number: '123456780',
        iso_country_code: 'US',
        page: SEARCH_PAGE_DEFAULT,
        per_page: SEARCH_PER_PAGE_DEFAULT,
      })
    })

    it('distinguishes between routing numbers and search terms', () => {
      const validRoutingNumber = '123456780'
      const invalidRoutingNumber = '12345678' // 8 digits, not 9
      const searchTerm = 'Bank of America'

      const validRoutingResult = buildUserSearchQuery(validRoutingNumber, {}, SEARCH_PAGE_DEFAULT)
      const invalidRoutingResult = buildUserSearchQuery(
        invalidRoutingNumber,
        {},
        SEARCH_PAGE_DEFAULT,
      )
      const searchTermResult = buildUserSearchQuery(searchTerm, {}, SEARCH_PAGE_DEFAULT)

      expect(validRoutingResult).toHaveProperty('routing_number', validRoutingNumber)
      expect(validRoutingResult).not.toHaveProperty('search_name')

      expect(invalidRoutingResult).toHaveProperty('search_name', invalidRoutingNumber)
      expect(invalidRoutingResult).not.toHaveProperty('routing_number')

      expect(searchTermResult).toHaveProperty('search_name', searchTerm)
      expect(searchTermResult).not.toHaveProperty('routing_number')
    })
  })

  describe('applyProductsToSearchQuery function', () => {
    it('adds products array to query when products are present', () => {
      const connectConfig = {
        data_request: {
          products: ['transactions', 'account_verification'],
        },
        mode: VERIFY_MODE,
        include_identity: true,
      }
      const queryObject = {}

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({
        products: ['transactions', 'account_verification'],
      })
    })

    it('ignores mode and include_identity flags when products are present', () => {
      const connectConfig = {
        data_request: {
          products: ['transactions'],
        },
        mode: TAX_MODE,
        include_identity: true,
      }
      const queryObject = {}

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({
        products: ['transactions'],
      })
      expect(result).not.toHaveProperty('tax_statement_is_enabled')
      expect(result).not.toHaveProperty('account_identification_is_enabled')
    })

    it('adds account_verification_is_enabled when mode is VERIFY_MODE', () => {
      const connectConfig = {
        mode: VERIFY_MODE,
      }
      const queryObject = {}

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({
        account_verification_is_enabled: true,
      })
    })

    it('adds tax_statement_is_enabled when mode is TAX_MODE', () => {
      const connectConfig = {
        mode: TAX_MODE,
      }
      const queryObject = {}

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({
        tax_statement_is_enabled: true,
      })
    })

    it('adds account_identification_is_enabled when include_identity is true', () => {
      const connectConfig = {
        mode: AGG_MODE,
        include_identity: true,
      }
      const queryObject = {}

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({
        account_identification_is_enabled: true,
      })
    })

    it('combines mode and include_identity flags correctly', () => {
      const connectConfig = {
        mode: VERIFY_MODE,
        include_identity: true,
      }
      const queryObject = {}

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({
        account_verification_is_enabled: true,
        account_identification_is_enabled: true,
      })
    })

    it('does not add flags when mode is AGG_MODE and include_identity is false', () => {
      const connectConfig = {
        mode: AGG_MODE,
        include_identity: false,
      }
      const queryObject = {}

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({})
    })

    it('mutates the queryObject in place and preserves existing properties', () => {
      const connectConfig = {
        data_request: {
          products: ['transactions'],
        },
      }
      const queryObject = { existing_param: 'value', search_name: 'bank' }

      const result = applyProductsToSearchQuery(connectConfig, queryObject)

      expect(result).toEqual({
        existing_param: 'value',
        search_name: 'bank',
        products: ['transactions'],
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
