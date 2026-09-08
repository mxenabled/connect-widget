import { describe, expect, it } from 'vitest'

import { buildFormSchema, buildInitialValues, shouldShowAlert } from 'src/views/credentials/utils'
import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'
import { ReadableStatuses } from 'src/const/Statuses'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'

const loginFields = [
  { field_name: 'username', field_type: 3, label: 'Username' },
  { field_name: 'password', field_type: 1, label: 'Password' },
]

describe('buildInitialValues', () => {
  it('builds an object keyed by field_name with empty string values', () => {
    expect(buildInitialValues(loginFields)).toEqual({
      username: '',
      password: '',
    })
  })

  it('returns an empty object when given an empty array', () => {
    expect(buildInitialValues([])).toEqual({})
  })

  it('handles a single login field', () => {
    expect(buildInitialValues([{ field_name: 'pin', field_type: 1, label: 'PIN' }])).toEqual({
      pin: '',
    })
  })

  it('overwrites duplicate field_names, keeping the empty string value', () => {
    const duplicateFields = [
      { field_name: 'username', field_type: 3, label: 'Username' },
      { field_name: 'username', field_type: 3, label: 'User Name' },
    ]

    expect(buildInitialValues(duplicateFields)).toEqual({ username: '' })
  })
})

describe('buildFormSchema', () => {
  it('builds a schema keyed by field_name with label and required', () => {
    expect(buildFormSchema(loginFields)).toEqual({
      username: { label: 'Username', required: true },
      password: { label: 'Password', required: true },
    })
  })

  it('returns an empty object when given an empty array', () => {
    expect(buildFormSchema([])).toEqual({})
  })

  it('marks every field as required', () => {
    const schema = buildFormSchema(loginFields)

    Object.values(schema).forEach((field) => {
      expect(field.required).toBe(true)
    })
  })

  it('uses the field label for the schema label', () => {
    const schema = buildFormSchema([{ field_name: 'pin', field_type: 1, label: 'Secret PIN' }])

    expect(schema.pin.label).toBe('Secret PIN')
  })
})

describe('shouldShowAlert', () => {
  it('returns true when there is no API error and the member connection is DENIED', () => {
    const currentMember = { connection_status: ReadableStatuses.DENIED }

    expect(shouldShowAlert({}, currentMember)).toBe(true)
  })

  it('returns false when the member is DENIED but there is an API error present', () => {
    const currentMember = { connection_status: ReadableStatuses.DENIED }

    expect(shouldShowAlert({ message: 'Something went wrong' }, currentMember)).toBe(false)
  })

  it('returns false when there is no error and the member is not DENIED', () => {
    const currentMember = { connection_status: ReadableStatuses.CONNECTED }

    expect(shouldShowAlert({}, currentMember)).toBe(false)
  })

  it('returns true when the member error_code is a handleable actionable error', () => {
    const currentMember = {
      connection_status: ReadableStatuses.CONNECTED,
      error: { error_code: ACTIONABLE_ERROR_CODES.INVALID_CREDENTIALS },
    }

    expect(shouldShowAlert({}, currentMember)).toBe(true)
  })

  it('returns true for an actionable error even when an API error is present', () => {
    const currentMember = {
      connection_status: ReadableStatuses.CONNECTED,
      error: { error_code: ACTIONABLE_ERROR_CODES.INVALID_CREDENTIALS },
    }

    expect(shouldShowAlert({ message: 'boom' }, currentMember)).toBe(true)
  })

  it('returns false when the member has no error_code and is not DENIED', () => {
    const currentMember = { connection_status: ReadableStatuses.CONNECTED, error: {} }

    expect(shouldShowAlert({}, currentMember)).toBe(false)
  })

  it('respects the mode when determining if an error is credential related', () => {
    const currentMember = {
      connection_status: ReadableStatuses.CONNECTED,
      error: { error_code: ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS },
    }

    // NO_ELIGIBLE_ACCOUNTS is only actionable in VERIFY_MODE
    expect(shouldShowAlert({}, currentMember, AGG_MODE)).toBe(false)
    expect(shouldShowAlert({}, currentMember, VERIFY_MODE)).toBe(true)
  })

  it('defaults to AGG_MODE when no mode is provided', () => {
    const currentMember = {
      connection_status: ReadableStatuses.CONNECTED,
      error: { error_code: ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS },
    }

    // Falls back to AGG_MODE, where NO_ELIGIBLE_ACCOUNTS is not actionable
    expect(shouldShowAlert({}, currentMember)).toBe(false)
  })
})
