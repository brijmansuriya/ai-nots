import React from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/components/header';
// import Footer from '@/components/footer';  // If you want to add a footer section
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';


export default function WebLayout({ children, title, ...props }: { children: React.ReactNode; title: string }) {
    return (
        <div className="min-h-screen" {...props}>
            {/* Meta Head Title */}
            <Head title={title} />

            {/* Header Section */}
            <Header />

            {/* Main Content */}
            <main className="py-6 sm:py-8 md:py-10 lg:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
                {children}
            </main>

            {/* Footer Section */}
            {/* <Footer /> Uncomment if you have a Footer component */}
        </div>
    );
}

