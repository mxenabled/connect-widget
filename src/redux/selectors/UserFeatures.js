import { createSelector } from "@reduxjs/toolkit";

import { SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER } from "src/connect/const/UserFeatures";

import * as UserFeatures from "utils/UserFeatures";

export const getUserFeatures = (state) => state.userFeatures.items;

export const shouldShowConnectGlobalNavigationHeader = createSelector(
  getUserFeatures,
  (userFeatures) => {
    return UserFeatures.isFeatureEnabled(
      userFeatures,
      SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER
    );
  }
);
