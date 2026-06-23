import { AccountTypeNames, ReadableAccountTypes } from 'src/const/Accounts'

describe('Accounts Constants', () => {
  describe('ReadableAccountTypes', () => {
    it('should have UNKNOWN as 0', () => {
      expect(ReadableAccountTypes.UNKNOWN).toBe(0)
    })

    it('should have CHECKING as 1', () => {
      expect(ReadableAccountTypes.CHECKING).toBe(1)
    })

    it('should have SAVINGS as 2', () => {
      expect(ReadableAccountTypes.SAVINGS).toBe(2)
    })

    it('should have LOAN as 3', () => {
      expect(ReadableAccountTypes.LOAN).toBe(3)
    })

    it('should have CREDIT_CARD as 4', () => {
      expect(ReadableAccountTypes.CREDIT_CARD).toBe(4)
    })

    it('should have INVESTMENT as 5', () => {
      expect(ReadableAccountTypes.INVESTMENT).toBe(5)
    })

    it('should have LINE_OF_CREDIT as 6', () => {
      expect(ReadableAccountTypes.LINE_OF_CREDIT).toBe(6)
    })

    it('should have MORTGAGE as 7', () => {
      expect(ReadableAccountTypes.MORTGAGE).toBe(7)
    })

    it('should have PROPERTY as 8', () => {
      expect(ReadableAccountTypes.PROPERTY).toBe(8)
    })

    it('should have CASH as 9', () => {
      expect(ReadableAccountTypes.CASH).toBe(9)
    })

    it('should have INSURANCE as 10', () => {
      expect(ReadableAccountTypes.INSURANCE).toBe(10)
    })

    it('should have PREPAID as 11', () => {
      expect(ReadableAccountTypes.PREPAID).toBe(11)
    })

    it('should have CHECKING_LINE_OF_CREDIT as 12', () => {
      expect(ReadableAccountTypes.CHECKING_LINE_OF_CREDIT).toBe(12)
    })

    it('should have exactly 13 account types', () => {
      expect(Object.keys(ReadableAccountTypes)).toHaveLength(13)
    })

    it('should have all numeric values', () => {
      Object.values(ReadableAccountTypes).forEach((value) => {
        expect(typeof value).toBe('number')
      })
    })

    it('should have unique values', () => {
      const values = Object.values(ReadableAccountTypes)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('AccountTypeNames', () => {
    it('should have 13 account type names', () => {
      expect(AccountTypeNames).toHaveLength(13)
    })

    it('should have "Other" at index 0 for UNKNOWN', () => {
      expect(AccountTypeNames[ReadableAccountTypes.UNKNOWN]).toBe('Other')
    })

    it('should have "Checking" at index 1 for CHECKING', () => {
      expect(AccountTypeNames[ReadableAccountTypes.CHECKING]).toBe('Checking')
    })

    it('should have "Savings" at index 2 for SAVINGS', () => {
      expect(AccountTypeNames[ReadableAccountTypes.SAVINGS]).toBe('Savings')
    })

    it('should have "Loan" at index 3 for LOAN', () => {
      expect(AccountTypeNames[ReadableAccountTypes.LOAN]).toBe('Loan')
    })

    it('should have "Credit Card" at index 4 for CREDIT_CARD', () => {
      expect(AccountTypeNames[ReadableAccountTypes.CREDIT_CARD]).toBe('Credit Card')
    })

    it('should have "Investment" at index 5 for INVESTMENT', () => {
      expect(AccountTypeNames[ReadableAccountTypes.INVESTMENT]).toBe('Investment')
    })

    it('should have "Line of Credit" at index 6 for LINE_OF_CREDIT', () => {
      expect(AccountTypeNames[ReadableAccountTypes.LINE_OF_CREDIT]).toBe('Line of Credit')
    })

    it('should have "Mortgage" at index 7 for MORTGAGE', () => {
      expect(AccountTypeNames[ReadableAccountTypes.MORTGAGE]).toBe('Mortgage')
    })

    it('should have "Property" at index 8 for PROPERTY', () => {
      expect(AccountTypeNames[ReadableAccountTypes.PROPERTY]).toBe('Property')
    })

    it('should have "Cash" at index 9 for CASH', () => {
      expect(AccountTypeNames[ReadableAccountTypes.CASH]).toBe('Cash')
    })

    it('should have "Insurance" at index 10 for INSURANCE', () => {
      expect(AccountTypeNames[ReadableAccountTypes.INSURANCE]).toBe('Insurance')
    })

    it('should have "Prepaid" at index 11 for PREPAID', () => {
      expect(AccountTypeNames[ReadableAccountTypes.PREPAID]).toBe('Prepaid')
    })

    it('should have "Checking" at index 12 for CHECKING_LINE_OF_CREDIT', () => {
      expect(AccountTypeNames[ReadableAccountTypes.CHECKING_LINE_OF_CREDIT]).toBe('Checking')
    })

    it('should have all string values', () => {
      AccountTypeNames.forEach((name) => {
        expect(typeof name).toBe('string')
      })
    })
  })

  describe('Integration between ReadableAccountTypes and AccountTypeNames', () => {
    it('should map all ReadableAccountTypes to valid AccountTypeNames', () => {
      Object.entries(ReadableAccountTypes).forEach(([_key, value]) => {
        expect(AccountTypeNames[value]).toBeDefined()
        expect(typeof AccountTypeNames[value]).toBe('string')
      })
    })

    it('should have correct mapping for UNKNOWN type', () => {
      const name = AccountTypeNames[ReadableAccountTypes.UNKNOWN]
      expect(name).toBe('Other')
    })

    it('should have correct mapping for standard account types', () => {
      expect(AccountTypeNames[ReadableAccountTypes.CHECKING]).toBe('Checking')
      expect(AccountTypeNames[ReadableAccountTypes.SAVINGS]).toBe('Savings')
      expect(AccountTypeNames[ReadableAccountTypes.CREDIT_CARD]).toBe('Credit Card')
    })

    it('should handle CHECKING_LINE_OF_CREDIT as Checking', () => {
      const name = AccountTypeNames[ReadableAccountTypes.CHECKING_LINE_OF_CREDIT]
      expect(name).toBe('Checking')
    })
  })
})
