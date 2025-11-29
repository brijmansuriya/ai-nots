import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            // Check for 'theme' key first
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
                return savedTheme;
            }

            // Check for 'appearance' key (existing system)
            const savedAppearance = localStorage.getItem('appearance');
            if (savedAppearance === 'dark' || savedAppearance === 'light') {
                return savedAppearance as Theme;
            }

            // Check if dark class is already on document
            if (document.documentElement.classList.contains('dark')) {
                return 'dark';
            }

            // Check system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;

        // Apply theme class
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save to both localStorage keys for compatibility
        localStorage.setItem('theme', theme);
        localStorage.setItem('appearance', theme);
    }, [theme]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

