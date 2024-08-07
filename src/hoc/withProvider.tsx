import React from "react";
import { Provider } from "react-redux";
import Store from "reduxify/Store";

export const withProvider = <P extends object>(
  Component: React.ComponentType<P>
) =>
  class WithProvider extends React.Component<P> {
    render() {
      return (
        <Provider store={Store}>
          <Component {...(this.props as P)} />
        </Provider>
      );
    }
  };
