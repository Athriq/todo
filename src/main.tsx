import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  </ErrorBoundary>
)
