import { describe, expect, it } from 'vitest'
import { getSortedAccountsWithMembers } from '../Accounts'

describe('getSortedAccountsWithMembers', () => {
  it('returns empty array when no accounts match members', () => {
    const accounts = [{ guid: 'ACC-1', member_guid: 'MEM-999', user_name: 'Account 1' }]
    const members = [{ guid: 'MEM-1', name: 'Member 1' }]

    const result = getSortedAccountsWithMembers(accounts, members)

    expect(result).toEqual([])
  })

  it('filters accounts by member guid and adds member name', () => {
    const accounts = [
      { guid: 'ACC-1', member_guid: 'MEM-1', user_name: 'Checking' },
      { guid: 'ACC-2', member_guid: 'MEM-2', user_name: 'Savings' },
    ]
    const members = [
      { guid: 'MEM-1', name: 'Bank of America' },
      { guid: 'MEM-2', name: 'Chase' },
    ]

    const result = getSortedAccountsWithMembers(accounts, members)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      guid: 'ACC-1',
      member_guid: 'MEM-1',
      user_name: 'Checking',
      memberName: 'Bank of America',
    })
    expect(result[1]).toEqual({
      guid: 'ACC-2',
      member_guid: 'MEM-2',
      user_name: 'Savings',
      memberName: 'Chase',
    })
  })

  it('sorts accounts by user_name alphabetically', () => {
    const accounts = [
      { guid: 'ACC-1', member_guid: 'MEM-1', user_name: 'Savings' },
      { guid: 'ACC-2', member_guid: 'MEM-1', user_name: 'Checking' },
      { guid: 'ACC-3', member_guid: 'MEM-1', user_name: 'Investment' },
    ]
    const members = [{ guid: 'MEM-1', name: 'Bank' }]

    const result = getSortedAccountsWithMembers(accounts, members)

    expect(result[0].user_name).toBe('Checking')
    expect(result[1].user_name).toBe('Investment')
    expect(result[2].user_name).toBe('Savings')
  })

  it('filters out accounts without matching member', () => {
    const accounts = [
      { guid: 'ACC-1', member_guid: 'MEM-1', user_name: 'Account 1' },
      { guid: 'ACC-2', member_guid: 'MEM-999', user_name: 'Account 2' },
      { guid: 'ACC-3', member_guid: 'MEM-2', user_name: 'Account 3' },
    ]
    const members = [
      { guid: 'MEM-1', name: 'Member 1' },
      { guid: 'MEM-2', name: 'Member 2' },
    ]

    const result = getSortedAccountsWithMembers(accounts, members)

    expect(result).toHaveLength(2)
    expect(result.find((a) => a.guid === 'ACC-2')).toBeUndefined()
  })

  it('handles empty members array', () => {
    const accounts = [{ guid: 'ACC-1', member_guid: 'MEM-1', user_name: 'Account 1' }]
    const members = []

    const result = getSortedAccountsWithMembers(accounts, members)

    expect(result).toEqual([])
  })

  it('handles empty accounts array', () => {
    const accounts = []
    const members = [{ guid: 'MEM-1', name: 'Member 1' }]

    const result = getSortedAccountsWithMembers(accounts, members)

    expect(result).toEqual([])
  })

  it('handles member not found gracefully', () => {
    const accounts = [{ guid: 'ACC-1', member_guid: 'MEM-1', user_name: 'Account 1' }]
    const members = [{ guid: 'MEM-1' }] // No name property

    const result = getSortedAccountsWithMembers(accounts, members)

    expect(result).toHaveLength(1)
    expect(result[0].memberName).toBeUndefined()
  })
})
