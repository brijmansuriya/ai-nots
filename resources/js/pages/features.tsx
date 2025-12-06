import React from 'react';
import { Link } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import {
    FileText,
    FolderOpen,
    Tag,
    Download,
    Upload,
    Search,
    Heart,
    BarChart3,
    User,
    FileJson,
    FileSpreadsheet,
    FileCode,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Shield,
    Copy,
    Star,
    Database
} from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: FileText,
            title: 'Prompt Management',
            description: 'Create, edit, and organize your AI prompts with ease',
            details: [
                'Create prompts with rich text editor',
                'Edit and update existing prompts',
                'Delete or archive prompts',
                'Version history tracking',
                'Quick copy to clipboard',
                'Share prompts publicly or keep private'
            ]
        },
        {
            icon: FolderOpen,
            title: 'Folder Organization',
            description: 'Organize your prompts in hierarchical folders',
            details: [
                'Create nested folders (unlimited depth)',
                'Drag and drop to organize',
                'Color-coded folders with emojis',
                'Move prompts between folders',
                'Filter by folder in dashboard',
                'Export folder structure'
            ]
        },
        {
            icon: Tag,
            title: 'Tags & Categories',
            description: 'Categorize and tag your prompts for easy discovery',
            details: [
                'Multiple tags per prompt',
                'Category organization',
                'Platform-specific tags (ChatGPT, Claude, etc.)',
                'Dynamic variables support',
                'Filter by tags and categories',
                'Tag-based search'
            ]
        },
        {
            icon: Download,
            title: 'Import & Export',
            description: 'Backup and restore your data in multiple formats',
            details: [
                'Export to JSON, CSV, Excel, or Markdown',
                'Import from JSON, CSV, or Excel',
                'Download templates for each format',
                'Export all data or specific scopes',
                'Preserve folder hierarchy',
                'Bulk import/export support'
            ]
        },
        {
            icon: Search,
            title: 'Advanced Search',
            description: 'Find prompts quickly with powerful search',
            details: [
                'Full-text search across prompts',
                'Search by title, content, or tags',
                'Real-time search results',
                'Filter by folder, category, or platform',
                'Sort by date, popularity, or name',
                'Save search queries'
            ]
        },
        {
            icon: Heart,
            title: 'Like & Save',
            description: 'Engage with prompts and save your favorites',
            details: [
                'Like prompts from the community',
                'Save prompts to your collection',
                'View liked and saved prompts',
                'Track engagement metrics',
                'Share favorite prompts',
                'Personal favorites list'
            ]
        },
        {
            icon: BarChart3,
            title: 'Statistics & Analytics',
            description: 'Track your prompt usage and performance',
            details: [
                'View prompt usage statistics',
                'Track copy and view counts',
                'See most popular prompts',
                'Analytics dashboard',
                'Export statistics',
                'Performance insights'
            ]
        },
        {
            icon: User,
            title: 'User Profile',
            description: 'Manage your account and preferences',
            details: [
                'Update profile information',
                'Change password and email',
                'Manage account settings',
                'Theme preferences (light/dark)',
                'Notification settings',
                'Privacy controls'
            ]
        }
    ];

    const howToUse = [
        {
            step: 1,
            title: 'Create Your Account',
            description: 'Sign up for free and start organizing your AI prompts',
            icon: User,
            action: 'Get Started',
            href: route('register')
        },
        {
            step: 2,
            title: 'Create Your First Prompt',
            description: 'Click "Create Prompt" and add your AI prompt with title, description, and content',
            icon: FileText,
            action: 'Create Prompt',
            href: route('prompt.create')
        },
        {
            step: 3,
            title: 'Organize with Folders',
            description: 'Create folders to group related prompts together. Use colors and emojis for visual organization',
            icon: FolderOpen,
            action: 'Go to Dashboard',
            href: route('dashboard')
        },
        {
            step: 4,
            title: 'Add Tags & Categories',
            description: 'Tag your prompts with relevant keywords and assign categories for easy filtering',
            icon: Tag,
            action: 'Explore Features',
            href: '#features'
        },
        {
            step: 5,
            title: 'Import Existing Data',
            description: 'Import your prompts from JSON, CSV, or Excel files using our import templates',
            icon: Upload,
            action: 'Download Template',
            href: route('dashboard')
        },
        {
            step: 6,
            title: 'Export & Backup',
            description: 'Regularly export your data to backup your prompts and folders',
            icon: Download,
            action: 'Learn More',
            href: '#import-export'
        }
    ];

    const exportFormats = [
        {
            format: 'JSON',
            icon: FileJson,
            description: 'Complete data structure with all relationships',
            features: ['Full folder hierarchy', 'All metadata', 'Relationships preserved', 'Best for backups']
        },
        {
            format: 'CSV',
            icon: FileSpreadsheet,
            description: 'Simple spreadsheet format, easy to edit',
            features: ['Excel compatible', 'Easy to edit', 'Prompts only', 'Great for bulk editing']
        },
        {
            format: 'Excel',
            icon: FileSpreadsheet,
            description: 'Multi-sheet workbook format',
            features: ['Multiple sheets', 'Formatted data', 'Charts support', 'Professional format']
        },
        {
            format: 'Markdown',
            icon: FileCode,
            description: 'Documentation format for sharing',
            features: ['Readable format', 'Version control friendly', 'Easy to share', 'Documentation ready']
        }
    ];

    return (
        <WebLayout title="Features - AI Nots">
            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors min-h-screen">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-gray-900 dark:from-white via-gray-800 dark:via-gray-200 to-black dark:to-gray-400 bg-clip-text text-transparent">
                                    Features Showcase
                                </span>
                            </h1>
                            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                                Discover all the powerful features that help you organize, manage, and share your AI prompts efficiently
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900 font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-950 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                                >
                                    Go to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Stats */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Features', value: '8+', icon: Sparkles },
                                { label: 'Export Formats', value: '4', icon: Download },
                                { label: 'Organization', value: 'Unlimited', icon: FolderOpen },
                                { label: 'Free Forever', value: 'Yes', icon: Star }
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="p-3 bg-gray-900 dark:bg-white rounded-lg w-fit mx-auto mb-3">
                                        <stat.icon className="w-6 h-6 text-white dark:text-gray-900" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Features Grid */}
                <section id="features" className="py-16 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                                    Powerful Features
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Everything you need to manage your AI prompts effectively
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gray-900 dark:bg-white rounded-lg group-hover:scale-110 transition-transform">
                                            <feature.icon className="w-6 h-6 text-white dark:text-gray-900" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {feature.details.map((detail, detailIdx) => (
                                            <li key={detailIdx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <CheckCircle2 className="w-4 h-4 text-gray-900 dark:text-white mt-0.5 flex-shrink-0" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How to Use Section */}
                <section className="py-16 sm:py-20 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                                    How to Get Started
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Follow these simple steps to start managing your AI prompts
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-8">
                                {howToUse.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row gap-6 items-start bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 rounded-lg flex items-center justify-center text-white dark:text-gray-900 font-bold text-2xl">
                                                {item.step}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-gray-900 dark:text-white">
                                                    <item.icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                                {item.description}
                                            </p>
                                            <Link
                                                href={item.href}
                                                className="inline-flex items-center gap-2 bg-white dark:bg-gray-950 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                                            >
                                                {item.action}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Import/Export Details */}
                <section id="import-export" className="py-16 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                                    Import & Export Formats
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Choose the format that works best for your workflow
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {exportFormats.map((format, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all">
                                    <div className="mb-4">
                                        <div className="p-3 bg-gray-900 dark:bg-white rounded-lg w-fit mb-4">
                                            <format.icon className="w-6 h-6 text-white dark:text-gray-900" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{format.format}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{format.description}</p>
                                    </div>
                                    <ul className="space-y-2">
                                        {format.features.map((feat, featIdx) => (
                                            <li key={featIdx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <CheckCircle2 className="w-4 h-4 text-gray-900 dark:text-white mt-0.5 flex-shrink-0" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-md">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Export Scopes</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Choose what to export based on your needs</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { name: 'All Data', desc: 'Prompts + Folders + Relationships', icon: Database },
                                    { name: 'Prompts Only', desc: 'Just your prompts data', icon: FileText },
                                    { name: 'Folders Only', desc: 'Folder structure only', icon: FolderOpen }
                                ].map((scope, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                                        <div className="p-2 bg-gray-900 dark:bg-white rounded-lg w-fit mb-3">
                                            <scope.icon className="w-5 h-5 text-white dark:text-gray-900" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{scope.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{scope.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tips & Best Practices */}
                <section className="py-16 sm:py-20 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                                    Tips & Best Practices
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Get the most out of AI Nots with these helpful tips
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: FolderOpen,
                                    title: 'Organize with Folders',
                                    tip: 'Create a folder structure that matches your workflow. Use colors and emojis to make folders easily recognizable.'
                                },
                                {
                                    icon: Tag,
                                    title: 'Use Tags Wisely',
                                    tip: 'Tag prompts with relevant keywords. This makes searching much easier and helps you find related prompts quickly.'
                                },
                                {
                                    icon: Download,
                                    title: 'Regular Backups',
                                    tip: 'Export your data regularly (weekly or monthly) to ensure you never lose your prompts. JSON format is best for complete backups.'
                                },
                                {
                                    icon: Search,
                                    title: 'Effective Search',
                                    tip: 'Use specific keywords in your prompt titles and descriptions. This improves search results and makes prompts easier to find.'
                                },
                                {
                                    icon: Shield,
                                    title: 'Privacy Control',
                                    tip: 'Set prompts as private if they contain sensitive information. Public prompts can be discovered by the community.'
                                },
                                {
                                    icon: Copy,
                                    title: 'Quick Copy',
                                    tip: 'Use the copy button to quickly copy prompts to your clipboard. This saves time when using prompts in AI tools.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gray-900 dark:bg-white rounded-lg">
                                            <item.icon className="w-5 h-5 text-white dark:text-gray-900" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {item.tip}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 sm:py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 rounded-2xl p-8 sm:p-12 text-center shadow-2xl">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white dark:text-gray-900">
                                Ready to Get Started?
                            </h2>
                            <p className="text-lg sm:text-xl mb-8 text-gray-200 dark:text-gray-700 max-w-2xl mx-auto">
                                Join thousands of users managing their AI prompts with AI Nots
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-lg"
                                >
                                    Create Free Account
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 bg-transparent border-2 border-white dark:border-gray-900 text-white dark:text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-900/10 transition-all duration-200"
                                >
                                    View Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </WebLayout>
    );
}
