/* eslint-disable react/jsx-sort-props */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import { SplashPage } from './components/SplashPage'
import { ConnectPage } from './components/ConnectPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/connect" element={<ConnectPage />} />
      </Routes>
    </Router>
  )
}

export default App
