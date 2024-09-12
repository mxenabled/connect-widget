/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { render, renderHook } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createReduxStore } from 'src/redux/Store'
import type { AppStore, RootState } from 'src/redux/Store'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { AnalyticContext } from 'src/Connect'
import { config, initialState } from 'src/services/mockedData'

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

/*
  ====================================
   React testing library utility file
  ====================================

  This file basically re-exports everthing from "React Testing Library".
  You can replace "@testing-library/react" with this file in all your imports
  If you want to include global redux store.
*/
export const AllTheProviders = ({
  children,
  store,
}: {
  children: React.ReactNode
  store: AppStore
}) => {
  return (
    <Provider store={store}>
      <WidgetDimensionObserver>
        <AnalyticContext.Provider
          value={{
            onAnalyticEvent: () => {},
            onAnalyticPageview: () => {},
            config: config,
          }}
        >
          {children}
        </AnalyticContext.Provider>
      </WidgetDimensionObserver>
    </Provider>
  )
}

const renderWithUser = (
  ui: ReactElement,
  {
    preloadedState = initialState,
    store = createReduxStore(preloadedState),
    ...options
  }: ExtendedRenderOptions = {},
) => {
  return {
    ...render(ui, { wrapper: (props) => <AllTheProviders store={store} {...props} />, ...options }),
    user: userEvent.setup(),
  }
}

const renderHookWithDefaults = (props: any, { store = createReduxStore(), ...options }) => {
  return renderHook(props, {
    wrapper: (wrapperProps) => <AllTheProviders store={store} {...wrapperProps} />,
    ...options,
  })
}

export * from '@testing-library/react'
export {
  createReduxStore as createTestReduxStore,
  renderWithUser as render,
  renderHookWithDefaults as renderHook,
}
