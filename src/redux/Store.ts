import { configureStore } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";

import connectAPI from "src/connect/services/api";

import { rootEpic } from "reduxify/epics";
import { initializedClientConfig } from "reduxify/reducers/Client";
import connect from "reduxify/reducers/Connect";
import { experiments } from "reduxify/reducers/Experiments";
import configSlice from "reduxify/reducers/configSlice";
import profilesSlice from "reduxify/reducers/profilesSlice";
import userFeaturesSlice from "reduxify/reducers/userFeaturesSlice";
import { app } from "reduxify/reducers/App";
import browser from "reduxify/reducers/Browser";
import componentStacks from "reduxify/reducers/ComponentStacks";
import analyticsSlice from "reduxify/reducers/analyticsSlice";

// 1. Create epic middleware
const epicMiddleWare = createEpicMiddleware({
  dependencies: { connectAPI },
});

// 2. Configure store with reducers and middleware
const store = configureStore({
  reducer: {
    analytics: analyticsSlice,
    app,
    browser,
    componentStacks,
    config: configSlice,
    connect,
    experiments,
    initializedClientConfig,
    profiles: profilesSlice,
    userFeatures: userFeaturesSlice,
  },
  // 3. Add epic middlware created above
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(epicMiddleWare),
});

// 4. Call run after configureStore
epicMiddleWare.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
