import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initAnalytics } from './services/analytics';
import { initErrorLogging } from './services/errorLogging';
import { registerServiceWorker } from './services/notifications';

// Initialize Services
initAnalytics();
initErrorLogging();
registerServiceWorker(); // Register Push Notification SW

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);