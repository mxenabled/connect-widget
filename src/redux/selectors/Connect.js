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

const getConnectSlice = createSelector(
  (state) => state,
  (state) => state.connect,
)

const getMembersRaw = createSelector(getConnectSlice, (slice) => slice.members)

export const getCurrentMember = createSelector(
  getMembersRaw,
  (state) => state.connect.currentMemberGuid,
  getMemberByGuid,
)

export const getMembers = createSelector(
  getMembersRaw,
  (members) =>
    members?.filter((member) => !(member.connection_status === ReadableStatuses.PENDING)) ?? [],
)

export const getSelectedInstitution = createSelector(
  getConnectSlice,
  (slice) => slice.selectedInstitution,
)
