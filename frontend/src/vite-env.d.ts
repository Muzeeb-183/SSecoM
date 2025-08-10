/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_IMAGEKIT_PUBLIC_KEY: string
  readonly VITE_IMAGEKIT_URL_ENDPOINT: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend global Window interface for any browser APIs
declare global {
  interface Window {
    // Add any window extensions you might need
    gtag?: (...args: any[]) => void;
  }
}

export {};
