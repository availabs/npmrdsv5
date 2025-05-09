import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { authProvider } from "@availabs/ams"
import {
  FalcorProvider,
  falcorGraph
} from "./modules/avail-falcor"
import {
  ThemeContext
} from "./modules/avl-components/src"
import AVL_THEME from "./layout/avl-theme"
import App from './App.jsx'

const {
  API_HOST = 'https://graph.availabs.org',
  AUTH_HOST = 'https://graph.availabs.org',
  PROJECT_NAME = 'test',
  CLIENT_HOST = 'https://netlify.app'
} = {}

export const falcor = falcorGraph(API_HOST)
const AuthEnabledApp = authProvider(App, { AUTH_HOST, PROJECT_NAME, CLIENT_HOST });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FalcorProvider falcor={falcor}>
      <ThemeContext.Provider value={AVL_THEME}>
        <AuthEnabledApp />
      </ThemeContext.Provider>
    </FalcorProvider>
  </StrictMode>,
)
