import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Always boot at the hero: the browser would otherwise restore the previous
// scroll position on reload, dropping the user straight onto the heavy 3D
// workstation and forcing its model + HDR to cold-load all at once — the GPU
// spike that intermittently lost that canvas's WebGL context.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
