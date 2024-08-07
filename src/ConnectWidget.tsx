import React from "react";
import { Provider } from "react-redux";
import Store from "reduxify/Store";
import Connect from "./Connect";

interface ConnectWidgetProps {
  clientConfig: any;
  onAnalyticEvent: (eventName: string, metadata: object) => void;
  onAnalyticPageview: () => void;
  profiles: any;
  userFeatures: object;
}
export function ConnectWidget(props: ConnectWidgetProps) {
  console.log("props:", props);
  return (
    <Provider store={Store}>
      <Connect {...(props as any)} />
    </Provider>
  );
}

export default ConnectWidget;
