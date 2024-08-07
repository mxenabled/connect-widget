import { createSelector } from "@reduxjs/toolkit";
import _find from "lodash/find";
import { STEPS } from "src/connect/const/Connect";
import { ReadableStatuses } from "src/connect/const/Statuses";

// Use selectors only when it is necessary and adds value
/**
 * Selector Helper Functions
 */
const getMemberByGuid = (members, guid) => {
  if (guid === "") return {};

  return _find(members, { guid }) || {};
};
/**
 * Selectors
 */
export const getCurrentMember = createSelector(
  (state) => state.connect.members,
  (state) => state.connect.currentMemberGuid,
  getMemberByGuid
);
export const getMembers = (state) =>
  state.connect.members?.filter(
    (member) => !(member.connection_status === ReadableStatuses.PENDING)
  ) ?? [];

export const selectConnectLocation = (state) =>
  state.connect.location[state.connect.location.length - 1];
export const selectConnectStep = createSelector(
  selectConnectLocation,
  (location) => location?.step ?? STEPS.SEARCH
);
