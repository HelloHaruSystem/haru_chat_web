import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import setViewportHeight from './utils/viewportHelper.js'

// sets up the event listeners to handle viewport height on mobile devices
setViewportHeight();

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
