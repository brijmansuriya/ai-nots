import React from 'react';
import WebLayout from '@/layouts/web-layout';
import {
  Sparkles,
  ShieldCheck,
  Globe,
  Filter,
  Clock,
  Share2,
  Lightbulb,
  Zap,
  Users,
  Target,
  ArrowRight,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function About() {
  return (
    <WebLayout title="About AI-Nots">
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 dark:from-white via-gray-800 dark:via-gray-200 to-black dark:to-gray-400 bg-clip-text text-transparent">
                  About AI-Nots
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                Empowering creators, developers, and innovators to unlock the full potential of AI through powerful, shareable prompts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={route('home')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900 font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Explore Prompts
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href={route('register')}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-950 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission */}
              <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gray-900 dark:bg-white rounded-lg">
                    <Target className="w-8 h-8 text-white dark:text-gray-900" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  To democratize AI creativity by providing a platform where anyone can create, organize, and share powerful AI prompts. We believe that great ideas should be accessible to everyone, regardless of technical expertise.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gray-900 dark:bg-white rounded-lg">
                    <Rocket className="w-8 h-8 text-white dark:text-gray-900" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  To become the world's leading platform for AI prompt discovery and collaboration, fostering a global community of creators who push the boundaries of what's possible with artificial intelligence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose AI-Nots Section */}
        <section className="py-16 sm:py-20 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                  Why Choose AI-Nots?
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to harness the power of AI prompts in one place
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Create & Save"
                description="Craft and store unlimited prompts tailored to your specific needs. Build your personal library of AI prompts for instant access."
              />
              <FeatureCard
                icon={<Filter className="w-6 h-6" />}
                title="Smart Organization"
                description="Organize prompts with tags, categories, and platforms. Find exactly what you need with powerful search and filtering."
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title="Global Sharing"
                description="Share your prompts with the world or explore thousands of community-created prompts for inspiration."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-6 h-6" />}
                title="Privacy First"
                description="Keep your prompts private or share them publicly. You have full control over your content and data."
              />
              <FeatureCard
                icon={<Clock className="w-6 h-6" />}
                title="Save Time"
                description="Reuse prompts for repetitive tasks. Build workflows that streamline your creative and development process."
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Collaborate"
                description="Work together with your team. Share prompts, get feedback, and build amazing things together."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get started in minutes and unlock the power of AI prompts
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: 'Sign Up & Create Account',
                    description: 'Join our community in seconds. Create your free account and start building your prompt library.',
                    icon: <Users className="w-6 h-6" />
                  },
                  {
                    step: 2,
                    title: 'Create Your First Prompt',
                    description: 'Use our intuitive editor to create prompts. Add descriptions, tags, and organize them by category.',
                    icon: <Zap className="w-6 h-6" />
                  },
                  {
                    step: 3,
                    title: 'Organize & Tag',
                    description: 'Categorize your prompts with tags and platforms. Build a searchable library that grows with you.',
                    icon: <Filter className="w-6 h-6" />
                  },
                  {
                    step: 4,
                    title: 'Share or Keep Private',
                    description: 'Choose to share your prompts with the community or keep them private for personal use.',
                    icon: <Share2 className="w-6 h-6" />
                  },
                  {
                    step: 5,
                    title: 'Discover & Explore',
                    description: 'Browse thousands of community prompts. Get inspired, learn new techniques, and find exactly what you need.',
                    icon: <Lightbulb className="w-6 h-6" />
                  }
                ].map((item, index) => (
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
                          {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 sm:py-20 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                  Key Features
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                'Unlimited prompt storage',
                'Advanced search and filtering',
                'Tag and category organization',
                'Public and private sharing',
                'Copy prompts with one click',
                'Dynamic variable support',
                'Platform-specific prompts',
                'Community-driven content'
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 rounded-lg p-4 border border-gray-200 dark:border-gray-800"
                >
                  <CheckCircle2 className="w-5 h-5 text-gray-900 dark:text-white flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                  Use Cases
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover how AI-Nots can transform your workflow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UseCaseCard
                icon={<Lightbulb className="w-8 h-8" />}
                title="Content Creation"
                description="Generate unique ideas for blogs, social media, and marketing content. Create engaging copy that resonates with your audience."
              />
              <UseCaseCard
                icon={<Zap className="w-8 h-8" />}
                title="Development"
                description="Speed up coding tasks with AI-assisted prompts. Generate code, debug, and automate repetitive development workflows."
              />
              <UseCaseCard
                icon={<Share2 className="w-8 h-8" />}
                title="Team Collaboration"
                description="Share prompts with your team. Build a shared library of proven prompts that everyone can use and improve."
              />
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
                Join thousands of creators, developers, and innovators who are already using AI-Nots to unlock their creative potential.
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
                  href={route('home')}
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-white dark:border-gray-900 text-white dark:text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-900/10 transition-all duration-200"
                >
                  Explore Prompts
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </WebLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-900 dark:bg-white rounded-lg group-hover:scale-110 transition-transform">
          <div className="text-white dark:text-gray-900">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function UseCaseCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all">
      <div className="mb-4 text-gray-900 dark:text-white">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
