import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { InertiaProgress } from '@inertiajs/progress'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#000000',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Function to get the theme color dynamically
const getThemeColor = () => {
  // Example: Replace with your logic to fetch the theme color
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#000000' : '#000000';
};

InertiaProgress.init({
  delay: 200,       // Milliseconds before showing progress bar
  color: getThemeColor(), // Dynamically set the theme color
  includeCSS: true, // Injects default NProgress styles
  showSpinner: false // Whether to show spinner (default false)
});
