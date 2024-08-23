import { v4 as uuid } from 'uuid'
import _times from 'lodash/times'

export const genInstitution = (overrides: any) => ({
  guid: `INS-${uuid()}`,
  name: 'Checking',
  popularity: 3,
  url: 'www.example.com',
  ...overrides,
})

export const genInstitutions = (amount: number, globals: any, overrides: { [x: string]: any }) =>
  _times(amount, (index: string | number) => genInstitution({ ...globals, ...overrides[index] }))
