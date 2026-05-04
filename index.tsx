
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Suppress known Supabase unhandled promise rejections related to refresh tokens
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && (event.reason.message.includes('Refresh Token Not Found') || event.reason.message.includes('invalid refresh token'))) {
    console.warn('Supabase refresh token error suppressed:', event.reason.message);
    event.preventDefault(); // Prevent the error from showing up in the console as an unhandled rejection
    
    // Clear local storage to prevent infinite loops
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase.auth.token') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration failed: ', err);
    });
  });
}
