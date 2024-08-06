import { createSelector } from "@reduxjs/toolkit";
import { STEPS } from "src/connect/const/Connect";

export const selectConnectLocation = (state) =>
  state.connect.location[state.connect.location.length - 1];
export const selectConnectStep = (state) =>
  createSelector(
    selectConnectLocation,
    (location) => location?.step ?? STEPS.SEARCH
  );
