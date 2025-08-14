import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { ConnectWidget, ApiProvider } from '@mxenabled/connect-widget'
import { ConnectAPIService } from './connect-api-service/connect-api-service.js'
import { MockDataSource } from './connect-api-service/data-source.js'
import { classToObject } from '../utils/class-to-object.js'

const widgetOptions = {
  clientConfig: {
    mode: 'aggregation',
  },
  language: {
    locale: 'en',
  },
  profiles: {
    clientProfile: {
      show_external_link_popup: false,
    },
    widgetProfile: {
      enable_support_requests: false,
    },
  },
}
const apiService = classToObject(new ConnectAPIService(new MockDataSource()))

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + ConnectWidget</h1>
      <div className="card">
        {/* <button onClick={() => setCount((count) => count + 1)}>count is {count}</button> */}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="connect-widget-demo">
        <h2>ConnectWidget Demo</h2>
        <ApiProvider apiValue={apiService}>
          <ConnectWidget {...widgetOptions} />
        </ApiProvider>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
