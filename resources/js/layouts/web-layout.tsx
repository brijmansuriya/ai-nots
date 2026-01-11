import React from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface WebLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    ogImage?: string;
    ogUrl?: string;
}

export default function WebLayout({ children, title, description, ogImage, ogUrl, ...props }: WebLayoutProps) {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background transition-colors" {...props}>
                {/* Meta Head */}
                <Head title={title}>
                    {description && <meta name="description" content={description} />}
                    {ogUrl && <meta property="og:url" content={ogUrl} />}
                    <meta property="og:title" content={title} />
                    {description && <meta property="og:description" content={description} />}
                    {ogImage && <meta property="og:image" content={ogImage} />}
                    <meta property="og:type" content="website" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={title} />
                    {description && <meta name="twitter:description" content={description} />}
                    {ogImage && <meta name="twitter:image" content={ogImage} />}
                </Head>

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

