import React from 'react';
import ReactDOM from 'react-dom/client'; // Importação correta para React 18
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Cria o "root" para renderização
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra o service worker para suportar uso offline
serviceWorkerRegistration.register();