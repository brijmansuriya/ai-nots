// Environment configuration for Chrome Extension

// Get environment variables from import.meta.env (Vite) or use defaults
export const ENV = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://ai-nots.test/',
} as const;

// Validate environment
if (!ENV.API_BASE_URL) {
    console.warn('VITE_API_BASE_URL is not set, using default:', ENV.API_BASE_URL);
}

