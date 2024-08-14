/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { render, renderHook, RenderOptions, RenderResult } from '@testing-library/react'
import userEvent, { UserEvent } from '@testing-library/user-event'

import { createReduxStore } from 'src/redux/Store'
import { FetchMasterDataProvider } from 'src/hooks/useFetchMasterData'
import { FetchUserFeaturesProvider } from 'src/hooks/useFetchUserFeatures'
import { InitializedClientConfigProvider } from 'src/hooks/useInitializedClientConfig'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { AGG_MODE } from 'src/const/Connect'
import { AnalyticContext } from 'src/widgets/desktop/Connect'

declare const global: {
  app: { config: any; clientConfig: any; userFeatures: any }
} & Window

global.app = {
  config: {
    client_guid: 'CLT-123',
    display_delete_option_in_connect: true,
    display_disclosure_in_connect: false,
    display_full_external_account_number: true,
    display_terms_and_conditions: false,
    enable_manual_accounts: true,
    enable_mark_account_closed_for_held_accounts: true,
    enable_mark_account_duplicate_for_held_accounts: true,
    enable_support_requests: true,
    widgets_display_name: null,
    show_mx_branding: true,
  },
  clientConfig: {
    connect: {
      is_mobile_webview: false,
      ui_message_protocol: 'post_message',
      ui_message_version: 4,
      ui_message_webview_url_scheme: 'mx',
      target_origin_referrer: null,
      mode: AGG_MODE,
      update_credentials: false,
      // include_identity: false,
    },
    connections: {
      hide_partner_managed_members: false,
    },
    color_scheme: 'light',
  },
  options: {
    type: 'test',
    session_token: '123',
  },
  userFeatures: {},
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
  store: Store
}) => {
  return (
    <Provider store={store}>
      <InitializedClientConfigProvider>
        <FetchMasterDataProvider>
          <FetchUserFeaturesProvider>
            <WidgetDimensionObserver>
              <AnalyticContext.Provider
                value={{
                  onAnalyticEvent: () => {},
                  onAnalyticPageview: () => {},
                  clientConfig: window.app.clientConfig,
                }}
              >
                {children}
              </AnalyticContext.Provider>
            </WidgetDimensionObserver>
          </FetchUserFeaturesProvider>
        </FetchMasterDataProvider>
      </InitializedClientConfigProvider>
    </Provider>
  )
}

const renderWithUser = (
  ui: ReactElement,
  {
    store = createReduxStore(),
    options,
  }: { store?: Store; options?: Omit<RenderOptions, 'wrapper'> } = {},
): RenderResult & { user: UserEvent } => {
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
