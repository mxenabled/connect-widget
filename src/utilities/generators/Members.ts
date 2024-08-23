import { v4 as uuid } from 'uuid'

export const genMember = (overrides: any) => ({
  guid: `MBR-${uuid()}`,
  credentials: [],
  ...overrides,
})
