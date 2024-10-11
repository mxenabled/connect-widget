import { createSelector } from '@reduxjs/toolkit'
import _find from 'lodash/find'

import { ReadableStatuses } from 'src/const/Statuses'

// Use selectors only when it is necessary and adds value
/**
 * Selector Helper Functions
 */
const getMemberByGuid = (members, guid) => {
  if (guid === '') return {}

  return _find(members, { guid }) || {}
}
/**
 * Selectors
 */
export const getCurrentMember = createSelector(
  (state) => state.connect.members,
  (state) => state.connect.currentMemberGuid,
  getMemberByGuid,
)
export const getMembers = createSelector(
  (state) => state.connect.members,
  (members) =>
    members?.filter((member) => !(member.connection_status === ReadableStatuses.PENDING)) ?? [],
)
