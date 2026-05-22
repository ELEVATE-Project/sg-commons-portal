import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './i18n'
import './index.css'
import { env } from './utils/env'

const rootPath = env.ROOT_PATH() ? `/${env.ROOT_PATH()}` : ''

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={rootPath}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)