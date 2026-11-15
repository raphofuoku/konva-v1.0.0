/**
 * main
 * Path: src/main.jsx
 *
 * Entry point: local fonts and the icon font, the design tokens and components CSS, the service
 * worker registration (production builds only), then the app.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import 'material-symbols/sharp.css';

import './styles/tokens.css';
import './styles/components.css';

import './pwa/registerSW';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);