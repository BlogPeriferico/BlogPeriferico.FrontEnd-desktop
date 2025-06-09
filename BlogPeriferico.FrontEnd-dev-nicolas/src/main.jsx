import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { RegionProvider } from './contexts/RegionContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RegionProvider>
        <App />
      </RegionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
