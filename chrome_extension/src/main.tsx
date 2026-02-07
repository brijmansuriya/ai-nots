import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import { queryClient, chromeStoragePersister } from './lib/queryClient'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import App from './App.tsx'

// Global error handlers for comprehensive logging
window.addEventListener('error', (event) => {
  console.error('❌ [Global Error Handler] Uncaught error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [Global Error Handler] Unhandled promise rejection:', {
    reason: event.reason,
    error: event.reason instanceof Error ? {
      message: event.reason.message,
      stack: event.reason.stack,
    } : event.reason,
  });
});

// Log all console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.log = (...args) => {
  originalLog('🔵 [Console Log]', ...args);
};

console.error = (...args) => {
  originalError('❌ [Console Error]', ...args);
};

console.warn = (...args) => {
  originalWarn('⚠️ [Console Warn]', ...args);
};

console.info = (...args) => {
  originalInfo('ℹ️ [Console Info]', ...args);
};

console.log('🔵 [Main] Extension popup initialized');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: chromeStoragePersister }}
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
)

