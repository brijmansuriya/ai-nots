import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeProviderState {
    theme: Theme;
}

const ThemeContext = createContext<ThemeProviderState>({ theme: 'light' });

export function ThemeProvider({
    children,
    rootElement,
}: {
    children: React.ReactNode;
    rootElement?: HTMLElement | null;
}) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const isChatGPT = window.location.hostname.includes('chatgpt.com') ||
            window.location.hostname.includes('openai.com');

        const detectTheme = () => {
            const html = document.documentElement;
            const body = document.body;

            // 1. Explicit Dark Detection
            const hasDarkClass = html.classList.contains('dark') || body.classList.contains('dark');
            const hasDarkAttr = html.getAttribute('data-theme') === 'dark' || body.getAttribute('data-theme') === 'dark';

            // 2. Explicit Light Detection
            const hasLightClass = html.classList.contains('light') || body.classList.contains('light');
            const hasLightAttr = html.getAttribute('data-theme') === 'light' || body.getAttribute('data-theme') === 'light';

            let detected: Theme = 'light';

            if (hasDarkClass || hasDarkAttr) {
                detected = 'dark';
            } else if (hasLightClass || hasLightAttr) {
                detected = 'light';
            } else {
                // 3. Fallback to system preference ONLY if site provides no hint
                detected = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            setTheme(detected);

            // Sync for Popup
            if (isChatGPT && chrome.runtime?.id) {
                chrome.storage.local.set({ chatgpt_theme: detected });
            }
        };

        // Initial check
        detectTheme();

        // Real-time Sync via MutationObserver
        const observer = new MutationObserver(() => detectTheme());
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style', 'data-theme']
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'style', 'data-theme']
        });

        // System preference sync (for non-ChatGPT pages)
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => !isChatGPT && detectTheme();
        mediaQuery.addEventListener('change', handleSystemChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handleSystemChange);
        };
    }, []);

    // Apply strict class management to prevent mixed styles
    useEffect(() => {
        const root = rootElement || window.document.documentElement;
        root.classList.add('ainots-theme-provider');

        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }, [theme, rootElement]);

    return (
        <ThemeContext.Provider value={{ theme }}>
            <div className={`ainots-theme-provider ${theme}`} style={{ display: 'contents' }}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
