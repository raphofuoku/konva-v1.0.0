import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Note: the CRA service-worker registration block that lived here has been
// removed. It pointed at `${process.env.PUBLIC_URL}/service-worker.js`,
// which doesn't resolve under Vite (no PUBLIC_URL env var), and unless you
// were using CRA's PWA template, that file likely never existed anyway —
// so this was silently failing before too. If you want real offline/PWA
// support later (it's a P2 item in the v2 PRD), add it properly via
// `vite-plugin-pwa` rather than resurrecting this.
