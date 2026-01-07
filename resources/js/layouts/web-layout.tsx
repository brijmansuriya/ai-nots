import React from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function WebLayout({ children, title, ...props }: { children: React.ReactNode; title: string }) {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background transition-colors" {...props}>
                {/* Meta Head Title */}
                <Head title={title} />

                {/* Header Section */}
                <Header />

                {/* Main Content */}
                <main className="bg-background">
                    {children}
                </main>

                {/* Footer Section */}
                <Footer />
            </div>
        </ThemeProvider>
    );
}

