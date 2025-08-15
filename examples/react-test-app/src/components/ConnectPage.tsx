import { Link } from 'react-router-dom'
import { ConnectWidget, ApiProvider } from '@mxenabled/connect-widget'

import { ConnectAPIService } from '../connect-api-service/connect-api-service.js'
import { MockDataSource } from '../connect-api-service/data-source.js'
import { classToObject } from '../../utils/class-to-object.js'

declare global {
  interface Window {
    bootstrap?: typeof defaultWidgetOptions
  }
}

const defaultWidgetOptions = {
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

export function ConnectPage() {
  const connectOptions = window?.bootstrap || defaultWidgetOptions

  return (
    <div className="connect-page">
      <div className="connect-header">
        <Link to="/">
          <button className="back-button">← Back to Home</button>
        </Link>
        <h1>ConnectWidget Demo</h1>
      </div>
      <div className="connect-widget-container">
        <ApiProvider apiValue={apiService}>
          <ConnectWidget {...connectOptions} />
        </ApiProvider>
      </div>
    </div>
  )
}
