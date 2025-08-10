import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './styles/index.css';

// Get the root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Get Google Client ID from environment
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Debug logging - add this temporarily
console.log('🔍 Environment Debug:');
console.log('VITE_GOOGLE_CLIENT_ID:', googleClientId);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All VITE_ vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

if (!googleClientId) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID not found in environment variables');
  console.error('Available env vars:', Object.keys(import.meta.env));
}

// Create React root
const root = ReactDOM.createRoot(container);

// Render the application with Google OAuth Provider
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Performance monitoring for student experience
if (import.meta.env.DEV) {
  console.log('🚀 SSecoM Development Mode');
  console.log('🔐 Google OAuth Client ID configured:', !!googleClientId);
  console.log('🌐 API URL:', import.meta.env.VITE_API_URL);
}

// Updated Web Vitals reporting (compatible with web-vitals 4.x)
const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

// Report web vitals for performance optimization
reportWebVitals((metric) => {
  if (import.meta.env.DEV) {
    console.log('📊 Web Vital:', metric);
  }
});
