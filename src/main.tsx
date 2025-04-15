import './global.css' // Import foundational global styles
import './styles.css' // Import more specific global styles or overrides

import React from 'react'
import { createRoot } from 'react-dom/client'
import ConnectWidget from './ConnectWidget'
import { AGG_MODE } from 'src/const/Connect'

createRoot(document.getElementById('root') as HTMLElement).render(
  <ConnectWidget clientConfig={{ connect: { mode: AGG_MODE } }} />,
)
