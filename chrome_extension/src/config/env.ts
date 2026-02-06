// Environment configuration for Chrome Extension

// Get environment variables from import.meta.env (Vite) or use defaults
export const ENV = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://ai-nots.test/',
    QUERY_GC_TIME: 1000 * 60 * 60 * 24, // 24 hours
    QUERY_STALE_TIME: 1000 * 60 * 5, // 5 minutes
} as const;

// Validate environment
if (!ENV.API_BASE_URL) {
    console.warn('VITE_API_BASE_URL is not set, using default:', ENV.API_BASE_URL);
}

